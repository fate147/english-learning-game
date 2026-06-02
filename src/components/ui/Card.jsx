/**
 * 统一卡片组件
 *
 * variant:
 *   'default'  → 白色圆卡（游戏端）
 *   'dark'     → 深色卡片 + 边框（家长端）
 *   'translucent' → 半透明深色卡片（家长端装饰用）
 */
export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
}) {
  const paddings = {
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
  }

  const variants = {
    default: 'bg-white rounded-2xl shadow-lg',
    dark: 'bg-slate-800 rounded-2xl border border-slate-700',
    translucent: 'bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700',
  }

  return (
    <div className={`${variants[variant]} ${paddings[padding]} ${className}`}>
      {children}
    </div>
  )
}
