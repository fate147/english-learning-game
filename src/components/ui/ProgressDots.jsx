export default function ProgressDots({ total, current = -1, answers = [] }) {
  return (
    <div className="relative z-10 flex items-center justify-center gap-2 px-4 mb-2" role="progressbar" aria-valuenow={current + 1} aria-valuemin={1} aria-valuemax={total} aria-label={`第 ${current + 1} 题，共 ${total} 题`}>
      <span className="sm:hidden text-xs font-bold text-[var(--c-text-muted)] min-w-[3rem] text-right">
        {current + 1}/{total}
      </span>
      <div className="progress-dots max-sm:hidden">
        {Array.from({ length: total }, (_, i) => {
          let dotClass = 'progress-dot'
          const answer = answers[i]
          if (answer) {
            dotClass += answer.correct ? ' correct' : ' wrong'
          } else if (i === current) {
            dotClass += ' active'
          }
          return <span key={i} className={dotClass} aria-hidden="true" />
        })}
      </div>
    </div>
  )
}
