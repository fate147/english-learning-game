import { useState, useRef, useEffect } from 'react'
import { vibrate } from '../../lib/haptics.js'

const STAGE_LABELS = {
  1: { label: '选标题', color: 'bg-emerald-400/30 text-emerald-200' },
  2: { label: '段落大意', color: 'bg-sky-400/30 text-sky-200' },
  3: { label: '推理理解', color: 'bg-amber-400/30 text-amber-200' },
  4: { label: '概括填空', color: 'bg-violet-400/30 text-violet-200' },
  5: { label: '综合挑战', color: 'bg-rose-400/30 text-rose-200' },
}

export default function ChineseReadingChoice({ question, onAnswer, disabled }) {
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const timerRef = useRef(null)

  const stageInfo = STAGE_LABELS[question.stage] || STAGE_LABELS[1]

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  useEffect(() => {
    setSelected(null)
    setRevealed(false)
  }, [question.id])

  const handleSelect = (idx) => {
    if (disabled || revealed) return
    setSelected(idx)
    setRevealed(true)
    const isCorrect = question.options[idx].correct
    if (!isCorrect) vibrate([80, 40, 80])
    timerRef.current = setTimeout(() => {
      onAnswer(isCorrect)
      setSelected(null)
      setRevealed(false)
    }, 1500)
  }

  return (
    <div className="page-enter w-full max-w-2xl mx-auto space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between">
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${stageInfo.color}`}>
          {stageInfo.label}
        </span>
        <span className="text-white/75 text-xs">第 {question.stage} 阶</span>
      </div>

      <div className="glass-card p-4">
        <div className="text-white text-sm leading-relaxed">
          {question.passage}
        </div>
      </div>

      <div className="text-white text-base font-bold">
        {question.question}
      </div>

      <div className="space-y-2">
        {question.options.map((opt, idx) => {
          const isSelected = revealed && selected === idx
          const isThisCorrect = revealed && opt.correct

          let btnClass = 'glass-card hover:bg-white/15 border-white/30 text-white cursor-pointer'
          let animClass = ''
          if (isSelected) {
            btnClass = opt.correct
              ? 'bg-green-400/30 border-green-400 text-green-200 ring-2 ring-green-400/50'
              : 'bg-red-400/30 border-red-400 text-red-200'
            animClass = opt.correct ? 'option-correct' : 'option-wrong'
          } else if (isThisCorrect) {
            btnClass = 'bg-green-400/20 border-green-400/50 text-green-200'
            animClass = 'option-reveal-correct'
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={disabled || revealed}
              className={`w-full p-4 rounded-xl border-2 text-left font-medium transition-all text-sm
                ${btnClass} ${animClass}
                ${!revealed && !disabled ? 'active:scale-[0.97]' : ''}
              `}
            >
              <span className="inline-block w-7 h-7 rounded-full bg-white/20 text-center leading-7 mr-3 text-xs font-bold shrink-0">
                {String.fromCharCode(65 + idx)}
              </span>
              {opt.text}
            </button>
          )
        })}
      </div>
    </div>
  )
}
