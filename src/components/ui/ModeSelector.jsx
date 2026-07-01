import { useState } from 'react'

const MODE_CONFIG = {
  game:    { label: '闯关', desc: '答题挑战', icon: '🎯', color: '#60a5fa' },
  memory:  { label: '记忆', desc: '背单词', icon: '🧠', color: '#c084fc' },
  dialogue:{ label: '对话', desc: '情景练习', icon: '💬', color: '#fbbf24' },
}

export default function ModeSelector({ modes, onSelect }) {
  const [hoveredMode, setHoveredMode] = useState(null)

  return (
    <div className="grid grid-cols-3 gap-0 divide-x divide-white/20">
      {modes.map((mode) => {
        const m = MODE_CONFIG[mode]
        if (!m) return null
        return (
          <button
            key={mode}
            onClick={() => onSelect(mode)}
            onMouseEnter={() => setHoveredMode(mode)}
            onMouseLeave={() => setHoveredMode(null)}
            className="flex flex-col items-center gap-1.5 py-4 px-2
                       border-b-2 border-transparent
                       text-white/75 transition-all duration-200
                       hover:text-white hover:bg-white/5
                       active:scale-[0.97] btn-ripple"
            style={{ borderBottomColor: hoveredMode === mode ? m.color : 'transparent' }}
          >
            <span className="text-xl">{m.icon}</span>
            <span className="text-xs font-bold">{m.label}</span>
          </button>
        )
      })}
    </div>
  )
}
