import { AVATARS } from '../../config/avatars.js'

export default function ChildCard({ child, isActive, onSelect }) {
  const avatar = child.avatar != null ? AVATARS[parseInt(child.avatar)] : null
  const stars = child.available_stars || 0
  const totalStars = child.total_earned_stars || 0
  const level = Math.floor(totalStars / 10) + 1

  return (
    <button
      onClick={() => onSelect(child)}
      className={`
        glass-card relative flex flex-col items-center p-4 transition-all duration-200 cursor-pointer
        ${isActive
          ? 'ring-2 ring-white/60 scale-[1.02]'
          : 'hover:scale-[1.02]'
        }
      `}
    >
      <div className="w-20 h-20 rounded-xl flex items-center justify-center mb-2">
        {avatar
          ? <span className="text-4xl">{avatar}</span>
          : <span className="text-2xl font-bold text-white/75">?</span>
        }
      </div>

      <div className="text-sm font-bold text-white truncate w-full text-center">{child.name}</div>

      <div className="flex items-center gap-1.5 mt-1.5 text-xs">
        <span className="px-1.5 py-0.5 rounded-full bg-emerald-800 text-white text-[10px] font-bold">
          Lv.{level}
        </span>
        <span className="text-yellow-400">★ {stars}</span>
      </div>
    </button>
  )
}
