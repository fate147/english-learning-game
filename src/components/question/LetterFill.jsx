import { useState, useMemo, useEffect, useRef } from 'react'
import { generateBlanks } from '../../engines/questionEngine.js'
import { speakText } from '../dialogue/tts.js'

export default function LetterFill({ question, onAnswer, unit, disabled }) {
  const [blanks, setBlanks] = useState([])
  const [candidates, setCandidates] = useState({})
  const [showResult, setShowResult] = useState(false)
  const [resultCorrect, setResultCorrect] = useState(null)
  const [audioFailed, setAudioFailed] = useState(false)
  const timerRef = useRef(null)

  const { blanks: initialBlanks, candidates: initialCandidates } = useMemo(
    () => generateBlanks(question.word),
    [question.word]
  )

  useEffect(() => {
    setBlanks(initialBlanks.map((b) => ({ ...b, filled: null })))
    setCandidates({ ...initialCandidates })
    setShowResult(false)
    setResultCorrect(null)
    setAudioFailed(false)
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [initialBlanks, initialCandidates])

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  const playAudio = async () => {
    setAudioFailed(false)
    const success = await speakText(question.word)
    if (!success) setAudioFailed(true)
  }

  const letters = question.word.split('')
  const blankIndices = blanks.map((b) => b.index)

  const handleCandidateClick = (letter) => {
    if (showResult) return
    const firstEmpty = blanks.findIndex((b) => !b.filled)
    if (firstEmpty === -1) return
    if (candidates[letter] <= 0) return

    const newCandidates = { ...candidates }
    newCandidates[letter] -= 1
    setCandidates(newCandidates)

    const newBlanks = blanks.map((b, i) =>
      i === firstEmpty ? { ...b, filled: letter, _justFilled: true } : b
    )
    setBlanks(newBlanks)

    const allFilled = newBlanks.every((b) => b.filled)
    if (allFilled) {
      const allCorrect = newBlanks.every(
        (b) => b.filled === b.correctLetter.toLowerCase()
      )
      setShowResult(true)
      setResultCorrect(allCorrect)
      if (!allCorrect) {
        try { navigator.vibrate?.([80, 40, 80]) } catch {}
      }

      const delay = allCorrect ? 1200 : 3000
      timerRef.current = setTimeout(() => {
        onAnswer(allCorrect)
      }, delay)
    }
  }

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

  const allDisabled = showResult || disabled

  return (
    <div className="page-enter flex flex-col items-center gap-5 sm:gap-6">
      <div className="glass-card w-full max-w-sm text-center p-6">
          <div className="text-xs font-bold tracking-wider text-white/80 uppercase mb-3">
            ✏️ 根据发音和释义，填入正确的字母
          </div>
          <div className="flex items-center justify-center gap-3">
            <span className="text-lg font-bold text-white">&ldquo;{question.meaning}&rdquo;</span>
            <button
              onClick={playAudio}
              className="w-8 h-8 rounded-full bg-white/20 text-white text-sm font-bold
                         hover:bg-white/30 transition-all flex items-center justify-center"
              aria-label="播放发音"
              disabled={allDisabled}
            >
              🔊
            </button>
          </div>
      </div>

      <div className="flex justify-center items-center gap-1.5 flex-wrap max-w-sm mx-auto">
        {letters.map((letter, i) => {
          const isBlank = blankIndices.includes(i)
          const blank = blanks.find((b) => b.index === i)
          const isFilled = blank?.filled

          let slotStyle = ''
          if (!isBlank) {
            slotStyle = 'border border-white/30 text-white/90'
          } else if (showResult) {
            const correct = blank?.filled?.toLowerCase() === blank?.correctLetter?.toLowerCase()
            if (correct) {
              slotStyle = 'border-2 border-green-400 bg-green-400/20 text-green-300'
            } else {
              slotStyle = 'border-2 border-red-400 bg-red-400/20 text-red-300'
            }
          } else if (isFilled) {
            slotStyle = 'border-2 border-green-400/60 bg-green-400/10 text-green-300 cursor-pointer'
          } else {
            slotStyle = 'border-2 border-dashed border-white/30'
          }

          const isClickable = isBlank && (isFilled || !showResult)
          return (
            <button
              key={i}
              type="button"
              onClick={() => isBlank && handleBlankClick(blankIndices.indexOf(i))}
              disabled={!isClickable}
              aria-label={isBlank ? (isFilled ? `已填入 ${blank.filled}，点击移除` : `第 ${i + 1} 个字母空位`) : letter}
              className={`
                w-[48px] h-[52px] rounded-lg text-center leading-[52px]
                text-[24px] font-bold transition-all duration-150 select-none
                ${slotStyle}
                ${isFilled && blank?._justFilled && !showResult ? 'letter-fly-in' : ''}
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
            </button>
          )
        })}
      </div>

      <div className="flex justify-center gap-2 flex-wrap max-w-xs mx-auto">
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
                    w-[48px] h-[48px] rounded-lg font-bold text-xl
                    transition-all duration-150 select-none
                    ${allDisabled
                      ? 'bg-white/10 text-white/40 cursor-not-allowed border border-white/15'
                      : 'text-white border-2 border-white/20 cursor-pointer hover:border-white/50 hover:bg-white/10 active:scale-[0.97]'
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
