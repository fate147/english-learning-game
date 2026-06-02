/**
 * 统一页面外壳组件
 *
 * theme="game"  → 渐变背景（儿童游戏端）
 * theme="parent" → 深色背景（家长控制台）
 */
export default function PageShell({
  children,
  title,
  onBack,
  rightAction,
  theme = 'game',
  className = '',
}) {
  const isGame = theme === 'game'
  const showHeader = title || onBack || rightAction

  return (
    <div className={`min-h-screen flex flex-col ${isGame ? 'game-page-bg' : 'bg-slate-900 theme-dark'} ${className}`}>
      {/* 顶部导航栏（仅在有 title / onBack / rightAction 时显示） */}
      {showHeader && (
        <header className="sticky top-0 z-40 backdrop-blur-sm bg-inherit">
          <div className="w-full max-w-content mx-auto px-4 sm:px-6">
            <div className="flex items-center h-14 gap-3">
              {/* 左侧：返回按钮 */}
              <div className="w-20 shrink-0">
                {onBack && (
                  <button
                    onClick={onBack}
                    className={`text-sm font-medium transition-colors
                      ${isGame ? 'text-white/70 hover:text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    ← 返回
                  </button>
                )}
              </div>

              {/* 中间：标题 */}
              {title && (
                <h1 className={`flex-1 text-center font-bold truncate
                  ${isGame ? 'text-white' : 'text-slate-100'}`}
                >
                  {title}
                </h1>
              )}

              {/* 右侧：操作区 */}
              {rightAction && (
                <div className="w-20 shrink-0 flex justify-end">
                  {rightAction}
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      {/* 内容区 — 响应式容器 */}
      <main className="flex-1 w-full max-w-content mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>
    </div>
  )
}
