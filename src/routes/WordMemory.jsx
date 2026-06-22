import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { WORDS } from '../lib/words.js'
import { useStars } from '../hooks/useStars.js'
import { useAuth } from '../hooks/useAuth.js'
import { useChild } from '../hooks/useChild.js'
import { saveGameSession, getLocalDateString } from '../lib/game.js'
import { enqueue, isOnline } from '../lib/offline.js'
import LetterFill from '../components/question/LetterFill.jsx'
import Button from '../components/ui/Button.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import PageShell from '../components/ui/PageShell.jsx'

const STEP_ORDER = ['select', 'playing', 'done']
const STEP_LABEL = { select: '选词', playing: '练习', done: '完成' }

function StepIndicator({ current }) {
  const idx = STEP_ORDER.indexOf(current)
  return (
    <div className="flex items-center justify-center gap-2 mb-5">
      {STEP_ORDER.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all
            ${i === idx
              ? 'bg-white/25 text-white border border-white/25'
              : i < idx
                ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                : 'bg-white/8 text-white/30 border border-white/10'
            }`}
          >
            {i < idx ? '✓' : <span className="w-4 h-4 rounded-full bg-white/15 flex items-center justify-center text-[10px]">{i + 1}</span>}
            {STEP_LABEL[s]}
          </div>
          {i < STEP_ORDER.length - 1 && (
            <div className={`w-6 h-0.5 rounded ${i < idx ? 'bg-green-500/40' : 'bg-white/15'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function WordMemory() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const subject = searchParams.get('subject') || 'english'
  const grade = parseInt(searchParams.get('grade')) || 3
  const { user } = useAuth()
  const { activeChild } = useChild()
  const { addStars, refreshStars } = useStars()
  const navigatedRef = useRef(false)

  const [step, setStep] = useState('select')
  const [selectedWords, setSelectedWords] = useState([])
  const [batchWords, setBatchWords] = useState([])
  const [score, setScore] = useState(0)
  const [cardDone, setCardDone] = useState({})
  const [expanded, setExpanded] = useState([1, 2, 3, 4, 5, 6])
  const [readSpeed, setReadSpeed] = useState(3000)
  const [readRounds, setReadRounds] = useState(1)
  const [readingAloud, setReadingAloud] = useState(false)
  const [readingIndex, setReadingIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const readTimerRef = useRef(null)

  const unitWords = useMemo(() => {
    const units = {}
    WORDS.forEach(w => {
      if (!units[w.unit]) units[w.unit] = []
      units[w.unit].push(w)
    })
    return units
  }, [])

  const filteredUnits = useMemo(() => {
    if (!searchQuery.trim()) return unitWords
    const q = searchQuery.toLowerCase()
    const filtered = {}
    Object.entries(unitWords).forEach(([unit, words]) => {
      const match = words.filter(w =>
        w.word.toLowerCase().includes(q) || w.meaning.includes(q)
      )
      if (match.length > 0) filtered[unit] = match
    })
    return filtered
  }, [unitWords, searchQuery])

  const completedCount = Object.keys(cardDone).length
  const totalBatch = batchWords.length
  const accuracy = completedCount > 0 ? Math.round((score / completedCount) * 100) : 0

  useEffect(() => {
    return () => { if (readTimerRef.current) clearTimeout(readTimerRef.current) }
  }, [])

  useEffect(() => {
    if (!activeChild && !navigatedRef.current) {
      navigatedRef.current = true
      navigate('/select-child', { replace: true })
    }
  }, [activeChild, navigate])

  const toggleWord = (id) => {
    setSelectedWords((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    )
  }

  const toggleAll = (unit, allIds) => {
    const allSelected = allIds.every(id => selectedWords.includes(id))
    if (allSelected) {
      setSelectedWords((prev) => prev.filter(id => !allIds.includes(id)))
    } else {
      setSelectedWords((prev) => [...new Set([...prev, ...allIds])])
    }
  }

  const stopReadAloud = useCallback(() => {
    if (readTimerRef.current && typeof readTimerRef.current === 'number') {
      clearTimeout(readTimerRef.current)
    }
    readTimerRef.current = null
    setReadingAloud(false)
    setReadingIndex(0)
  }, [])

  const playWordSequence = useCallback(async () => {
    const words = batchWords
    const rounds = readRounds
    const speed = readSpeed
    if (words.length === 0) return

    for (let i = 0; i < words.length; i++) {
      if (!readTimerRef.current) break
      for (let r = 0; r < rounds; r++) {
        if (!readTimerRef.current) break
        setReadingIndex(i)
        const audio = new Audio(`audio/${words[i].id}.mp3`)
        try { await audio.play() } catch {}
        if (r < rounds - 1 || i < words.length - 1) {
          await new Promise(resolve => {
            const timerId = setTimeout(resolve, speed)
            if (!readTimerRef.current) {
              clearTimeout(timerId)
              resolve()
            } else {
              readTimerRef.current = timerId
            }
          })
        }
        if (!readTimerRef.current) break
      }
    }
    stopReadAloud()
  }, [batchWords, readSpeed, readRounds, stopReadAloud])

  const toggleReadAloud = useCallback(async () => {
    if (readingAloud) { stopReadAloud(); return }
    if (batchWords.length === 0) return
    setReadingAloud(true)
    readTimerRef.current = true
    await playWordSequence()
  }, [readingAloud, batchWords, playWordSequence, stopReadAloud])

  const handleCardAnswer = useCallback((wordId, isCorrect) => {
    if (cardDone[wordId] !== undefined) return
    setCardDone(prev => ({ ...prev, [wordId]: isCorrect }))
    if (isCorrect) setScore(s => s + 1)
  }, [cardDone])

  useEffect(() => {
    if (step === 'playing' && totalBatch > 0 && completedCount === totalBatch) {
      const finalScore = Object.values(cardDone).filter(Boolean).length
      const timer = setTimeout(() => {
        setStep('done')
        if (activeChild && user) {
          // 保存游戏记录到 Supabase
          const sessionData = {
            user_id: user.id,
            child_id: activeChild.child_id,
            subject,
            grade,
            client_session_id: `memory_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            played_on: getLocalDateString(),
            character: 'default',
            correct_count: finalScore,
            wrong_count: batchWords.length - finalScore,
            results: batchWords.map((w) => ({
              wordId: w.id,
              word: w.word,
              correct: cardDone[w.id] === true,
              type: 'letter_fill',
            })),
          }
          if (isOnline()) {
            saveGameSession(sessionData).then(({ error }) => {
              if (error) enqueue(sessionData)
            })
          } else {
            enqueue(sessionData)
          }
          // 奖励星星
          if (finalScore > 0) {
            addStars(finalScore, finalScore).then(({ error }) => {
              if (!error) refreshStars()
            })
          }
        }
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [cardDone, totalBatch, completedCount, step, activeChild, user, score, batchWords, subject, grade])

  const handleRestart = () => {
    setStep('select')
    setSelectedWords([])
    setBatchWords([])
    setScore(0)
    setCardDone({})
    setSearchQuery('')
  }

  if (!activeChild) return null

  if (step === 'select') {
    const totalSelected = selectedWords.length
    const unitKeys = Object.keys(filteredUnits).map(Number).sort()
    const borderColors = [
      'border-l-orange-400', 'border-l-purple-400', 'border-l-emerald-400',
      'border-l-sky-400', 'border-l-pink-400', 'border-l-amber-400'
    ]

    return (
      <PageShell onBack={() => navigate('/select-child')} className="bg-question-purple">
        <div className="max-w-2xl mx-auto page-enter">
          <StepIndicator current="select" />

          <div className="relative mb-4">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35 pointer-events-none">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索单词或中文..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/10 border-2 border-white/15 rounded-xl text-sm text-white placeholder-white/30
                         focus:border-[var(--color-focus)] focus:bg-white/15 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="清除搜索"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 text-sm"
              >✕</button>
            )}
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-white/70 text-sm">
              已选 <span className="font-bold text-white">{totalSelected}</span> 个
            </span>
            <Button
              onClick={() => {
                const wordObjs = selectedWords.map((id) => WORDS.find((w) => w.id === id)).filter(Boolean)
                setBatchWords(wordObjs)
                setScore(0)
                setCardDone({})
                setStep('playing')
              }}
              disabled={totalSelected === 0}
              size="sm"
            >
              开始练习 ({totalSelected})
            </Button>
          </div>

          <div className="space-y-3">
            {unitKeys.length === 0 ? (
              <EmptyState icon="🔍" text="没有找到匹配的单词" subtext="试试其他关键词" />
            ) : unitKeys.map((unit) => {
              const words = filteredUnits[unit]
              const selectedCount = words.filter((w) => selectedWords.includes(w.id)).length
              const isOpen = expanded.includes(unit)

              return (
                <div key={unit} className={`bg-white/12 backdrop-blur-sm rounded-2xl border border-white/15 overflow-hidden border-l-4 ${borderColors[unit - 1] || 'border-l-white/30'}`}>
                  <div className="flex items-center justify-between px-5 py-3.5">
                    <button
                      type="button"
                      onClick={() => setExpanded((prev) => prev.includes(unit) ? prev.filter(u => u !== unit) : [...prev, unit])}
                      className="flex items-center gap-2 text-left cursor-pointer select-none"
                      aria-expanded={isOpen}
                    >
                      <span className={`text-white/40 text-xs transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`} aria-hidden="true">▼</span>
                      <div>
                        <h3 className="font-bold text-white/90 text-sm">Unit {unit}</h3>
                        <p className="text-xs text-white/50">{selectedCount}/{words.length} 已选</p>
                      </div>
                    </button>
                    <Button
                      variant="pill"
                      size="sm"
                      onClick={() => toggleAll(unit, words.map(w => w.id))}
                      className={words.every(w => selectedWords.includes(w.id)) ? 'bg-white/25 text-white' : 'bg-white/15 text-white/70 hover:bg-white/25'}
                    >
                      {words.every(w => selectedWords.includes(w.id)) ? '取消' : '全选'}
                    </Button>
                  </div>

                  {isOpen && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-4">
                      {words.map((w) => {
                        const isOn = selectedWords.includes(w.id)
                        return (
                          <label
                            key={w.id}
                            onClick={() => toggleWord(w.id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 cursor-pointer transition-all select-none
                              ${isOn
                                ? 'border-green-400/60 bg-green-400/15'
                                : 'border-white/12 bg-white/6 hover:border-white/25'
                              }`}
                          >
                            <div className={`w-[18px] h-[18px] rounded-md flex items-center justify-center text-[11px] font-bold shrink-0 transition-all
                              ${isOn ? 'bg-green-500 text-white' : 'border-2 border-white/25 bg-white/5'}`}
                            >
                              {isOn ? '✓' : ''}
                            </div>
                            <div className="min-w-0">
                              <div className={`text-sm font-bold truncate ${isOn ? 'text-white' : 'text-white/70'}`}>{w.word}</div>
                              <div className={`text-[10px] truncate ${isOn ? 'text-white/60' : 'text-white/40'}`}>{w.meaning}</div>
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </PageShell>
    )
  }

  if (step === 'playing') {
    return (
      <PageShell onBack={() => { stopReadAloud(); setStep('select'); setScore(0); setCardDone({}); setBatchWords([]) }} className="bg-question-purple">
        <div className="page-enter">
          <StepIndicator current="playing" />

          <div className="flex items-center justify-between mb-3 glass-card !py-2.5 !px-4">
            <div className="flex items-center gap-4">
              <span className="text-white/60 text-xs">
                <span className="text-white font-bold">{completedCount}</span>/{totalBatch}
              </span>
              {completedCount > 0 && (
                <span className={`text-xs font-bold ${accuracy >= 80 ? 'text-green-400' : accuracy >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                  {accuracy}%
                </span>
              )}
            </div>
            <span className="font-bold text-amber-400 text-sm">⭐ {score}</span>
          </div>

          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full transition-all duration-300"
              style={{ width: `${totalBatch > 0 ? (completedCount / totalBatch) * 100 : 0}%` }}
            />
          </div>

          <div className="mb-4 flex items-center gap-3 bg-white/15 backdrop-blur rounded-2xl px-4 py-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-white/60 text-[10px]">间隔</span>
              <div className="flex gap-0.5">
                {[1000, 2000, 3000].map(speed => (
                  <button key={speed} onClick={() => setReadSpeed(speed)}
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all
                      ${readSpeed === speed ? 'bg-white/30 text-white' : 'text-white/60 hover:text-white'}`}
                  >{speed / 1000}s</button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-white/60 text-[10px]">次数</span>
              <div className="flex gap-0.5">
                {[1, 2, 3].map(n => (
                  <button key={n} onClick={() => setReadRounds(n)}
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all
                      ${readRounds === n ? 'bg-white/30 text-white' : 'text-white/60 hover:text-white'}`}
                  >{n}次</button>
                ))}
              </div>
            </div>
            <button onClick={toggleReadAloud}
              className="ml-auto px-4 py-1.5 rounded-xl text-xs font-bold bg-white/20 text-white hover:bg-white/30 active:bg-white/40 transition-all"
            >{readingAloud ? '⏹ 停止' : '🔊 朗读'}</button>
          </div>

          {readingAloud && (
            <div className="h-1 bg-white/15 rounded-full overflow-hidden mb-3">
              <div className="h-full bg-green-400 rounded-full transition-all duration-300"
                style={{ width: `${totalBatch > 0 ? (readingIndex / totalBatch) * 100 : 0}%` }} />
            </div>
          )}

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-3">
            {batchWords.map((word, idx) => {
              const question = { wordId: word.id, word: word.word, meaning: word.meaning, type: 'letter_fill', stage: 0 }
              const done = cardDone[word.id] !== undefined
              const isCorrect = cardDone[word.id]
              const isReading = readingAloud && readingIndex === idx

              return (
                <div key={word.id}
                  className={`bg-white/12 backdrop-blur-md rounded-2xl p-4 transition-all duration-300 border-2 ${
                    done
                      ? isCorrect
                        ? 'border-green-400/50 bg-green-500/8'
                        : 'border-red-400/50 bg-red-500/8'
                      : 'border-transparent'
                  } ${isReading ? 'ring-2 ring-green-400/50' : ''}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={`images/words/${word.id}.webp`}
                      alt={word.word}
                      className="w-14 h-14 rounded-xl object-cover bg-white/15 flex-shrink-0"
                      onError={(e) => { e.target.src = 'images/words/apple.webp' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-bold text-white/90">{word.meaning}</div>
                    </div>
                    {done && (
                      <span className="text-lg">{isCorrect ? '✅' : '❌'}</span>
                    )}
                  </div>
                  {!done ? (
                    <LetterFill
                      question={question}
                      onAnswer={(isCorrect) => handleCardAnswer(word.id, isCorrect)}
                    />
                  ) : (
                    <div className="text-center py-2">
                      <span className={`inline-block px-4 py-1 rounded-full text-xs font-bold
                        ${isCorrect ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                        {isCorrect ? '✅ 正确' : '❌ 错误'}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </PageShell>
    )
  }

  const wrongWords = batchWords.filter(w => cardDone[w.id] === false)

  return (
    <PageShell title="练习完成" className="bg-question-purple">
      <div className="max-w-md mx-auto page-enter">
        <StepIndicator current="done" />

        <div className="text-center mb-6">
          <div className="text-6xl mb-3">{accuracy === 100 ? '🎉' : accuracy >= 80 ? '👏' : '💪'}</div>
          <h2 className="text-2xl font-black text-white" style={{textShadow: '0 2px 8px rgba(0,0,0,0.3)'}}>
            {accuracy === 100 ? '全对！太厉害了！' : accuracy >= 80 ? '做得不错！' : '继续加油！'}
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="glass-card !p-3 text-center">
            <div className="text-2xl font-black text-green-400">{score}</div>
            <div className="text-[10px] text-white/50 font-bold">✅ 答对</div>
          </div>
          <div className="glass-card !p-3 text-center">
            <div className="text-2xl font-black text-red-400">{batchWords.length - score}</div>
            <div className="text-[10px] text-white/50 font-bold">❌ 答错</div>
          </div>
          <div className="glass-card !p-3 text-center">
            <div className="text-2xl font-black text-amber-400">⭐ {score}</div>
            <div className="text-[10px] text-white/50 font-bold">获得</div>
          </div>
        </div>

        {wrongWords.length > 0 && (
          <div className="glass-card !p-4 mb-5">
            <h3 className="text-sm font-bold text-white/70 mb-3">📝 错词回顾</h3>
            <div className="space-y-2">
              {wrongWords.map(w => (
                <div key={w.id} className="flex items-center gap-3 bg-white/8 rounded-xl px-3 py-2">
                  <img
                    src={`images/words/${w.id}.webp`}
                    alt={w.word}
                    className="w-10 h-10 rounded-lg object-cover bg-white/15 flex-shrink-0"
                    onError={(e) => { e.target.src = 'images/words/apple.webp' }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white/90">{w.word}</div>
                    <div className="text-[10px] text-white/50">{w.meaning}</div>
                  </div>
                  <span className="text-[10px] text-red-400/70">需复习</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate('/select-child')} className="flex-1">返回</Button>
          <Button onClick={handleRestart} className="flex-1">再来一次</Button>
        </div>
      </div>
    </PageShell>
  )
}
