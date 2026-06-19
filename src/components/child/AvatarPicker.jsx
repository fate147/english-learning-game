import { AVATARS } from '../../config/avatars.js'

export default function AvatarPicker({ selected, onSelect }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-2 text-center">选择头像</label>
      <div className="grid grid-cols-4 gap-2">
        {AVATARS.map((emoji, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(String(index))}
            className={`
              text-3xl p-2 rounded-xl transition-all
              ${selected === String(index)
                ? 'bg-[var(--theme-color)] bg-opacity-20 ring-2 ring-[var(--theme-color)] scale-110'
                : 'bg-gray-50 hover:bg-gray-100'
              }
            `}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}
