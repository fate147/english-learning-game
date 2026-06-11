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

export default function UnitTree({ unlockedWords, wordProgress, onToggleWord, onToggleAll }) {
  const [expanded, setExpanded] = useState([1])
  const [filter, setFilter] = useState('all')

  const units = [1, 2, 3, 4, 5, 6]

  const totalWords = useMemo(() => units.reduce((s, u) => s + getWordsByUnit(u).length, 0), [])

  const toggleUnit = (unit) => {
    setExpanded((prev) =>
      prev.includes(unit) ? prev.filter((u) => u !== unit) : [...prev, unit]
    )
  }

  const filters = [
    { key: 'all', label: '全部' },
    { key: 'unlocked', label: '已解锁' },
    { key: 'locked', label: '未解锁' },
  ]

  // 顶部统计卡片
  const unlockedCount = unlockedWords.length
  const lockedCount = totalWords - unlockedCount
  const pct = totalWords > 0 ? Math.round((unlockedCount / totalWords) * 100) : 0

  return (
    <div>
      {/* 概览统计 */}
      <div className="grid grid-cols-4 gap-2.5 mb-4">
        <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl px-4 py-3.5 text-center border-t-2 border-t-cyan-400">
          <div className="text-xl mb-1">📖</div>
          <div className="text-xl font-extrabold text-slate-100">{totalWords}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">总单词</div>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl px-4 py-3.5 text-center border-t-2 border-t-green-400">
          <div className="text-xl mb-1">🔓</div>
          <div className="text-xl font-extrabold text-slate-100">{unlockedCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">已解锁</div>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl px-4 py-3.5 text-center border-t-2 border-t-yellow-400">
          <div className="text-xl mb-1">🔒</div>
          <div className="text-xl font-extrabold text-slate-100">{lockedCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">未解锁</div>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl px-4 py-3.5 text-center border-t-2 border-t-purple-400">
          <div className="text-xl mb-1">📊</div>
          <div className="text-xl font-extrabold text-slate-100">{pct}%</div>
          <div className="text-[11px] text-slate-500 mt-0.5">完成率</div>
        </div>
      </div>

      {/* 筛选按钮 */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-slate-400">
          已解锁 <span className="font-bold text-cyan-400">{unlockedCount}</span> / {totalWords}
        </span>
        <div className="flex gap-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all
                ${filter === f.key
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'bg-slate-700/50 text-slate-500 hover:text-slate-300'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 单元列表 — 卡片风格 */}
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
            <div key={unit} className="border border-slate-700/30 rounded-xl overflow-hidden">
              {/* 单元标题 */}
              <div
                onClick={() => toggleUnit(unit)}
                className="flex items-center justify-between px-4 py-3 bg-slate-900/30 hover:bg-slate-800/30 transition-colors cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-slate-500 text-xs transition-transform ${isOpen ? '' : '-rotate-90'}`}>▼</span>
                  <div>
                    <h3 className="font-semibold text-sm text-slate-200">Unit {unit} · {UNIT_NAMES[unit]?.name || ''} {UNIT_NAMES[unit]?.emoji || ''}</h3>
                    <p className="text-[11px] text-slate-500">{unlockedInUnit}/{words.length}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleAll?.(words.map(w => w.id), unlockedInUnit === words.length); }}
                  className="px-3 py-1 rounded-full text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-all"
                >
                  {unlockedInUnit === words.length ? '全部锁定' : '全部解锁'}
                </button>
              </div>

              {/* 单词网格 */}
              {isOpen && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 p-3">
                  {filteredWords.map((w) => {
                    const isUnlocked = unlockedWords.includes(w.id)
                    return (
                      <div
                        key={w.id}
                        onClick={() => onToggleWord?.(w.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all select-none text-sm font-medium
                          ${isUnlocked
                            ? 'bg-cyan-400/10 text-slate-200 hover:bg-cyan-400/15'
                            : 'bg-slate-900/20 text-slate-600 hover:bg-slate-800/30'
                          }`}
                      >
                        <span className="text-xs">{isUnlocked ? '🔓' : '🔒'}</span>
                        <span>{w.word}</span>
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
