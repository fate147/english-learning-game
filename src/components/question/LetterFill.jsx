import { useState, useMemo, useEffect, useRef } from 'react'
import { generateBlanks } from '../../engines/questionEngine.js'
import { STRINGS } from '../../config/strings.js'

export default function LetterFill({ question, onAnswer, unit }) {
  const [blanks, setBlanks] = useState([])
  const [candidates, setCandidates] = useState({})
  const [showResult, setShowResult] = useState(false)
  const [resultCorrect, setResultCorrect] = useState(null)
  const [audioFailed, setAudioFailed] = useState(false)
  const audioRef = useRef(null)
  const timerRef = useRef(null)

  const { blanks: initialBlanks, candidates: initialCandidates } = useMemo(
    () => generateBlanks(question.word),
    [question.word]
  )

  // 新题重置
  useEffect(() => {
    setBlanks(initialBlanks.map((b) => ({ ...b, filled: null })))
    setCandidates({ ...initialCandidates })
    setShowResult(false)
    setResultCorrect(null)
    setAudioFailed(false)
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [initialBlanks, initialCandidates])

  // 卸载清理
  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  const playAudio = () => {
    setAudioFailed(false)
    const el = audioRef.current
    if (!el) return
    el.load()
    el.play().catch(() => setAudioFailed(true))
  }

  const letters = question.word.split('')
  const blankIndices = blanks.map((b) => b.index)

  // 点击候选字母
  const handleCandidateClick = (letter) => {
    if (showResult) return
    const firstEmpty = blanks.findIndex((b) => !b.filled)
    if (firstEmpty === -1) return
    if (candidates[letter] <= 0) return

    const newCandidates = { ...candidates }
    newCandidates[letter] -= 1
    setCandidates(newCandidates)

    const newBlanks = blanks.map((b, i) =>
      i === firstEmpty ? { ...b, filled: letter } : b
    )
    setBlanks(newBlanks)

    // 全部填完 → 自动判断
    const allFilled = newBlanks.every((b) => b.filled)
    if (allFilled) {
      const allCorrect = newBlanks.every(
        (b) => b.filled === b.correctLetter.toLowerCase()
      )
      setShowResult(true)
      setResultCorrect(allCorrect)

      const delay = allCorrect ? 1200 : 3000
      timerRef.current = setTimeout(() => {
        onAnswer(allCorrect)
      }, delay)
    }
  }

  // 点击已填槽 → 回退字母（仅判断前可用）
  const handleBlankClick = (blankIndex) => {
    if (showResult) return
    const blank = blanks[blankIndex]
    if (!blank.filled) return

    const newCandidates = { ...candidates }
    newCandidates[blank.filled] = (newCandidates[blank.filled] || 0) + 1
    setCandidates(newCandidates)

    const newBlanks = blanks.map((b, i) =>
      i === blankIndex ? { ...b, filled: null } : b
    )
    setBlanks(newBlanks)
  }

  // 候选区是否全部禁用（出结果后）
  const allDisabled = showResult

  return (
    <div className="page-enter flex flex-col items-center gap-6">
      <audio ref={audioRef} preload="none">
        <source src={`audio/${question.wordId}.mp3`} type="audio/mpeg" />
      </audio>

      {/* 题目提示 + 语音按钮 */}
      <div className="q-card-glass w-full max-w-sm">
        <div className="text-xs font-bold tracking-wider text-white/60 uppercase mb-2">
          ✏️ {STRINGS.letterFill.hint}
        </div>
        <div className="flex items-center justify-center gap-3">
          <span className="text-lg font-extrabold text-white">&ldquo;{question.meaning}&rdquo;</span>
          <button
            onClick={playAudio}
            className="w-9 h-9 rounded-full bg-white/20 text-white text-sm font-bold
                       hover:bg-white/30 transition-all flex items-center justify-center"
            title="听发音"
            disabled={allDisabled}
          >
            🔊
          </button>
        </div>
      </div>

      {/* 填字区 — 新紫色背景适配 */}
      <div className="flex justify-center items-center gap-1.5 flex-wrap max-w-sm mx-auto">
        {letters.map((letter, i) => {
          const isBlank = blankIndices.includes(i)
          const blank = blanks.find((b) => b.index === i)
          const isFilled = blank?.filled

          let slotStyle = ''
          if (!isBlank) {
            // 已知字母 — 半透明白底
            slotStyle = 'bg-white/20 border border-white/20 text-white/80'
          } else if (showResult) {
            // 结果展示
            const correct = blank?.filled?.toLowerCase() === blank?.correctLetter?.toLowerCase()
            if (correct) {
              slotStyle = 'border-2 border-green-400 bg-green-500/20 text-green-300'
            } else {
              slotStyle = 'border-2 border-red-400 bg-red-500/20 text-red-300'
            }
          } else if (isFilled) {
            // 已填未判断 — 绿色
            slotStyle = 'border-2 border-green-400/60 bg-green-500/15 text-green-300 cursor-pointer hover:brightness-95'
          } else {
            // 空格 — 白色虚线框
            slotStyle = 'border-2 border-dashed border-white/40 empty-slot-purple'
          }

          return (
            <div
              key={i}
              onClick={() => isBlank && handleBlankClick(blankIndices.indexOf(i))}
              className={`
                w-[52px] h-[58px] rounded-xl text-center leading-[58px]
                text-[28px] font-bold transition-all duration-200 select-none
                ${slotStyle}
              `}
            >
              {isBlank
                ? showResult
                  ? blank?.correctLetter
                  : isFilled
                    ? blank.filled
                    : ''
                : letter
              }
            </div>
          )
        })}
      </div>

      {/* 候选字母区 */}
      <div className="flex justify-center gap-2.5 flex-wrap max-w-xs mx-auto">
        {(() => {
          const buttons = []
          for (const [letter, count] of Object.entries(candidates)) {
            for (let i = 0; i < count; i++) {
              buttons.push(
                <button
                  key={`${letter}-${i}`}
                  onClick={() => handleCandidateClick(letter)}
                  disabled={allDisabled}
                  className={`
                    w-[52px] h-[52px] rounded-xl font-bold text-2xl
                    transition-all duration-150 select-none
                    ${allDisabled
                      ? 'bg-white/10 text-white/30 cursor-not-allowed'
                      : 'bg-white/25 text-white border-2 border-white/20 cursor-pointer hover:bg-white/35 hover:-translate-y-0.5 active:scale-[0.92]'
                    }
                  `}
                >
                  {letter}
                </button>
              )
            }
          }
          return buttons
        })()}
      </div>
    </div>
  )
}
