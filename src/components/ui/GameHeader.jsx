/**
 * 统一游戏端顶部导航栏
 *
 * 支持三种模式：
 * - 纯标题: <GameHeader title="💬 对话练习" />
 * - 自定义中间区: <GameHeader>自定义内容</GameHeader>
 * - 隐藏星星: <GameHeader stars={null} />
 */
export default function GameHeader({
  onBack,
  title,
  children,
  stars,
  className = '',
}) {
  return (
    <header className="relative z-10">
      <div className="max-w-lg mx-auto px-4 py-4">
        <div className={`flex items-center justify-between header-light ${className}`}>
          <div className="w-20 shrink-0">
            {onBack && (
              <button onClick={onBack} className="back-btn">
                ← 返回
              </button>
            )}
          </div>

          <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
            {children || (title && (
              <h1 className="text-base font-black text-white truncate"
                  style={{ textShadow: '0 1px 6px rgba(0,0,0,0.3)' }}>
                {title}
              </h1>
            ))}
          </div>

          <div className="w-20 shrink-0 flex justify-end">
            {stars !== null && stars !== undefined && (
              <span className="stars-display">⭐ {stars}</span>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
