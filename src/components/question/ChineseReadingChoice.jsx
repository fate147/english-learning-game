import { useState, useRef, useEffect } from 'react'

const STAGE_LABELS = {
  1: { label: '选标题', color: 'bg-emerald-500' },
  2: { label: '段落大意', color: 'bg-sky-500' },
  3: { label: '推理理解', color: 'bg-amber-500' },
  4: { label: '概括填空', color: 'bg-violet-500' },
  5: { label: '综合挑战', color: 'bg-rose-500' },
}

function vibrate(pattern) {
  try { navigator.vibrate?.(pattern) } catch {}
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
    <div className="page-enter w-full max-w-2xl mx-auto space-y-4 sm:space-y-5">
      <div className="flex items-center justify-between">
        <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${stageInfo.color}`}>
          {stageInfo.label}
        </span>
        <span className="text-white/70 text-xs">第 {question.stage} 阶</span>
      </div>

      <div className="bg-white/12 backdrop-blur-md rounded-2xl p-5 border border-white/15">
        <div className="text-white text-base leading-relaxed" style={{textShadow: '0 1px 3px rgba(0,0,0,0.15)'}}>
          {question.passage}
        </div>
      </div>

      <div className="text-white text-lg font-bold glass-text">
        {question.question}
      </div>

      <div className="space-y-3">
        {question.options.map((opt, idx) => {
          const isSelected = revealed && selected === idx
          const isThisCorrect = revealed && opt.correct

          let btnClass = 'bg-white/12 hover:bg-white/20 border-white/20 text-white'
          let animClass = ''
          if (isSelected) {
            btnClass = opt.correct
              ? 'bg-emerald-500/80 border-emerald-400 text-white ring-2 ring-emerald-300'
              : 'bg-red-500/80 border-red-400 text-white'
            animClass = opt.correct ? 'option-correct' : 'option-wrong'
          } else if (isThisCorrect) {
            btnClass = 'bg-emerald-500/40 border-emerald-400/60 text-white ring-1 ring-emerald-300/50'
            animClass = 'option-reveal-correct'
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={disabled || revealed}
              className={`w-full p-4 rounded-xl border-2 text-left font-medium transition-all
                ${btnClass} ${animClass}
                ${!revealed && !disabled ? 'active:scale-[0.98]' : ''}
              `}
            >
              <span className="inline-block w-7 h-7 rounded-lg bg-white/10 text-center leading-7 mr-3 text-sm font-bold shrink-0">
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
