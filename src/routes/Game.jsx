import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useChild } from '../hooks/useChild.js'
import { useGameSession } from '../hooks/useGameSession.js'
import { useStars } from '../hooks/useStars.js'
import { WORDS, getWordsByUnit, getWordById } from '../lib/words.js'
import { CHARACTERS, getRandomDialogue } from '../config/characters.js'
import { GAME_QUESTIONS_PER_ROUND } from '../config/index.js'
import { getLearningState, getWordProgress, saveGameSession } from '../lib/game.js'
import { calcScore } from '../engines/scoring.js'
import { enqueue, isOnline } from '../lib/offline.js'

import StartScreen from '../components/game/StartScreen.jsx'
import ResultScreen from '../components/game/ResultScreen.jsx'
import ImageChoice from '../components/question/ImageChoice.jsx'
import LetterFill from '../components/question/LetterFill.jsx'
import ChineseReadingChoice from '../components/question/ChineseReadingChoice.jsx'
import MathChoice from '../components/question/MathChoice.jsx'
import FeedbackOverlay from '../components/question/FeedbackOverlay.jsx'
import ComboIndicator from '../components/game/ComboIndicator.jsx'

export default function Game() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const subject = searchParams.get('subject') || 'english'
  const grade = parseInt(searchParams.get('grade')) || 3
  const { activeChild } = useChild()
  const { results, gameState, startGame, submitAnswer, nextQuestion, resetGame, currentQuestion, currentIndex, score, combo } = useGameSession()
  const { totalEarned, level, addStars, refreshStars } = useStars()

  const [character, setCharacter] = useState('dragon')
  const [showFeedback, setShowFeedback] = useState(false)
  const [lastCorrect, setLastCorrect] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
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
    setIsLoading(true)

    try {
    // 语文/数学直接开始，不需要单词数据
    if (subject !== 'english') {
      startGame({ subject, grade })
      return
    }

    // 英语：获取家长解锁的单词 — 优先读 localStorage 缓存
    let unlockedIds = []
    if (activeChild) {
      const cacheKey = subject + '_g' + grade + '_learning_state_' + activeChild.child_id
      let cached = null
      try {
        const raw = localStorage.getItem(cacheKey)
        if (raw) cached = JSON.parse(raw)
      } catch {}
      if (cached?.unlockedWords?.length) {
        unlockedIds = cached.unlockedWords
      } else {
        // 缓存未命中才调 Supabase
        const { data: state } = await getLearningState(activeChild.user_id, activeChild.child_id, subject, grade)
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
    // 加载单词进度（从 Supabase），用于分级复习
    let wordProgressMap = {}
    let learnedWords = []
    if (activeChild) {
      const { data: wpData } = await getWordProgress(activeChild.user_id, activeChild.child_id, subject, grade)
      if (wpData) {
        const now = new Date()
        wordProgressMap = {}
        wpData.forEach((wp) => {
          wordProgressMap[wp.word_id] = { level: wp.level || 0, nextReview: wp.next_review, correctCount: wp.correct_count || 0, wrongCount: wp.wrong_count || 0 }
          // 达到等级3以上的视为已掌握
          if ((wp.level || 0) >= 3) {
            learnedWords.push(wp.word_id)
          }
        })
      }
    }
    // 找到第一个有解锁词的单元
    const firstUnit = WORDS.find((w) => unlockedIds.includes(w.id))?.unit || 1

    startGame({
      unit: firstUnit,
      wordProgressMap,
      unlockedWords: unlockedIds,
      learnedWords,
    })
    } finally {
      setIsLoading(false)
    }
  }, [startGame, activeChild, subject, grade])

  const handleAnswer = useCallback((isCorrect) => {
    if (isProcessing) return
    setIsProcessing(true)

    const { newCombo } = submitAnswer(currentIndex, isCorrect) || {}

    const isLetterFill = currentQuestion?.type === 'letter_fill'

    if (isLetterFill) {
      // 字母填空已内部处理反馈和延迟，直接前进
      nextQuestion()
      setIsProcessing(false)
    } else {
      // 听音选图：用 FeedbackOverlay，onComplete 触发下一步
      setLastCorrect(isCorrect)
      setShowFeedback(true)
      setDialogue(getRandomDialogue(character, isCorrect))
      setCharExpression(isCorrect ? 'correct' : 'wrong')
    }
  }, [currentIndex, submitAnswer, nextQuestion, isProcessing, currentQuestion, character])

  const handleFinish = useCallback(async () => {
    // 保存游戏记录
    if (!activeChild || !results) return

    const sessionData = {
      user_id: activeChild.user_id,
      child_id: activeChild.child_id,
      subject,
      grade,
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
    const todayKey = subject + '_g' + grade + '_game_last_date_' + activeChild.child_id
    const lastDate = localStorage.getItem(todayKey)
    const today = new Date().toISOString().split('T')[0]
    const isFirstToday = lastDate !== today

    // 判断连续7天（简化版：检查 localStorage 中最近7天都有记录）
    const streakKey = subject + '_g' + grade + '_game_streak_' + activeChild.child_id
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

  const handleFeedbackComplete = useCallback(() => {
    setShowFeedback(false)
    setIsProcessing(false)
    nextQuestion()
  }, [nextQuestion])

  // 开始界面
  if (gameState === 'idle') {
    return (
      <>
        <StartScreen
          onStart={handleStart}
          totalEarnedStars={totalEarned}
          level={level}
          defaultChar={character}
          onBack={() => { resetGame(); navigate('/select-child') }}
        />
        {isLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 flex flex-col items-center gap-4 border border-white/20">
              <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="text-white font-bold text-lg">加载中...</span>
            </div>
          </div>
        )}
      </>
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
  const currentUnit = WORDS.find(w => w.id === currentQuestion?.wordId)?.unit || 1

  return (
    <div className={`${subject === 'chinese' ? 'bg-chinese' : subject === 'math' ? 'bg-math' : 'bg-question-purple'} min-h-screen flex flex-col`}>
      {/* 顶部栏 */}
      <header className="relative z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between header-light">
            <button onClick={() => navigate('/select-child')} className="back-btn">
              ← 返回
            </button>
            <h1>🐉 {CHARACTERS.find(c => c.id === character)?.name || '小伙伴'}</h1>
            <span className="stars-display">⭐ {score}</span>
          </div>
        </div>
      </header>

      {/* 进度点 */}
      <div className="relative z-10 flex justify-center px-4 mb-2">
        <div className="progress-dots">
          {Array.from({ length: GAME_QUESTIONS_PER_ROUND }, (_, i) => {
            let dotClass = 'progress-dot'
            if (i === currentIndex) dotClass += ' active'
            return <span key={i} className={dotClass} />
          })}
        </div>
      </div>

      {/* 主内容 */}
      <main className="flex-1 flex flex-col justify-center px-4 pb-8 relative z-10">
        {/* 题目区域 */}
        {currentQuestion?.type === 'image_choice' ? (
          <ImageChoice
            question={currentQuestion}
            onAnswer={handleAnswer}
            unit={currentUnit}
            disabled={isProcessing}
          />
        ) : currentQuestion?.type === 'letter_fill' ? (
          <LetterFill
            question={currentQuestion}
            onAnswer={handleAnswer}
            unit={currentUnit}
            disabled={isProcessing}
          />
        ) : currentQuestion?.type === 'chinese_reading' ? (
          <ChineseReadingChoice
            question={currentQuestion}
            onAnswer={handleAnswer}
            disabled={isProcessing}
          />
        ) : currentQuestion?.type === 'math_choice' ? (
          <MathChoice
            question={currentQuestion}
            onAnswer={handleAnswer}
            disabled={isProcessing}
          />
        ) : (
          <div className="text-center text-white/60 py-12">加载题目中...</div>
        )}
      </main>

      {/* 连击提示 */}
      <ComboIndicator combo={combo} />

      {/* 反馈气泡 */}
      {showFeedback && (
        <FeedbackOverlay
          isCorrect={lastCorrect}
          word={getWordById(currentQuestion?.wordId)}
          onComplete={handleFeedbackComplete}
          characterId={character}
          expression={charExpression}
          dialogue={dialogue}
          score={score}
        />
      )}
    </div>
  )
}
