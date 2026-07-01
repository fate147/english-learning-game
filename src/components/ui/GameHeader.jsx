export default function GameHeader({
  onBack,
  title,
  children,
  stars,
  className = '',
}) {
  return (
    <header className="game-header relative z-10">
      <div className="max-w-lg mx-auto px-4 py-4">
        <div className={`flex items-center justify-between ${className}`}>
          <div className="w-20 shrink-0">
            {onBack && (
              <button onClick={onBack} className="text-sm font-semibold text-white/70 hover:text-white transition-colors">
                ← 返回
              </button>
            )}
          </div>

          <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
            {children || (title && (
              <h1 className="text-base font-bold text-white truncate">
                {title}
              </h1>
            ))}
          </div>

          <div className="w-20 shrink-0 flex justify-end">
            {stars !== null && stars !== undefined && (
              <span className="text-sm font-bold text-white"><span className="text-yellow-400">★</span> {stars}</span>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
