import { useState } from 'react'
import { CHARACTERS } from '../../config/characters.js'
import { useGameTheme } from '../../context/GameThemeContext.jsx'
import GameHeader from '../ui/GameHeader.jsx'
import Button from '../ui/Button.jsx'
import StarRain from '../ui/StarRain.jsx'

export default function StartScreen({ onStart, totalEarnedStars, level, defaultChar, onBack }) {
  const [selectedChar, setSelectedChar] = useState(defaultChar || 'dragon')
  const { gameTheme } = useGameTheme()

  return (
    <div className={`min-h-screen ${gameTheme.pattern} flex flex-col relative`}>
      <StarRain count={15} />
      <div className="relative z-10">
        <GameHeader
          onBack={onBack}
          title="选一个小伙伴"
          stars={totalEarnedStars}
        />

        <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
          <p className="text-white/80 text-sm font-medium mb-6">选择一个小伙伴开始学习吧</p>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full max-w-sm sm:max-w-md">
            {CHARACTERS.map((c) => {
              const isActive = selectedChar === c.id
              const imgExpr = isActive ? 'happy' : 'normal'
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedChar(c.id)}
                  className={`glass-card flex flex-col items-center gap-2 p-4 border-2 transition-all duration-150 ${isActive ? 'ring-2 ring-white/60 scale-[1.02]' : 'hover:scale-[1.02]'}`}
                >
                  <div className="w-full aspect-square rounded-lg overflow-hidden flex items-center justify-center">
                    <img
                      src={`images/${c.image || c.id}_${imgExpr}.${c.ext || 'webp'}`}
                      alt={c.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.classList.add('no-img') }}
                    />
                  </div>
                  <span className="text-sm font-bold text-white">{c.name}</span>
                </button>
              )
            })}
          </div>

          <div className="w-full max-w-md mt-8">
            <Button
              variant="primary"
              size="lg"
              onClick={() => onStart(selectedChar)}
              className="w-full"
            >
              开始游戏
            </Button>
          </div>
        </main>
      </div>
    </div>
  )
}
