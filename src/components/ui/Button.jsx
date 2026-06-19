export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  ...props
}) {
  const base = 'rounded-xl font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed btn-ripple'

  const variants = {
    primary: 'bg-gradient-to-r from-[var(--theme-color)] to-[var(--theme-color-light)] text-white hover:brightness-110 shadow-lg',
    secondary: 'bg-white/20 border-2 border-white/40 text-white hover:bg-white/30',
    'secondary-dark': 'bg-slate-700 text-slate-300 border-2 border-slate-600 hover:bg-slate-600',
    ghost: 'bg-transparent text-white/60 hover:bg-white/10 hover:text-white',
    danger: 'bg-red-500/80 text-white hover:bg-red-500',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-8 py-3.5 text-lg',
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
