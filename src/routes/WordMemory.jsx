import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { WORDS } from '../lib/words.js'
import { useStars } from '../hooks/useStars.js'
import { useAuth } from '../hooks/useAuth.js'
import { useChild } from '../hooks/useChild.js'
import LetterFill from '../components/question/LetterFill.jsx'
import Button from '../components/ui/Button.jsx'
import PageShell from '../components/ui/PageShell.jsx'
import Card from '../components/ui/Card.jsx'

export default function WordMemory() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const subject = searchParams.get('subject') || 'english'
  const grade = parseInt(searchParams.get('grade')) || 3
  const { user } = useAuth()
  const { activeChild } = useChild()
  const { addStars, refreshStars } = useStars()
  const navigatedRef = useRef(false)

  const [step, setStep] = useState('select') // select | playing | done
  const [selectedWords, setSelectedWords] = useState([])
  const [batchWords, setBatchWords] = useState([])
  const [score, setScore] = useState(0)
  const [cardDone, setCardDone] = useState({})
  const [expanded, setExpanded] = useState([1, 2, 3, 4, 5, 6]) // 默认全部展开
  const [readSpeed, setReadSpeed] = useState(3000)
  const [readRounds, setReadRounds] = useState(1)
  const [readingAloud, setReadingAloud] = useState(false)
  const [readingIndex, setReadingIndex] = useState(0)
  const readTimerRef = useRef(null)

  // 所有单词按单元分组
  const unitWords = useMemo(() => {
    const units = {}
    WORDS.forEach(w => {
      if (!units[w.unit]) units[w.unit] = []
      units[w.unit].push(w)
    })
    return units
  }, [])

  useEffect(() => {
    return () => {
      if (readTimerRef.current) clearInterval(readTimerRef.current)
    }
  }, [])

  // 如果没有选孩子，跳转（useEffect 避免 render 时导航）
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
    const currentUnitIds = allIds
    const allSelected = currentUnitIds.every(id => selectedWords.includes(id))
    if (allSelected) {
      setSelectedWords((prev) => prev.filter(id => !currentUnitIds.includes(id)))
    } else {
      setSelectedWords((prev) => [...new Set([...prev, ...currentUnitIds])])
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
        // 等 speed 毫秒再播下一个（最后一次不等待）
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
    if (readingAloud) {
      stopReadAloud()
      return
    }
    if (batchWords.length === 0) return
    setReadingAloud(true)
    readTimerRef.current = true // 标记运行中
    await playWordSequence()
  }, [readingAloud, batchWords, playWordSequence, stopReadAloud])

  const handleCardAnswer = useCallback((wordId, isCorrect) => {
    if (cardDone[wordId] !== undefined) return
    setCardDone(prev => ({ ...prev, [wordId]: isCorrect }))
    if (isCorrect) setScore(s => s + 1)
  }, [cardDone])

  // 全部完成时自动进入 done
  useEffect(() => {
    if (step === 'playing' && batchWords.length > 0 &&
        Object.keys(cardDone).length === batchWords.length) {
      const finalScore = Object.values(cardDone).filter(Boolean).length
      const timer = setTimeout(() => {
        setStep('done')
        if (activeChild && user && finalScore > 0) {
          addStars(finalScore, finalScore)
            .then(() => refreshStars())
        }
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [cardDone, batchWords, step, activeChild, user, refreshStars])

  const handleRestart = () => {
    setStep('select')
    setSelectedWords([])
    setBatchWords([])
    setScore(0)
    setCardDone({})
  }

  if (!activeChild) return null

  // Step 1: 选单词（直接展示所有单元 + 单词，类似家长解锁风格）
  if (step === 'select') {
    const totalSelected = selectedWords.length
    const unitKeys = Object.keys(unitWords).map(Number).sort()

    return (
      <PageShell title="📝 选择要练习的单词" onBack={() => navigate('/select-child')} className="bg-question-purple">
        <div className="max-w-2xl mx-auto page-enter">
          {/* 顶部统计 + 开始按钮 */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-white/80 text-sm">
              已选 <span className="font-bold text-white">{totalSelected}</span> 个单词
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

          {/* 单元列表 */}
          <div className="space-y-3">
            {unitKeys.map((unit) => {
              const words = unitWords[unit]
              const unlockedCount = words.filter((w) => selectedWords.includes(w.id)).length

              const isOpen = expanded.includes(unit)

              const cardColors = [
                '!bg-orange-200', '!bg-purple-200', '!bg-emerald-200',
                '!bg-sky-200', '!bg-pink-200', '!bg-amber-200'
              ]

              return (
                <Card key={unit} className={`overflow-hidden ${cardColors[unit - 1] || 'bg-white'}`}>
                  {/* 单元标题 — 点击切换展开/收起 */}
                  <div
                    onClick={() => setExpanded((prev) => prev.includes(unit) ? prev.filter(u => u !== unit) : [...prev, unit])}
                    className="flex items-center justify-between cursor-pointer select-none border-b border-gray-100 pb-3"
                  >
                    <div>
                      <h3 className="font-bold text-gray-800">Unit {unit}</h3>
                      <p className="text-xs text-gray-400">{unlockedCount}/{words.length}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleAll(unit, words.map(w => w.id)) }}
                        className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                      >
                        {words.every(w => selectedWords.includes(w.id)) ? '取消全选' : '全选'}
                      </button>
                      <span className={`text-gray-400 text-xs transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`}>▼</span>
                    </div>
                  </div>

                  {/* 单词网格（收起时隐藏） */}
                  {isOpen && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-3">
                    {words.map((w) => {
                      const isOn = selectedWords.includes(w.id)
                      return (
                        <label
                          key={w.id}
                          onClick={() => toggleWord(w.id)}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 cursor-pointer transition-all select-none
                            ${isOn
                              ? 'border-green-500/60 bg-green-500/10'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                        >
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold shrink-0 transition-all
                            ${isOn
                              ? 'bg-green-500 text-white'
                              : 'border-2 border-gray-300 bg-white'
                            }`}
                          >
                            {isOn ? '✓' : ''}
                          </div>
                          <div className="min-w-0">
                            <div className={`text-sm font-bold truncate ${isOn ? 'text-gray-800' : 'text-gray-500'}`}>
                              {w.word}
                            </div>
                            <div className={`text-xs truncate ${isOn ? 'text-gray-500' : 'text-gray-400'}`}>
                              {w.meaning}
                            </div>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                  )}
                </Card>
              )
            })}
          </div>
        </div>
      </PageShell>
    )
  }

  // Step 3: 填空练习（顶部播报 + 卡片网格 — 旧版风格）
  if (step === 'playing') {
    return (
      <PageShell onBack={() => { stopReadAloud(); setStep('select') }} className="bg-question-purple">
        <div className="page-enter">
          {/* 进度 + 得分 */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/70 text-xs">
              {Object.keys(cardDone).length} / {batchWords.length} 完成
            </span>
            <span className="font-bold text-yellow-400 text-sm">⭐ {score}</span>
          </div>

          {/* 播报设置 */}
          <div className="mb-4 flex items-center gap-4 bg-white/10 backdrop-blur rounded-2xl px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="text-white/60 text-xs">间隔</span>
            <div className="flex gap-1">
              {[1000, 2000, 3000].map(speed => (
                <button key={speed}
                  onClick={() => setReadSpeed(speed)}
                  className={`px-3 py-1 rounded-lg text-sm font-bold transition-all
                    ${readSpeed === speed
                      ? 'bg-white/30 text-white'
                      : 'text-white/50 hover:text-white/80'}`}
                >
                  {speed / 1000}s
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-white/60 text-xs">次数</span>
            <div className="flex gap-1">
              {[1, 2, 3].map(n => (
                <button key={n}
                  onClick={() => setReadRounds(n)}
                  className={`px-3 py-1 rounded-lg text-sm font-bold transition-all
                    ${readRounds === n
                      ? 'bg-white/30 text-white'
                      : 'text-white/50 hover:text-white/80'}`}
                >
                  {n}次
                </button>
              ))}
            </div>
          </div>

          <button onClick={toggleReadAloud}
            className="ml-auto px-5 py-2 rounded-xl text-sm font-bold
              bg-white/20 text-white hover:bg-white/30 active:bg-white/40 transition-all"
          >
            {readingAloud ? '⏹ 停止' : '🔊 朗读全部'}
          </button>
        </div>

        {/* 播报进度条 */}
        {readingAloud && (
          <div className="max-w-4xl mx-auto mb-3">
            <div className="h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-green-400 rounded-full transition-all duration-300"
                style={{ width: `${batchWords.length > 0 ? (readingIndex / batchWords.length) * 100 : 0}%` }} />
            </div>
          </div>
        )}

        {/* 单词卡片网格 */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {batchWords.map((word, idx) => {
            const question = { wordId: word.id, word: word.word, meaning: word.meaning, type: 'letter_fill', stage: 0 }
            const done = cardDone[word.id] !== undefined
            const isReading = readingAloud && readingIndex === idx

            return (
              <div
                key={word.id}
                className={`bg-white/15 backdrop-blur-md rounded-2xl p-4 transition-all duration-300 ${
                  done ? 'border-2 border-green-300 opacity-80' : 'border-2 border-transparent'
                } ${isReading ? 'ring-2 ring-green-400' : ''}`}
              >
                {/* 顶部：图片 + 单词信息 + 播放 */}
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={`images/words/${word.id}.webp`}
                    alt={word.word}
                    className="w-[72px] h-[72px] rounded-xl object-cover bg-white/20 flex-shrink-0"
                    onError={(e) => { e.target.src = 'images/words/apple.webp' }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-lg font-bold text-white/90">{word.word}</div>
                    <div className="text-sm text-white/60">{word.meaning}</div>
                  </div>

                </div>

                {/* 字母填空区 */}
                {!done ? (
                  <LetterFill
                    question={question}
                    onAnswer={(isCorrect) => handleCardAnswer(word.id, isCorrect)}
                  />
                ) : (
                  <div className="text-center py-3">
                    <span className="inline-block px-4 py-1.5 rounded-full text-sm font-bold
                      bg-green-500/20 text-green-300">
                      ✅ 完成
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

  // Done
  return (
    <PageShell title="练习完成">
      <Card className="max-w-xs mx-auto flex flex-col items-center py-8 text-center page-enter">
        <div className="text-6xl mb-4 character-celebrate">🎉</div>
        <h2 className="text-2xl font-bold text-white mb-6">练习完成！</h2>
        <Card className="w-full mb-6">
          <div className="text-4xl font-bold text-green-500">{score}/{batchWords.length}</div>
          <div className="text-sm text-gray-500 mt-1">正确</div>
        </Card>
        <div className="flex gap-3 w-full">
          <Button variant="secondary" onClick={() => navigate('/select-child')} className="flex-1">返回</Button>
          <Button onClick={handleRestart} className="flex-1">再来一次</Button>
        </div>
      </Card>
    </PageShell>
  )
}
