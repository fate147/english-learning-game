export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  ...props
}) {
  const base = 'inline-flex items-center justify-center font-bold transition-all duration-200 active:scale-[0.96] disabled:opacity-50 disabled:cursor-not-allowed select-none btn-ripple'

  const variants = {
    // 主按钮：渐变强调色
    primary:
      'rounded-xl bg-gradient-to-r from-[var(--theme-color)] to-[var(--theme-color-light)] text-white hover:brightness-110 shadow-lg',
    // 次要按钮：玻璃边框
    secondary:
      'rounded-xl border-2 border-white/30 bg-white/18 backdrop-blur-sm text-white hover:bg-white/25',
    // 游戏主按钮：大圆角粉渐变 + 特殊阴影（用于游戏结果/开始页）
    game:
      'rounded-2xl bg-gradient-to-r from-[var(--theme-color)] to-[var(--theme-color-light)] text-white shadow-[0_8px_24px_rgba(255,107,157,0.4)] hover:shadow-[0_12px_32px_rgba(255,107,157,0.5)] hover:-translate-y-1 hover:scale-[1.02] text-shadow',
    // 游戏次要按钮：玻璃半透明（用于游戏结果/开始页）
    glass:
      'rounded-2xl border-2 border-white/30 bg-white/18 backdrop-blur-sm text-white hover:bg-white/25 hover:-translate-y-1',
    // 幽灵按钮
    ghost:
      'rounded-xl bg-transparent text-white/60 hover:bg-white/10 hover:text-white',
    // 药丸标签（年级选择、Tab 切换）
    pill:
      'rounded-full text-xs font-bold transition-all duration-200 px-3 py-1.5',
    // 危险操作
    danger:
      'rounded-xl bg-red-500/80 text-white hover:bg-red-500',
  }

  const sizes = {
    sm:  'px-3 py-1.5 text-sm',
    md:  'px-5 py-2.5 text-base',
    lg:  'px-8 py-3.5 text-lg',
    xl:  'px-10 py-4 text-lg',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
