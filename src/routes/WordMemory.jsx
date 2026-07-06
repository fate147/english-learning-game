import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { WORDS, getWordsByUnit, getWordsByGradeSemester } from '../lib/words.js'
import { useStars } from '../hooks/useStars.js'
import { useAuth } from '../hooks/useAuth.js'
import { useChild } from '../hooks/useChild.js'
import { useGameTheme } from '../context/GameThemeContext.jsx'
import { saveGameSession, getWordProgress, updateWordProgress, mergeWordProgressToCache, loadWordProgressWithCache } from '../lib/game.js'
import { enqueue, isOnline } from '../lib/offline.js'
import { calcScore } from '../engines/scoring.js'
import { speakText } from '../components/dialogue/tts.js'
import { recordErrors, getErrorBook } from '../lib/errorBook.js'
import { useToast } from '../components/ui/Toast.jsx'
import LetterFill from '../components/question/LetterFill.jsx'
import Button from '../components/ui/Button.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import PageShell from '../components/ui/PageShell.jsx'
import StarRain from '../components/ui/StarRain.jsx'

const GRADES = [3, 4, 5, 6]
const GRADE_LABEL = { 3: '三年级', 4: '四年级', 5: '五年级', 6: '六年级' }
const SEMESTERS = [1, 2]
const SEMESTER_LABEL = { 1: '上学期', 2: '下学期' }

const UNIT_NAMES = {
  0: '欢迎', 1: '问候', 2: '颜色', 3: '数字', 4: '文具', 5: '教室', 6: '家庭',
}
const SPEED_OPTIONS = [
  { value: 1500, label: '1秒' },
  { value: 2000, label: '2秒' },
  { value: 3000, label: '3秒' },
]
const ROUND_OPTIONS = [1, 2, 3]

export default function WordMemory() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { activeChild } = useChild()
  const { gameTheme } = useGameTheme()
  const { addStars, refreshStars } = useStars()
  const toast = useToast()
  const navigatedRef = useRef(false)

  const [step, setStep] = useState('select')
  const [selectedWords, setSelectedWords] = useState([])
  const [expanded, setExpanded] = useState([])
  const [wordProgress, setWordProgress] = useState({})

  const [practiceWords, setPracticeWords] = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [cardDone, setCardDone] = useState({})

  const [readSpeed, setReadSpeed] = useState(1500)
  const [readRounds, setReadRounds] = useState(1)
  const [readingAloud, setReadingAloud] = useState(false)
  const [currentReadingWord, setCurrentReadingWord] = useState(null)
  const readingStoppedRef = useRef(false)

  const [grade, setGrade] = useState(3)
  const [semester, setSemester] = useState(2)

  useEffect(() => {
    if (!activeChild && !navigatedRef.current) {
      navigatedRef.current = true
      navigate('/select-child', { replace: true })
    }
  }, [activeChild, navigate])

  useEffect(() => {
    if (activeChild) {
      // 优先从本地缓存加载
      const { progressMap: cached } = loadWordProgressWithCache(activeChild.child_id, 'english', 3)
      if (Object.keys(cached).length > 0) {
        const progressMap = {}
        Object.entries(cached).forEach(([wordId, item]) => {
          progressMap[wordId] = item
        })
        setWordProgress(progressMap)
      }
      // 再从服务端同步最新数据
      getWordProgress(user.id, activeChild.child_id, 'english').then(res => {
        const progressMap = {}
        if (res.data) {
          res.data.forEach(item => {
            progressMap[item.word_id] = item
          })
        }
        if (Object.keys(progressMap).length > 0) {
          setWordProgress(progressMap)
        }
      })
    }
  }, [activeChild])

  const allWords = useMemo(() => getWordsByGradeSemester(grade, semester), [grade, semester])

  const toggleUnit = (unit) => {
    setExpanded(prev => prev.includes(unit) ? [] : [unit])
  }

  const toggleWord = (wordId) => {
    setSelectedWords(prev =>
      prev.includes(wordId) ? prev.filter(id => id !== wordId) : [...prev, wordId]
    )
  }

  const toggleUnitWords = (unit) => {
    const unitWords = getWordsByUnit(unit, grade, semester).map(w => w.id)
    const allSelected = unitWords.every(id => selectedWords.includes(id))
    if (allSelected) {
      setSelectedWords(prev => prev.filter(id => !unitWords.includes(id)))
    } else {
      setSelectedWords(prev => [...new Set([...prev, ...unitWords])])
    }
  }

  const selectAllWords = () => {
    setSelectedWords(allWords.map(w => w.id))
  }

  const selectErrorWords = () => {
    const book = getErrorBook(activeChild.child_id, 'english')
    const errorIds = Object.keys(book)
    const availableIds = allWords.map(w => w.id)
    const matchIds = errorIds.filter(id => availableIds.includes(id))
    if (matchIds.length === 0) {
      toast('当前学期暂无错词')
      return
    }
    setSelectedWords(prev => [...new Set([...prev, ...matchIds])])
    toast(`已选 ${matchIds.length} 个错词`)
  }

  const clearSelection = () => {
    setSelectedWords([])
  }

  const startReadAloud = async () => {
    const wordsToRead = selectedWords.map(id => WORDS.find(w => w.id === id)).filter(Boolean)
    if (wordsToRead.length === 0 || readingAloud) return
    setReadingAloud(true)
    readingStoppedRef.current = false
    for (const word of wordsToRead) {
      if (readingStoppedRef.current) break
      if (word) {
        setCurrentReadingWord(word.id)
        for (let i = 0; i < readRounds; i++) {
          if (readingStoppedRef.current) break
          await speakText(word.word)
          await new Promise(r => setTimeout(r, readSpeed))
        }
      }
    }
    setCurrentReadingWord(null)
    setReadingAloud(false)
  }

  const stopReadAloud = () => {
    readingStoppedRef.current = true
    setReadingAloud(false)
    setCurrentReadingWord(null)
  }

  const startPractice = () => {
    if (selectedWords.length === 0) return
    const shuffled = [...selectedWords].sort(() => Math.random() - 0.5)
    setPracticeWords(shuffled.map(id => WORDS.find(w => w.id === id)).filter(Boolean))
    setCurrentIdx(0)
    setScore(0)
    setCardDone({})
    setStep('practice')
  }

  const handleAnswer = (isCorrect) => {
    const word = practiceWords[currentIdx]
    if (word) {
      setCardDone(prev => ({ ...prev, [word.id]: isCorrect }))
      if (isCorrect) setScore(prev => prev + 1)
      if (currentIdx < practiceWords.length - 1) {
        setCurrentIdx(prev => prev + 1)
      } else {
        setStep('done')
      }
    }
  }

  const finishPractice = () => {
    if (!activeChild) return
    const results = practiceWords.map(w => ({
      wordId: w.id,
      correct: cardDone[w.id] === true,
    }))
    const { totalAdd } = calcScore(score, 0, score === practiceWords.length, false, false)

    // 始终更新本地缓存
    const updatedProgress = mergeWordProgressToCache(activeChild.child_id, 'english', 3, results)
    setWordProgress(updatedProgress)

    // 记录错词
    const errors = results.filter(r => !r.correct).map(r => ({
      wordId: r.wordId,
      word: practiceWords.find(w => w.id === r.wordId)?.word || r.wordId,
      meaning: practiceWords.find(w => w.id === r.wordId)?.meaning || '',
      type: 'letter_fill',
    }))
    if (errors.length > 0) {
      recordErrors(activeChild.child_id, 'english', errors)
    }

    // 后台保存，不阻塞跳转
    if (isOnline()) {
      saveGameSession({
        user_id: user.id,
        child_id: activeChild.child_id,
        subject: 'english',
        grade: 3,
        correct_count: score,
        wrong_count: practiceWords.length - score,
        results,
      }).catch(() => {})
      updateWordProgress(user.id, activeChild.child_id, 'english', 3, results).catch(() => {})
      if (totalAdd > 0) {
        addStars(activeChild.child_id, totalAdd).then(() => refreshStars(activeChild.child_id)).catch(() => {})
      }
    } else {
      enqueue({
        user_id: user.id,
        child_id: activeChild.child_id,
        subject: 'english',
        grade: 3,
        correct_count: score,
        wrong_count: practiceWords.length - score,
        results,
      })
    }

    navigate('/home')
  }

  if (!activeChild) return <EmptyState variant="child" text="请先选择一个孩子" />

  // 练习中
  if (step === 'practice' && practiceWords.length > 0) {
    const word = practiceWords[currentIdx]
    const done = Object.keys(cardDone).length

    return (
      <PageShell title="记忆练习" onBack={() => { setStep('select'); setReadingAloud(false); readingStoppedRef.current = true }} className={gameTheme.pattern}>
        <StarRain count={10} />
        <div className="relative z-10 max-w-sm mx-auto space-y-3">
          {/* 播报卡片 */}
          <div className="glass-card p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-white/75 text-[11px]">间隔</span>
              <div className="flex gap-1">
                {SPEED_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setReadSpeed(opt.value)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all
                      ${readSpeed === opt.value ? 'bg-white/20 text-white' : 'text-white/65 hover:text-white'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <span className="text-white/75 text-[11px] ml-1">次数</span>
              <div className="flex gap-1">
                {ROUND_OPTIONS.map(n => (
                  <button
                    key={n}
                    onClick={() => setReadRounds(n)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all
                      ${readRounds === n ? 'bg-white/20 text-white' : 'text-white/65 hover:text-white'}`}
                  >
                    {n}次
                  </button>
                ))}
              </div>
            </div>
            <Button
              variant={readingAloud ? 'danger' : 'primary'}
              size="sm"
              onClick={readingAloud ? stopReadAloud : startReadAloud}
              disabled={step === 'practice' ? practiceWords.length === 0 : selectedWords.length === 0}
              className="w-full"
            >
              {readingAloud ? '停止播报' : '播放单词'}
            </Button>
          </div>

          {/* 进度条 */}
          <div className="glass-card p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-white/80 text-xs">
                <span className="text-white font-bold">{done}</span>/{practiceWords.length}
              </span>
              <span className="text-yellow-400 font-bold text-xs">★ {score}</span>
            </div>
            <div className="progress">
              <div className="progress-bar" style={{ width: `${(done / practiceWords.length) * 100}%` }} />
            </div>
          </div>

          {/* 字母填空题 */}
          {done < practiceWords.length && word && (
            <LetterFill
              key={word.id}
              question={{ wordId: word.id, word: word.word, meaning: word.meaning }}
              onAnswer={handleAnswer}
              unit={word.unit}
            />
          )}
        </div>
      </PageShell>
    )
  }

  // 完成
  if (step === 'done') {
    return (
      <PageShell title="练习完成" onBack={() => navigate('/home')} className={gameTheme.pattern}>
        <StarRain count={15} />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="glass-card p-8 text-center w-full max-w-sm">
            <div className="text-4xl mb-4">{score === practiceWords.length ? '🎉' : '💪'}</div>
            <div className="text-2xl font-bold text-white mb-2">
              {score === practiceWords.length ? '全对！太棒了！' : '练习完成！'}
            </div>
            <div className="text-white/80 mb-2">
              答对 <span className="text-green-400 font-bold">{score}</span> / {practiceWords.length} 题
            </div>
            {score === practiceWords.length && (
              <div className="text-yellow-400 font-bold mb-4">★ +{score}</div>
            )}
            <div className="space-y-2">
              <Button variant="primary" onClick={finishPractice} className="w-full">完成</Button>
              <Button variant="ghost" onClick={() => navigate('/home')} className="w-full text-white/90 hover:text-white">
                回首页
              </Button>
            </div>
          </div>
        </div>
      </PageShell>
    )
  }

  // 选词页面
  return (
    <PageShell title="英语记忆" onBack={() => navigate('/home')} className={gameTheme.pattern}>
      <StarRain count={15} />
      <div className="relative z-10">
        {/* 年级 */}
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
          {GRADES.map(g => (
            <button
              key={g}
              onClick={() => { setGrade(g); setSelectedWords([]) }}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all
                ${grade === g ? 'bg-white text-green-700' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              {GRADE_LABEL[g]}
            </button>
          ))}
        </div>

        {/* 学期 */}
        <div className="flex gap-2 mb-3">
          {SEMESTERS.map(s => (
            <button
              key={s}
              onClick={() => { setSemester(s); setSelectedWords([]) }}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all
                ${semester === s ? 'bg-white/20 text-white border border-white/30' : 'bg-white/5 text-white/75 border border-white/10'}`}
            >
              {SEMESTER_LABEL[s]}
            </button>
          ))}
        </div>

        {/* 操作栏 */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-white/90 text-sm">
            已选 <span className="text-white font-bold">{selectedWords.length}</span> 词
          </span>
          <div className="flex gap-2">
            <button onClick={selectAllWords} className="btn btn-outline btn-sm">全选</button>
            <button onClick={clearSelection} className="btn btn-outline btn-sm">清空</button>
            <button onClick={selectErrorWords} className="btn btn-danger btn-sm">只练错词</button>
          </div>
        </div>

        {/* 单元手风琴 */}
        <div className="space-y-2 mb-4">
          {[0, 1, 2, 3, 4, 5, 6].map(unit => {
            const unitWords = getWordsByUnit(unit, grade, semester)
            const isExpanded = expanded.includes(unit)
            const selectedCount = unitWords.filter(w => selectedWords.includes(w.id)).length
            const allSelected = unitWords.every(w => selectedWords.includes(w.id))

            return (
              <div key={unit} className="accordion-item" data-state={isExpanded ? 'open' : 'closed'}>
                <div onClick={() => toggleUnit(unit)} className="accordion-trigger cursor-pointer">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: allSelected ? 'var(--c-success)' : selectedCount > 0 ? 'var(--c-warning)' : 'var(--c-text-muted)' }} />
                    <span className="font-bold text-sm text-white">Unit {unit}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-white/80 tabular-nums">{selectedCount}/{unitWords.length}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleUnitWords(unit) }}
                      className={`btn btn-sm btn-icon ${allSelected ? 'btn-primary' : 'btn-ghost'}`}
                    >
                      {allSelected ? '✓' : '全选'}
                    </button>
                    <svg className={`w-3.5 h-3.5 text-white/75 transition-transform accordion-icon ${isExpanded ? 'rotate-180' : ''}`}
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
                {isExpanded && (
                  <div className="accordion-content">
                    <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5">
                      {unitWords.map(word => {
                        const progressData = wordProgress[word.id]
                        const progress = progressData?.correct_count || 0
                        const isSelected = selectedWords.includes(word.id)
                        const isFull = progress >= 10
                        const fillPct = Math.min((progress / 10) * 100, 100)

                        const isReading = currentReadingWord === word.id

                        return (
                          <button
                            key={word.id}
                            onClick={() => toggleWord(word.id)}
                            className="w-full rounded-lg text-[11px] font-bold flex flex-col items-center justify-center gap-0.5 border transition-all duration-100 py-1.5 relative overflow-hidden active:scale-[0.95]"
                            style={{
                              background: isReading ? 'rgba(251,191,36,0.4)' : isSelected ? 'rgba(251,191,36,0.2)' : isFull ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.05)',
                              borderColor: isReading ? 'rgba(251,191,36,0.6)' : isSelected ? 'rgba(251,191,36,0.4)' : isFull ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.2)',
                              color: '#ffffff',
                              transform: isReading ? 'scale(1.05)' : 'none',
                              boxShadow: isReading ? '0 0 12px rgba(251,191,36,0.4)' : 'none',
                            }}>
                            {progress > 0 && !isReading && (
                              <div className="absolute inset-0 rounded-lg transition-all duration-300"
                                style={{ background: isFull ? 'rgba(74,222,128,0.2)' : 'rgba(74,222,128,0.1)', width: `${fillPct}%` }} />
                            )}
                            <span className="font-bold relative z-10">{word.word}</span>
                            <span className="text-[9px] relative z-10" style={{ color: isFull ? 'var(--c-success)' : progress > 0 ? 'var(--c-warning)' : 'var(--c-text-muted)' }}>
                              {isFull ? '✓ 已掌握' : `${progress}/10`}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* 开始练习 */}
        {selectedWords.length > 0 && (
          <div className="sticky bottom-4">
            <Button variant="primary" size="lg" onClick={startPractice} className="w-full">
              开始练习 ({selectedWords.length} 词)
            </Button>
          </div>
        )}
      </div>
    </PageShell>
  )
}
