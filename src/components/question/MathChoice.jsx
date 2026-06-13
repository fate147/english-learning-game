import { useState } from 'react'

const STAGE_LABELS = {
  concrete: { label: '🧱 具体', color: 'bg-orange-500' },
  pictorial: { label: '📊 图像', color: 'bg-blue-500' },
  abstract: { label: '🔢 抽象', color: 'bg-purple-500' },
  synthesis: { label: '🧩 综合', color: 'bg-rose-500' },
}

export default function MathChoice({ question, onAnswer, disabled }) {
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)

  const stageInfo = STAGE_LABELS[question.stage] || STAGE_LABELS.abstract

  const handleSelect = (idx) => {
    if (disabled || revealed) return
    setSelected(idx)
    setRevealed(true)
    const isCorrect = question.options[idx].correct
    setTimeout(() => {
      onAnswer(isCorrect)
      setSelected(null)
      setRevealed(false)
    }, 1500)
  }

  return (
    <div className="page-enter w-full max-w-2xl mx-auto space-y-4">
      {/* 阶数标签 */}
      <div className="flex items-center justify-between">
        <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${stageInfo.color}`}>
          {stageInfo.label}
        </span>
        <span className="text-white/50 text-xs">{question.stage}</span>
      </div>

      {/* 图示区域（如有） */}
      {question.visual && (
        <div className="bg-white/15 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex justify-center">
          <pre className="text-white/90 text-lg leading-relaxed font-mono text-center">
            {question.visual}
          </pre>
        </div>
      )}

      {/* 故事/题目背景（抽象/综合题用） */}
      {question.questionLabel && (
        <div className="bg-white/15 backdrop-blur-md rounded-2xl p-5 border border-white/10">
          <div className="text-white/90 text-base leading-relaxed">
            {question.question}
          </div>
        </div>
      )}

      {/* 问题/提示 */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
        <div className="text-white/90 text-base leading-relaxed glass-text">
          {question.questionLabel || question.question}
        </div>
      </div>

      {/* 选项 */}
      <div className="space-y-3">
        {question.options.map((opt, idx) => {
          let btnClass = 'bg-white/20 hover:bg-white/30 border-white/20 text-white'
          if (revealed && selected === idx) {
            btnClass = opt.correct
              ? 'bg-emerald-500 border-emerald-400 text-white ring-2 ring-emerald-300'
              : 'bg-red-500/80 border-red-400 text-white'
          } else if (revealed && opt.correct && selected !== idx) {
            btnClass = 'bg-emerald-500/40 border-emerald-400/60 text-white ring-1 ring-emerald-300/50'
          }
          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={disabled || revealed}
              className={`w-full p-4 rounded-xl border-2 text-left font-medium transition-all
                ${btnClass}
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
