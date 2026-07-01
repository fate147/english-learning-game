export default function PageShell({
  children,
  title,
  onBack,
  rightAction,
  className = '',
}) {
  const showHeader = title || onBack || rightAction

  return (
    <div className={`min-h-screen flex flex-col bg-[var(--c-bg-secondary)] ${className}`}>
      {showHeader && (
        <header className="sticky top-0 z-40 bg-inherit/80 backdrop-blur-sm">
          <div className="w-full max-w-content mx-auto px-4 sm:px-6">
            <div className="flex items-center h-14 gap-3">
              <div className="w-20 shrink-0">
                {onBack && (
                  <button
                    onClick={onBack}
                    className="text-sm font-semibold transition-colors text-[var(--c-text-secondary)] hover:text-[var(--c-text)]"
                  >
                    ← 返回
                  </button>
                )}
              </div>

              {title && (
                <h1 className="flex-1 text-center font-bold truncate text-[var(--c-text)]">
                  {title}
                </h1>
              )}

              {rightAction && (
                <div className="w-20 shrink-0 flex justify-end">
                  {rightAction}
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      <main className="flex-1 w-full max-w-content mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>
    </div>
  )
}
