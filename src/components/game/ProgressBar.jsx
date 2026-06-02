export default function ProgressBar({ current, total }) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
        <span>进度</span>
        <span>{current} / {total}</span>
      </div>
      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-[var(--theme-color)] transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
