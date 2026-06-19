import { useState, useMemo } from 'react'
import { getWordsByUnit } from '../../lib/words.js'

const UNIT_NAMES = {
  1: { name: '感觉', emoji: '😊' },
  2: { name: '身体', emoji: '🦵' },
  3: { name: '衣服', emoji: '👕' },
  4: { name: '天气', emoji: '☀️' },
  5: { name: '日常', emoji: '📅' },
  6: { name: '食物', emoji: '🍎' },
}

function WordPreview({ word, show }) {
  if (!show) return null
  return (
    <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none">
      <div className="bg-white/[0.08] backdrop-blur-md border border-white/15 rounded-xl shadow-2xl p-2.5 flex flex-col items-center gap-1.5 animate-fade-in"
        style={{animation:'fade-in 0.15s ease-out'}}>
        <img
          src={`images/words/${word.id}.webp`}
          alt={word.word}
          className="w-16 h-16 rounded-lg object-cover bg-white/10"
          onError={(e) => { e.target.style.display = 'none' }}
        />
        <div className="text-xs font-bold text-white text-center">{word.word}</div>
        <div className="text-[10px] text-white/50 text-center">{word.meaning}</div>
      </div>
    </div>
  )
}

export default function UnitTree({ unlockedWords, wordProgress, onToggleWord, onToggleAll }) {
  const [expanded, setExpanded] = useState([1])
  const [filter, setFilter] = useState('all')
  const [hoveredWord, setHoveredWord] = useState(null)

  const units = [1, 2, 3, 4, 5, 6]
  const totalWords = useMemo(() => units.reduce((s, u) => s + getWordsByUnit(u).length, 0), [])

  const toggleUnit = (unit) => {
    setExpanded((prev) => prev.includes(unit) ? prev.filter((u) => u !== unit) : [...prev, unit])
  }

  const filters = [
    { key: 'all', label: '全部' },
    { key: 'unlocked', label: '已解锁' },
    { key: 'locked', label: '未解锁' },
  ]

  const unlockedCount = unlockedWords.length
  const lockedCount = totalWords - unlockedCount
  const pct = totalWords > 0 ? Math.round((unlockedCount / totalWords) * 100) : 0

  return (
    <div>
      <div className="grid grid-cols-4 gap-2.5 mb-4">
        <div className="bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-center border-t-2 border-t-emerald-400/60">
          <div className="text-xl mb-1">📖</div>
          <div className="text-xl font-extrabold text-white">{totalWords}</div>
          <div className="text-[11px] text-white/40 mt-0.5">总单词</div>
        </div>
        <div className="bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-center border-t-2 border-t-green-400">
          <div className="text-xl mb-1">🔓</div>
          <div className="text-xl font-extrabold text-white">{unlockedCount}</div>
          <div className="text-[11px] text-white/40 mt-0.5">已解锁</div>
        </div>
        <div className="bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-center border-t-2 border-t-amber-400">
          <div className="text-xl mb-1">🔒</div>
          <div className="text-xl font-extrabold text-white">{lockedCount}</div>
          <div className="text-[11px] text-white/40 mt-0.5">未解锁</div>
        </div>
        <div className="bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-center border-t-2 border-t-violet-400">
          <div className="text-xl mb-1">📊</div>
          <div className="text-xl font-extrabold text-white">{pct}%</div>
          <div className="text-[11px] text-white/40 mt-0.5">完成率</div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-white/50">
          已解锁 <span className="font-bold text-emerald-400">{unlockedCount}</span> / {totalWords}
        </span>
        <div className="flex gap-1">
          {filters.map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all
                ${filter === f.key ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/[0.06] text-white/40 hover:text-white/70'}`}
            >{f.label}</button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {units.map((unit) => {
          const words = getWordsByUnit(unit)
          const unlockedInUnit = words.filter((w) => unlockedWords.includes(w.id)).length
          const isOpen = expanded.includes(unit)
          const filteredWords = words.filter((w) => {
            const isUnlocked = unlockedWords.includes(w.id)
            if (filter === 'unlocked') return isUnlocked
            if (filter === 'locked') return !isUnlocked
            return true
          })
          if (filteredWords.length === 0) return null

          return (
            <div key={unit} className="border border-white/10 rounded-xl overflow-hidden">
              <div
                onClick={() => toggleUnit(unit)}
                className="flex items-center justify-between px-4 py-3 bg-white/[0.03] hover:bg-white/[0.06] transition-colors cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-white/30 text-xs transition-transform ${isOpen ? '' : '-rotate-90'}`}>▼</span>
                  <div>
                    <h3 className="font-semibold text-sm text-white/90">Unit {unit} · {UNIT_NAMES[unit]?.name || ''} {UNIT_NAMES[unit]?.emoji || ''}</h3>
                    <p className="text-[11px] text-white/35">{unlockedInUnit}/{words.length}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleAll?.(words.map(w => w.id), unlockedInUnit === words.length) }}
                  className="px-3 py-1 rounded-full text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-all"
                >
                  {unlockedInUnit === words.length ? '全部锁定' : '全部解锁'}
                </button>
              </div>

              {isOpen && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 p-3">
                  {filteredWords.map((w) => {
                    const isUnlocked = unlockedWords.includes(w.id)
                    return (
                      <div
                        key={w.id}
                        onClick={() => onToggleWord?.(w.id)}
                        onMouseEnter={() => setHoveredWord(w.id)}
                        onMouseLeave={() => setHoveredWord(null)}
                        className={`relative flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all select-none text-sm font-medium
                          ${isUnlocked
                            ? 'bg-emerald-400/10 text-white/90 hover:bg-emerald-400/15'
                            : 'bg-white/[0.03] text-white/30 hover:bg-white/[0.06]'
                          }`}
                      >
                        <span className="text-xs">{isUnlocked ? '🔓' : '🔒'}</span>
                        <span>{w.word}</span>
                        <WordPreview word={w} show={hoveredWord === w.id} />
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
