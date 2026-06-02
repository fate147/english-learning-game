import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChild } from '../hooks/useChild.js'
import { useGameSession } from '../hooks/useGameSession.js'
import { useStars } from '../hooks/useStars.js'
import { WORDS, getWordsByUnit } from '../lib/words.js'
import { GAME_QUESTIONS_PER_ROUND } from '../config/index.js'
import { getLearningState } from '../lib/game.js'
import { saveGameSession } from '../lib/game.js'
import { calcScore } from '../engines/scoring.js'
import { enqueue, isOnline } from '../lib/offline.js'

import StartScreen from '../components/game/StartScreen.jsx'
import ProgressBar from '../components/game/ProgressBar.jsx'
import StarCounter from '../components/game/StarCounter.jsx'
import ComboIndicator from '../components/game/ComboIndicator.jsx'
import ResultScreen from '../components/game/ResultScreen.jsx'
import ImageChoice from '../components/question/ImageChoice.jsx'
import LetterFill from '../components/question/LetterFill.jsx'
import FeedbackOverlay from '../components/question/FeedbackOverlay.jsx'
import PageShell from '../components/ui/PageShell.jsx'
import Card from '../components/ui/Card.jsx'
import { getWordById } from '../lib/words.js'
import { getRandomDialogue } from '../config/characters.js'

export default function Game() {
  const navigate = useNavigate()
  const { activeChild } = useChild()
  const { results, gameState, startGame, submitAnswer, nextQuestion, resetGame, currentQuestion, currentIndex, score, combo } = useGameSession()
  const { totalEarned, level, addStars, refreshStars } = useStars()

  const [character, setCharacter] = useState('dragon')
  const [showFeedback, setShowFeedback] = useState(false)
  const [lastCorrect, setLastCorrect] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [dialogue, setDialogue] = useState('')
  const [charExpression, setCharExpression] = useState('neutral')
  const navigatedRef = useRef(false)

  // 如果没有选孩子，跳转（useEffect 避免 render 时导航）
  useEffect(() => {
    if (!activeChild && !navigatedRef.current) {
      navigatedRef.current = true
      navigate('/select-child', { replace: true })
    }
  }, [activeChild, navigate])

  if (!activeChild) return null

  const handleStart = useCallback(async (selectedChar) => {
    setCharacter(selectedChar || 'dino')
    // 获取家长解锁的单词 — 优先读 localStorage 缓存
    let unlockedIds = []
    if (activeChild) {
      const cacheKey = 'eng_learning_state_' + activeChild.child_id
      let cached = null
      try {
        const raw = localStorage.getItem(cacheKey)
        if (raw) cached = JSON.parse(raw)
      } catch {}
      if (cached?.unlockedWords?.length) {
        unlockedIds = cached.unlockedWords
      } else {
        // 缓存未命中才调 Supabase
        const { data: state } = await getLearningState(activeChild.user_id, activeChild.child_id)
        if (state?.unlocked_words) {
          unlockedIds = state.unlocked_words
          // 写缓存
          try { localStorage.setItem(cacheKey, JSON.stringify({ unlockedWords: state.unlocked_words })) } catch {}
        }
      }
    }
    // 如果家长未解锁任何词，默认用单元1
    if (unlockedIds.length === 0) {
      unlockedIds = getWordsByUnit(1).map((w) => w.id)
    }
    // 确定这些词分布在哪些单元
    const wordProgressMap = {}
    const learnedWords = []
    // 找到第一个有解锁词的单元
    const firstUnit = WORDS.find((w) => unlockedIds.includes(w.id))?.unit || 1

    startGame({
      unit: firstUnit,
      wordProgressMap,
      unlockedWords: unlockedIds,
      learnedWords,
    })
  }, [startGame, activeChild])

  const handleAnswer = useCallback((isCorrect) => {
    if (isProcessing) return
    setIsProcessing(true)

    submitAnswer(currentIndex, isCorrect)

    const isLetterFill = currentQuestion?.type === 'letter_fill'

    if (isLetterFill) {
      // 字母填空已内部处理反馈和延迟，直接前进
      nextQuestion()
      setIsProcessing(false)
    } else {
      // 听音选图：用外部 FeedbackOverlay
      setLastCorrect(isCorrect)
      setShowFeedback(true)
      setDialogue(getRandomDialogue(character, isCorrect))
      setCharExpression(isCorrect ? 'correct' : 'wrong')

      const nextDelay = isCorrect ? 1000 : 3500
      setTimeout(() => {
        setShowFeedback(false)
        setIsProcessing(false)
        nextQuestion()
      }, nextDelay)
    }
  }, [currentIndex, submitAnswer, nextQuestion, isProcessing, currentQuestion, character])

  const handleFinish = useCallback(async () => {
    // 保存游戏记录
    if (!activeChild || !results) return

    const sessionData = {
      user_id: activeChild.user_id,
      child_id: activeChild.child_id,
      client_session_id: results.sessionId,
      played_on: new Date().toISOString().split('T')[0],
      character: character || 'dino',
      correct_count: results.correctCount,
      wrong_count: results.wrongCount,
      results: results.answers,
    }

    if (isOnline()) {
      const { error } = await saveGameSession(sessionData)
      if (error) {
        enqueue(sessionData)
      }
    } else {
      enqueue(sessionData)
    }

    // 判断每日首次
    const todayKey = 'eng_game_last_date_' + activeChild.child_id
    const lastDate = localStorage.getItem(todayKey)
    const today = new Date().toISOString().split('T')[0]
    const isFirstToday = lastDate !== today

    // 判断连续7天（简化版：检查 localStorage 中最近7天都有记录）
    const streakKey = 'eng_game_streak_' + activeChild.child_id
    let streakDays = parseInt(localStorage.getItem(streakKey) || '0')
    if (isFirstToday) {
      // 检查昨天有没有玩
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]
      if (lastDate === yesterdayStr) {
        streakDays += 1
      } else {
        streakDays = 1
      }
      localStorage.setItem(streakKey, String(streakDays))
      localStorage.setItem(todayKey, today)
    }
    const isStreak7Days = streakDays >= 7

    const { totalAdd, availableAdd } = calcScore(
      results.correctCount,
      results.maxCombo,
      results.isPerfect,
      isFirstToday,
      isStreak7Days
    )
    if (totalAdd > 0) {
      addStars(totalAdd, availableAdd) // 不 await，后台同步
      refreshStars()
    }
  }, [activeChild, results, addStars, refreshStars, character])

  const handlePlayAgain = useCallback(() => {
    handleFinish() // 不 await，后台保存
    handleStart(character)
  }, [handleFinish, handleStart, character])

  const handleGoHome = useCallback(() => {
    handleFinish() // 不 await，后台保存
    resetGame()
    navigate('/select-child')
  }, [handleFinish, resetGame, navigate])

  // 开始界面
  if (gameState === 'idle') {
    return (
      <StartScreen
        onStart={handleStart}
        totalEarnedStars={totalEarned}
        level={level}
        defaultChar={character}
        onBack={() => { resetGame(); navigate('/select-child') }}
      />
    )
  }

  // 游戏结束
  if (gameState === 'finished') {
    return (
      <ResultScreen
        results={results}
        onPlayAgain={handlePlayAgain}
        onGoHome={handleGoHome}
      />
    )
  }

  // 游戏中
  return (
    <PageShell onBack={() => navigate('/select-child')}>
      <Card className="max-w-lg mx-auto page-enter">
        {/* 顶部栏 */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate('/select-child')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← 返回
          </button>
          <div className="flex-1">
            <ProgressBar current={currentIndex + 1} total={GAME_QUESTIONS_PER_ROUND} />
          </div>
          <StarCounter score={score} combo={combo} />
        </div>

        {/* 题目区域 */}
        {currentQuestion?.type === 'image_choice' ? (
          <ImageChoice
            question={currentQuestion}
            onAnswer={handleAnswer}
            unit={WORDS.find(w => w.id === currentQuestion?.wordId)?.unit || 1}
            disabled={isProcessing}
          />
        ) : currentQuestion?.type === 'letter_fill' ? (
          <LetterFill
            question={currentQuestion}
            onAnswer={handleAnswer}
            unit={WORDS.find(w => w.id === currentQuestion?.wordId)?.unit || 1}
          />
        ) : (
          <div className="text-center text-gray-400 py-12">加载题目中...</div>
        )}

        {/* 连击提示 */}
        <ComboIndicator combo={combo} />
      </Card>

      {/* 反馈气泡 */}
      {showFeedback && (
        <FeedbackOverlay
          isCorrect={lastCorrect}
          word={getWordById(currentQuestion?.wordId)}
          onComplete={() => {}}
          characterId={character}
          expression={charExpression}
          dialogue={dialogue}
          score={score}
        />
      )}
    </PageShell>
  )
}
