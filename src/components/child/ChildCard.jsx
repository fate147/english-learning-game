import { AVATARS } from '../../config/avatars.js'

export default function ChildCard({ child, isActive, onSelect }) {
  const avatar = child.avatar != null ? AVATARS[parseInt(child.avatar)] || '🐱' : '🐱'
  const stars = child.available_stars || 0
  const totalStars = child.total_earned_stars || 0
  const level = Math.floor(totalStars / 10) + 1

  return (
    <button
      onClick={() => onSelect(child)}
      className={`
        relative flex flex-col items-center p-6 sm:p-7 rounded-2xl transition-all duration-300 btn-ripple
        ${isActive
          ? 'bg-white/28 text-white border-2 border-[var(--color-focus)] shadow-lg child-card-active'
          : 'bg-white/12 text-white/80 border-2 border-white/18 hover:bg-white/18 hover:border-white/30 hover:shadow-md hover:-translate-y-1'
        }
      `}
    >
      {/* 选中光效 */}
      {isActive && <div className="absolute inset-0 rounded-2xl child-card-glow pointer-events-none" />}

      {/* 头像 */}
      <div className={`text-5xl sm:text-6xl mb-3 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
        {avatar}
      </div>

      {/* 名字 */}
      <div className="text-lg font-black">{child.name}</div>

      {/* 等级 + 星星 */}
      <div className={`flex items-center gap-2 mt-1.5 text-xs ${isActive ? 'text-white/80' : 'text-white/50'}`}>
        <span className="px-1.5 py-0.5 rounded-md bg-white/10 font-bold">Lv.{level}</span>
        <span>⭐ {stars}</span>
      </div>
    </button>
  )
}
