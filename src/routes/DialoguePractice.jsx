import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useChild } from '../hooks/useChild.js'
import { useStars } from '../hooks/useStars.js'
import { getLearningState, saveGameSession } from '../lib/game.js'
import { enqueue, isOnline } from '../lib/offline.js'
import { CHARACTERS } from '../config/characters.js'
import { pickRandomRounds } from '../lib/english/courses/index.js'
import DialogueBubble from '../components/dialogue/DialogueBubble.jsx'
import ChoicePanel from '../components/dialogue/ChoicePanel.jsx'

const ROUNDS_PER_SESSION = 8

export default function DialoguePractice() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { activeChild } = useChild()
  const { totalEarned, addStars, refreshStars } = useStars()
  const navigatedRef = useRef(false)

  const character = searchParams.get('char') || 'dragon'
  const subject = searchParams.get('subject') || 'english'
  const grade = parseInt(searchParams.get('grade')) || 3

  // gameKey 递增时重新开始对话
  const [gameKey, setGameKey] = useState(0)

  // 阶段
  const [phase, setPhase] = useState('loading') // loading | playing | result
  const [lines, setLines] = useState([])       // 展平的 8 轮对话
  const [roundIndex, setRoundIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [results, setResults] = useState([])
  const [typingDone, setTypingDone] = useState(false)
  const [isFinishing, setIsFinishing] = useState(false)

  // 重播 key，触发 DialogueBubble 重新朗读
  const [replayKey, setReplayKey] = useState(0)

  // 如果没有选孩子，跳转
  useEffect(() => {
    if (!activeChild && !navigatedRef.current) {
      navigatedRef.current = true
      navigate('/select-child', { replace: true })
    }
  }, [activeChild, navigate])

  // gameKey 变化时启动新对话
  useEffect(() => {
    if (!activeChild) return

    // 新管道：从 courses/ 加载全部单元
    const allUnitIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    const picked = pickRandomRounds(allUnitIds, ROUNDS_PER_SESSION)
    // 打乱选项顺序
    const lines = picked.map((d) => ({
      ...d,
      choices: [...d.choices].sort(() => Math.random() - 0.5),
    }))

    setLines(lines)
    setRoundIndex(0)
    setScore(0)
    setResults([])
    setTypingDone(false)
    setPhase('playing')
  }, [activeChild, gameKey])

  // 打字完成回调
  const handleTypingDone = useCallback(() => {
    setTypingDone(true)
  }, [])

  // 答完一轮
  const handleRoundComplete = useCallback((isCorrect) => {
    setResults((prev) => [...prev, { round: roundIndex + 1, correct: isCorrect }])
    if (isCorrect) {
      setScore((s) => s + 1)
    }

    if (roundIndex + 1 >= lines.length) {
      setIsFinishing(true)
    } else {
      setRoundIndex((i) => i + 1)
      setTypingDone(false)
    }
  }, [roundIndex, lines])

  // 全部完成后进入结算
  useEffect(() => {
    if (isFinishing) {
      const timer = setTimeout(() => {
        setPhase('result')
        setIsFinishing(false)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [isFinishing])

  // 保存记录 + 星星
  const handleFinish = useCallback(async () => {
    if (!activeChild) return

    const totalRounds = lines.length
    const correctCount = results.filter((r) => r.correct).length
    const wrongCount = totalRounds - correctCount

    const sessionData = {
      user_id: activeChild.user_id,
      child_id: activeChild.child_id,
      client_session_id: `dialogue_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      played_on: new Date().toISOString().split('T')[0],
      character,
      correct_count: correctCount,
      wrong_count: wrongCount,
      results: results.map((r) => ({
        questionIndex: r.round - 1,
        questionId: lines[r.round - 1]?.id || 'dialogue',
        correct: r.correct,
        type: 'dialogue',
      })),
    }

    if (isOnline()) {
      const { error } = await saveGameSession(sessionData)
      if (error) enqueue(sessionData)
    } else {
      enqueue(sessionData)
    }

    if (correctCount > 0) {
      addStars(correctCount, correctCount)
      refreshStars()
    }
  }, [activeChild, results, lines, character, addStars, refreshStars])

  const handlePlayAgain = useCallback(() => {
    handleFinish()
    setGameKey((k) => k + 1)
    setPhase('loading')
  }, [handleFinish])

  const handleGoHome = useCallback(() => {
    handleFinish()
    navigate('/select-child')
  }, [handleFinish, navigate])

  // 重播当前句子
  const handleReplay = useCallback(() => {
    setReplayKey((k) => k + 1)
  }, [])

  if (!activeChild) return null

  // === 加载中（初始化对话）===
  if (phase === 'loading') {
    return (
      <div className="bg-question-purple min-h-screen flex items-center justify-center">
        <p className="text-white/60 text-lg">加载对话中...</p>
      </div>
    )
  }

  // === 对话中 ===
  if (phase === 'playing') {
    const currentLine = lines[roundIndex]

    return (
      <div className="bg-question-purple min-h-screen flex flex-col">
        <header className="relative z-10">
          <div className="max-w-lg mx-auto px-4 py-4">
            <div className="flex items-center justify-between header-light">
              <button onClick={() => navigate('/select-child')} className="back-btn">← 返回</button>
              <h1>💬 对话练习</h1>
              <span className="stars-display">⭐ {score}</span>
            </div>
          </div>
        </header>

        <div className="relative z-10 flex justify-center px-4 mb-4">
          <div className="progress-dots">
            {Array.from({ length: lines.length }, (_, i) => {
              let dotClass = 'progress-dot'
              if (i === roundIndex) dotClass += ' active'
              else if (i < roundIndex) {
                const res = results.find((r) => r.round === i + 1)
                dotClass += res?.correct ? ' correct' : ' wrong'
              }
              return <span key={i} className={dotClass} />
            })}
          </div>
        </div>

        <main className="flex-1 flex flex-col justify-center px-4 pb-8 relative z-10 space-y-6">
          {currentLine && (
            <div>
              <DialogueBubble
                key={replayKey}
                characterId={character}
                text={currentLine.npc}
                cn={currentLine.cn}
                onTypingDone={handleTypingDone}
                autoSpeak={true}
              />
              {/* 重播按钮 — typing 结束后显示 */}
              {typingDone && (
                <div className="flex justify-center mt-2">
                  <button
                    onClick={handleReplay}
                    className="px-4 py-1.5 rounded-full bg-white/10 text-white/60 hover:text-white hover:bg-white/20 text-xs font-semibold transition-all"
                  >
                    🔁 重播
                  </button>
                </div>
              )}
            </div>
          )}

          {typingDone && currentLine && (
            <ChoicePanel
              choices={currentLine.choices}
              onComplete={handleRoundComplete}
              disabled={isFinishing}
            />
          )}
        </main>
      </div>
    )
  }

  // === 结算 ===
  const correctCount = results.filter((r) => r.correct).length

  return (
    <div className="bg-question-purple min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="max-w-sm w-full space-y-6 text-center">
          <div className="text-7xl mb-2 character-celebrate">
            <img
              src={`images/${CHARACTERS.find(c => c.id === character)?.image || character}_happy.png`}
              alt=""
              className="w-28 h-28 mx-auto object-contain"
              onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.textContent = '🎉' }}
            />
          </div>

          <h2 className="text-2xl font-black text-white drop-shadow-sm">对话完成！</h2>

          <div className="glass-card p-6 space-y-4">
            <div className="text-5xl font-black text-yellow-300">
              {correctCount} / {lines.length}
            </div>
            <p className="text-white/70 text-sm">答对</p>

            <div className="flex justify-center gap-6 text-sm">
              <div className="text-center">
                <div className="text-green-400 font-bold text-xl">{correctCount}</div>
                <div className="text-white/50 text-xs">✅ 正确</div>
              </div>
              <div className="text-center">
                <div className="text-red-400 font-bold text-xl">{lines.length - correctCount}</div>
                <div className="text-white/50 text-xs">❌ 错误</div>
              </div>
              <div className="text-center">
                <div className="text-yellow-400 font-bold text-xl">{correctCount}</div>
                <div className="text-white/50 text-xs">⭐ 星星</div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={handlePlayAgain} className="btn-game-primary flex-1">
              🔄 再来一次
            </button>
            <button onClick={handleGoHome} className="btn-game-secondary flex-1">
              🏠 返回首页
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
