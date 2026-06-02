import { useState, useMemo } from 'react'
import { getWordsByUnit } from '../../lib/words.js'

export default function UnitTree({ unlockedWords, wordProgress, onToggleWord, onToggleAll }) {
  const [expanded, setExpanded] = useState([1])
  const [filter, setFilter] = useState('all') // 'all' | 'unlocked' | 'locked'

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

  return (
    <div>
      {/* 顶部工具栏：统计 + 筛选 */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-slate-300">
          已解锁 <span className="font-bold text-[var(--theme-color)]">{unlockedWords.length}</span> / {totalWords} 个单词
        </span>
        <div className="flex gap-1.5">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all
                ${filter === f.key
                  ? 'bg-[var(--theme-color)] text-white'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 单元列表 */}
      <div className="space-y-3">
        {units.map((unit) => {
          const words = getWordsByUnit(unit)
          const unlockedCount = words.filter((w) => unlockedWords.includes(w.id)).length
          const isOpen = expanded.includes(unit)

          // 筛选过滤
          const filteredWords = words.filter((w) => {
            const isUnlocked = unlockedWords.includes(w.id)
            if (filter === 'unlocked') return isUnlocked
            if (filter === 'locked') return !isUnlocked
            return true
          })

          // 如果筛选后没有单词，跳过这个单元
          if (filteredWords.length === 0) return null

          return (
            <div key={unit} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              {/* 单元标题 */}
              <div
                onClick={() => toggleUnit(unit)}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-700/50 hover:bg-slate-700 transition-colors cursor-pointer select-none"
              >
                <div className="text-left">
                  <h3 className="font-bold text-slate-100">Unit {unit}</h3>
                  <p className="text-xs text-slate-400">
                    {unlockedCount}/{words.length}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleAll?.(words.map(w => w.id), unlockedCount === words.length); }}
                    className="px-3 py-1 rounded-full text-xs font-bold bg-slate-700 text-slate-300 hover:bg-slate-600 transition-all"
                  >
                    {unlockedCount === words.length ? '取消全选' : '全选'}
                  </button>

                </div>
              </div>

              {/* 单词网格 */}
              {isOpen && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-3">
                  {filteredWords.map((w) => {
                    const isUnlocked = unlockedWords.includes(w.id)
                    const progress = wordProgress[w.id]
                    const stage = progress?.level || 0

                    let stageLabel = ''
                    if (isUnlocked) {
                      if (stage === 0) stageLabel = '新'
                      else if (stage === 1) stageLabel = '认'
                      else if (stage === 2) stageLabel = '记'
                      else stageLabel = '复习'
                    }

                    return (
                      <label
                        key={w.id}
                        onClick={() => onToggleWord?.(w.id)}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 cursor-pointer transition-all select-none
                          ${isUnlocked
                            ? 'border-green-500/60 bg-green-500/10 hover:bg-green-500/15'
                            : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                          }`}
                      >
                        {/* 复选框指示器 */}
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold shrink-0 transition-all
                          ${isUnlocked
                            ? 'bg-green-500 text-white'
                            : 'border-2 border-slate-500 bg-transparent'
                          }`}
                        >
                          {isUnlocked ? '✓' : ''}
                        </div>
                        {/* 单词信息 */}
                        <div className="min-w-0">
                          <div className={`text-sm font-bold truncate ${isUnlocked ? 'text-slate-100' : 'text-slate-400'}`}>
                            {w.word}
                          </div>
                          <div className={`text-xs truncate ${isUnlocked ? 'text-slate-400' : 'text-slate-500'}`}>
                            {w.meaning}
                            {stageLabel && <span className="ml-1.5 text-[var(--theme-color)] font-medium">{stageLabel}</span>}
                          </div>
                        </div>
                      </label>
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
