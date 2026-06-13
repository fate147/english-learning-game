import { useState } from 'react'
import { CHARACTERS } from '../../config/characters.js'

export default function StartScreen({ onStart, totalEarnedStars, level, defaultChar, onBack }) {
  const [selectedChar, setSelectedChar] = useState(defaultChar || 'dragon')

  return (
    <div className="game-page-bg min-h-screen flex flex-col">
      {/* 头部 */}
      <header className="relative z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button onClick={onBack} className="back-btn">← 返回</button>
            <h1 className="text-lg font-black text-white drop-shadow-sm">🐉 选一个小伙伴</h1>
            <span className="stars-display">⭐ {totalEarnedStars}</span>
          </div>
        </div>
      </header>

      {/* 装饰元素 */}
      <div className="deco-cloud float-cloud" style={{width:'120px',height:'36px',top:'8%',left:'5%'}} />
      <div className="deco-cloud float-cloud" style={{width:'80px',height:'26px',top:'15%',right:'10%',animationDelay:'1s'}} />
      <div className="deco-star" style={{top:'10%',left:'50%'}}>✨</div>

      {/* 主内容 */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        {/* 角色网格 — 更大，方形展示 */}
        <div className="grid grid-cols-2 gap-6 w-full max-w-md">
          {CHARACTERS.map((c) => {
            const isActive = selectedChar === c.id
            const imgExpr = isActive ? 'happy' : 'normal'
            return (
              <button
                key={c.id}
                onClick={() => setSelectedChar(c.id)}
                className={`glass-card flex flex-col items-center gap-2 p-5 ${isActive ? 'active' : ''}`}
              >
                <div className="w-full aspect-square rounded-xl overflow-hidden bg-white/10">
                  <img
                    src={`images/${c.image || c.id}_${imgExpr}.${c.ext || 'webp'}`}
                    alt={c.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.textContent = c.emoji || '🐉' }}
                  />
                </div>
                <span className="text-base font-extrabold text-white/90">{c.name}</span>
              </button>
            )
          })}
        </div>

        {/* 按钮 — 开始游戏 */}
        <div className="w-full max-w-md mt-8">
          <button
            onClick={() => onStart(selectedChar)}
            className="btn-game-primary w-full"
          >
            🎮 开始游戏
          </button>
        </div>
      </main>
    </div>
  )
}
