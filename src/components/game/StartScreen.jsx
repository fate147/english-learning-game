import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../ui/Button.jsx'
import Card from '../ui/Card.jsx'
import PageShell from '../ui/PageShell.jsx'
import { CHARACTERS } from '../../config/characters.js'
import { STRINGS } from '../../config/strings.js'

export default function StartScreen({ onStart, totalEarnedStars, level, defaultChar, onBack }) {
  const [selectedChar, setSelectedChar] = useState(defaultChar || 'dragon')
  const navigate = useNavigate()

  return (
    <PageShell title={STRINGS.game.startTitle} onBack={onBack}>
      <div className="flex flex-col items-center gap-6 py-4">
        {/* 等级 + 星星 */}
        <div className="flex items-center gap-4 text-white/80 text-sm">
          <span>{STRINGS.game.levelLabel.replace('{n}', level)}</span>
          <span>{STRINGS.game.starLabel.replace('{n}', totalEarnedStars)}</span>
        </div>

        {/* 四个角色 */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
          {CHARACTERS.map((c) => {
            const isActive = selectedChar === c.id
            const imgExpr = isActive ? 'happy' : 'normal'
            return (
              <button
                key={c.id}
                onClick={() => setSelectedChar(c.id)}
                className={`flex flex-col items-center gap-1 transition-all
                  ${isActive ? 'scale-110' : 'opacity-60 hover:opacity-90'}`}
              >
                <div className={`w-full aspect-square rounded-xl overflow-hidden ${isActive ? 'ring-2 ring-green-400 ring-offset-2 ring-offset-transparent' : ''}`}>
                  <img
                    src={`images/${c.image || c.id}_${imgExpr}.${c.ext || 'webp'}`}
                    alt={c.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                </div>
                <span className="text-sm text-white font-medium">{c.name}</span>
              </button>
            )
          })}
        </div>

        {/* 两个同级按钮 */}
        <div className="flex gap-4 w-full max-w-xs">
          <button
            onClick={() => onStart(selectedChar)}
            className="flex-1 py-3.5 rounded-xl bg-white text-[var(--theme-color-dark)] font-bold text-base
                       shadow-md hover:brightness-110 active:scale-95 transition-all"
          >
            {STRINGS.game.startButton}
          </button>
          <button
            onClick={() => navigate('/memory')}
            className="flex-1 py-3.5 rounded-xl border-2 border-white/50 text-white font-bold text-base
                       hover:bg-white/10 active:scale-95 transition-all"
          >
            {STRINGS.wordMemory.title}
          </button>
        </div>
      </div>
    </PageShell>
  )
}
