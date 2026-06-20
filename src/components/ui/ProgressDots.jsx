/**
 * 统一进度点组件
 *
 * @param {number} total - 总题数
 * @param {number} current - 当前活跃索引（-1 表示无）
 * @param {Array<{correct: boolean}>} answers - 已答结果数组，按索引访问
 */
export default function ProgressDots({ total, current = -1, answers = [] }) {
  return (
    <div className="relative z-10 flex justify-center px-4 mb-2" role="progressbar" aria-valuenow={current + 1} aria-valuemin={1} aria-valuemax={total} aria-label={`第 ${current + 1} 题，共 ${total} 题`}>
      <div className="progress-dots">
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
