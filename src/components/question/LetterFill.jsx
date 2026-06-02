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
    <div className="page-enter">
      <audio ref={audioRef} preload="none">
        <source src={`/audio/${question.wordId}.mp3`} type="audio/mpeg" />
      </audio>

      {/* 题目提示 + 语音按钮 */}
      <div className="text-center mb-6">
        <p className="text-sm text-gray-500 mb-2">{STRINGS.letterFill.hint}</p>
        <div className="flex items-center justify-center gap-3">
          <p className="text-lg font-medium text-gray-700">&ldquo;{question.meaning}&rdquo;</p>
          <button
            onClick={playAudio}
            className="w-10 h-10 rounded-full bg-green-500 text-white text-sm font-bold
                       hover:brightness-110 transition-all flex items-center justify-center"
            title="听发音"
            disabled={allDisabled}
          >
            {audioFailed ? '!' : '听'}
          </button>
        </div>
      </div>

      {/* 填字区 — 旧版风格 */}
      <div className="flex justify-center items-center gap-1.5 mb-8 flex-wrap max-w-sm mx-auto">
        {letters.map((letter, i) => {
          const isBlank = blankIndices.includes(i)
          const blank = blanks.find((b) => b.index === i)
          const isFilled = blank?.filled

          let slotStyle = ''
          if (!isBlank) {
            // 已知字母 — 浅底浅字
            slotStyle = 'border-2 border-[#e1e6ff] bg-[#f5f7ff] text-[#555]'
          } else if (showResult) {
            // 结果展示
            const correct = blank?.filled?.toLowerCase() === blank?.correctLetter?.toLowerCase()
            if (correct) {
              slotStyle = 'border-2 border-[#4CAF50] bg-[#f0fff0] text-[#2f8f34]'
            } else {
              slotStyle = 'border-2 border-[#f44336] bg-[#fff0f0] text-[#d94235]'
            }
          } else if (isFilled) {
            // 已填未判断 — 绿色
            slotStyle = 'border-2 border-[#4CAF50] bg-[#f0fff0] text-[#2f8f34] cursor-pointer hover:brightness-95'
          } else {
            // 空格 — 旧版紫色边框 + 闪烁光标
            slotStyle = 'border-2 border-[#667eea] empty-slot'
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

      {/* 候选字母区 — 旧版风格 */}
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
                      ? 'border-2 border-[#eee] bg-[#f5f5f5] text-[#ccc] cursor-not-allowed'
                      : 'border-2 border-[#ddd] bg-white text-[#333] cursor-pointer hover:border-[#667eea] hover:bg-[#f0f4ff] hover:-translate-y-0.5 active:scale-[0.92]'
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
