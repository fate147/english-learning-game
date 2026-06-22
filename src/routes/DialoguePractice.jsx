import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useChild } from '../hooks/useChild.js'
import { useStars } from '../hooks/useStars.js'
import { saveGameSession, getLocalDateString } from '../lib/game.js'
import { enqueue, isOnline } from '../lib/offline.js'
import { calcScore } from '../engines/scoring.js'
import { CHARACTERS } from '../config/characters.js'
import { pickRandomRounds } from '../lib/english/courses/index.js'
import DialogueBubble from '../components/dialogue/DialogueBubble.jsx'
import ChoicePanel from '../components/dialogue/ChoicePanel.jsx'
import GameHeader from '../components/ui/GameHeader.jsx'
import Button from '../components/ui/Button.jsx'
import ProgressDots from '../components/ui/ProgressDots.jsx'

const ROUNDS_PER_SESSION = 8

export default function DialoguePractice() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { activeChild } = useChild()
  const { addStars, refreshStars } = useStars()
  const navigatedRef = useRef(false)

  const character = searchParams.get('char') || 'dragon'
  const subject = searchParams.get('subject') || 'english'
  const grade = parseInt(searchParams.get('grade')) || 3
  const charConfig = CHARACTERS.find(c => c.id === character) || CHARACTERS[0]

  const [gameKey, setGameKey] = useState(0)
  const [phase, setPhase] = useState('loading')
  const [lines, setLines] = useState([])
  const [roundIndex, setRoundIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [results, setResults] = useState([])
  const [typingDone, setTypingDone] = useState(false)
  const [isFinishing, setIsFinishing] = useState(false)
  const [replayKey, setReplayKey] = useState(0)

  useEffect(() => {
    if (!activeChild && !navigatedRef.current) {
      navigatedRef.current = true
      navigate('/select-child', { replace: true })
    }
  }, [activeChild, navigate])

  useEffect(() => {
    if (!activeChild) return
    // 暂时只出下学期（7-12），后续调回 1-12
    const allUnitIds = [7, 8, 9, 10, 11, 12]
    const picked = pickRandomRounds(allUnitIds, ROUNDS_PER_SESSION)
    const lines = picked.map((d) => ({
      ...d,
      choices: [...d.choices].sort(() => Math.random() - 0.5),
    }))
    setLines(lines)
    setRoundIndex(0)
    setScore(0)
    setCombo(0)
    setMaxCombo(0)
    setResults([])
    setTypingDone(false)
    setPhase('playing')
  }, [activeChild, gameKey])

  const handleTypingDone = useCallback(() => setTypingDone(true), [])

  const handleRoundComplete = useCallback((isCorrect) => {
    setResults((prev) => [...prev, { round: roundIndex + 1, correct: isCorrect }])
    if (isCorrect) {
      setScore((s) => s + 1)
      setCombo((c) => {
        const newCombo = c + 1
        setMaxCombo((m) => Math.max(m, newCombo))
        return newCombo
      })
    } else {
      setCombo(0)
    }
    if (roundIndex + 1 >= lines.length) {
      setIsFinishing(true)
    } else {
      setRoundIndex((i) => i + 1)
      setTypingDone(false)
    }
  }, [roundIndex, lines])

  useEffect(() => {
    if (isFinishing) {
      const timer = setTimeout(() => { setPhase('result'); setIsFinishing(false) }, 800)
      return () => clearTimeout(timer)
    }
  }, [isFinishing])

  const handleFinish = useCallback(async () => {
    if (!activeChild) return
    const totalRounds = lines.length
    const correctCount = results.filter((r) => r.correct).length
    const wrongCount = totalRounds - correctCount
    const isPerfect = correctCount === totalRounds && totalRounds > 0

    const sessionData = {
      user_id: activeChild.user_id,
      child_id: activeChild.child_id,
      subject,
      grade,
      client_session_id: `dialogue_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      played_on: getLocalDateString(),
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
    } else { enqueue(sessionData) }

    // 计算奖励（复用 scoring.js，与主游戏一致）
    const todayKey = 'dialogue_last_date_' + activeChild.child_id
    const lastDate = localStorage.getItem(todayKey)
    const today = getLocalDateString()
    const isFirstToday = lastDate !== today
    if (isFirstToday) localStorage.setItem(todayKey, today)

    const streakKey = 'dialogue_streak_' + activeChild.child_id
    let streakDays = parseInt(localStorage.getItem(streakKey) || '0')
    if (isFirstToday) {
      const yesterdayStr = getLocalDateString(-1)
      streakDays = lastDate === yesterdayStr ? streakDays + 1 : 1
      localStorage.setItem(streakKey, String(streakDays))
    }
    const isStreak7Days = streakDays >= 7

    const { totalAdd, availableAdd } = calcScore(correctCount, maxCombo, isPerfect, isFirstToday, isStreak7Days)
    if (totalAdd > 0) {
      addStars(totalAdd, availableAdd).then(({ error }) => {
        if (!error) refreshStars()
      })
    }
  }, [activeChild, results, lines, character, subject, grade, maxCombo, addStars, refreshStars])

  const handlePlayAgain = useCallback(async () => {
    await handleFinish()
    setGameKey((k) => k + 1)
    setPhase('loading')
  }, [handleFinish])

  const handleGoHome = useCallback(async () => {
    await handleFinish()
    navigate('/select-child')
  }, [handleFinish, navigate])

  const handleReplay = useCallback(() => setReplayKey((k) => k + 1), [])

  if (!activeChild) return null

  // ===== 加载中 =====
  if (phase === 'loading') {
    return (
      <div className="bg-question-purple min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/20 bg-white/10 dialogue-avatar-frame dialogue-speaking">
          <img
            src={`images/${charConfig.image}_happy.png`}
            alt={charConfig.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.textContent = charConfig.emoji }}
          />
        </div>
        <div className="text-center">
          <p className="text-white font-bold text-lg">准备对话中...</p>
          <p className="text-white/50 text-sm mt-1">{charConfig.name} 在等你</p>
        </div>
        <div className="flex gap-1.5 mt-2">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{animationDelay: `${i * 150}ms`}} />
          ))}
        </div>
      </div>
    )
  }

  // ===== 对话中 =====
  if (phase === 'playing') {
    const currentLine = lines[roundIndex]
    const accuracy = results.length > 0 ? Math.round((score / results.length) * 100) : 100

    return (
      <div className="bg-question-purple min-h-screen flex flex-col">
        <GameHeader
          onBack={() => navigate('/select-child')}
          title="💬 对话练习"
          stars={score}
        />

        <ProgressDots
          total={lines.length}
          current={roundIndex}
          answers={results.map((r) => ({ correct: r.correct }))}
        />

        {/* 实时准确率 */}
        {results.length > 0 && (
          <div className="flex justify-center mb-2">
            <span className={`text-xs font-bold px-3 py-0.5 rounded-full
              ${accuracy >= 80 ? 'bg-green-500/20 text-green-300' : 'bg-amber-500/20 text-amber-300'}`}>
              {accuracy}% 正确率
            </span>
          </div>
        )}

        <main className="flex-1 flex flex-col justify-center px-4 pb-8 relative z-10 space-y-5">
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
              {typingDone && (
                <div className="flex justify-center mt-2">
                  <button
                    onClick={handleReplay}
                    className="px-4 py-1.5 rounded-full bg-white/15 text-white/60 hover:text-white hover:bg-white/25 text-xs font-semibold transition-all"
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

  // ===== 结算 =====
  const correctCount = results.filter((r) => r.correct).length
  const total = lines.length
  const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0

  return (
    <div className="bg-question-purple min-h-screen flex flex-col relative overflow-hidden">
      <div className="confetti-container">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="confetti-piece"
            style={{
              left: `${(i / 12) * 100}%`,
              background: ['#ff6b9d', '#fbbf24', '#4ade80', '#4d96ff', '#c084fc', '#fb923c'][i % 6],
              animationDuration: `${2 + Math.random() * 1.5}s`,
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <div className="max-w-sm w-full space-y-5 text-center">
          <div className="page-enter">
            <img
              src={`images/${charConfig.image}_happy.png`}
              alt=""
              className="w-28 h-28 mx-auto object-contain result-bounce"
              onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.textContent = '🎉' }}
            />
          </div>

          <h2 className="text-2xl font-black text-white page-enter" style={{textShadow: '0 2px 12px rgba(0,0,0,0.3)'}}>
            {accuracy === 100 ? '太棒了！全对！' : accuracy >= 75 ? '做得不错！' : '对话完成！'}
          </h2>

          <p className="guide-text max-w-xs page-enter" style={{animationDelay: '0.1s'}}>
            {accuracy === 100
              ? '每道题都答对了，你真厉害！'
              : `答对了 ${correctCount} 道题，继续加油！`
            }
          </p>

          {/* 数据卡片 */}
          <div className="flex gap-3 page-enter" style={{animationDelay: '0.15s'}}>
            <div className="flex-1 glass-card !p-3 text-center">
              <div className="text-2xl font-black text-green-400">{correctCount}</div>
              <div className="text-[10px] text-white/50 font-bold">✅ 答对</div>
            </div>
            <div className="flex-1 glass-card !p-3 text-center">
              <div className="text-2xl font-black text-red-400">{total - correctCount}</div>
              <div className="text-[10px] text-white/50 font-bold">❌ 答错</div>
            </div>
            <div className="flex-1 glass-card !p-3 text-center">
              <div className="text-2xl font-black text-amber-400">⭐ {correctCount}</div>
              <div className="text-[10px] text-white/50 font-bold">获得</div>
            </div>
          </div>

          <div className="flex gap-3 page-enter" style={{animationDelay: '0.2s'}}>
            <Button variant="game" size="xl" onClick={handlePlayAgain} className="flex-1">
              🔄 再来一次
            </Button>
            <Button variant="glass" size="xl" onClick={handleGoHome} className="flex-1">
              🏠 回首页
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
