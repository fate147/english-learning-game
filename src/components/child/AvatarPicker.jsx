import { AVATARS } from '../../config/avatars.js'

export default function AvatarPicker({ selected, onSelect }) {
  return (
    <div>
      <label className="input-label text-center mb-2 block">选择头像</label>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {AVATARS.map((emoji, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(String(index))}
            className={`
              text-2xl p-2 rounded-lg transition-all shrink-0
              ${selected === String(index)
                ? 'bg-[var(--c-primary)]/15 ring-2 ring-[var(--c-primary)] scale-105'
                : 'bg-[var(--c-bg-secondary)] hover:bg-[var(--c-border)] border border-[var(--c-border)]'
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
