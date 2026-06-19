/**
 * 骨架屏加载组件
 *
 * @param {string} [className] - 额外的容器样式
 * @param {number} [lines=3] - 行数（text variant）
 * @param {string} [variant='text'] - 'text' | 'card' | 'circle'
 */
export default function Skeleton({ className = '', lines = 3, variant = 'text' }) {
  if (variant === 'circle') {
    return (
      <div className={`animate-pulse rounded-full bg-white/10 ${className}`} />
    )
  }

  if (variant === 'card') {
    return (
      <div className={`animate-pulse rounded-2xl bg-white/10 border border-white/10 ${className}`}>
        <div className="p-6 space-y-4">
          <div className="h-4 bg-white/10 rounded w-1/3" />
          <div className="h-8 bg-white/10 rounded w-1/2" />
          <div className="h-3 bg-white/10 rounded w-2/3" />
        </div>
      </div>
    )
  }

  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className="h-3 bg-white/10 rounded"
          style={{ width: `${70 + (i * 7) % 30}%` }}
        />
      ))}
    </div>
  )
}
