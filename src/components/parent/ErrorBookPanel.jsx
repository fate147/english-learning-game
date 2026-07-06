import { useState, useMemo } from 'react'
import { getErrorBook, removeWordError, clearErrorBook } from '../../lib/errorBook.js'
import EmptyState from '../ui/EmptyState.jsx'

function KpiCard({ label, value, sub }) {
  return (
    <div className="rounded-xl p-2.5 text-center" style={{ background: '#141414', border: '1px solid #2a2520' }}>
      <p className="text-base font-bold tabular-nums leading-none text-[#d4a574]">{value}</p>
      <p className="text-[10px] font-semibold text-[#8a7d6f] mt-0.5">{label}</p>
      {sub && <p className="text-[9px] font-medium text-[#8a7d6f] mt-0.5">{sub}</p>}
    </div>
  )
}

const SORT_OPTIONS = [
  { key: 'count', label: '错误次数' },
  { key: 'recent', label: '最近错误' },
]

export default function ErrorBookPanel({ childId }) {
  const [sortBy, setSortBy] = useState('count')
  const [removed, setRemoved] = useState({})
  const [cleared, setCleared] = useState(false)

  const data = useMemo(() => {
    if (cleared) return { entries: [], totalErrors: 0, thisWeek: 0 }
    const book = getErrorBook(childId, 'english')
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    let entries = Object.values(book).filter(e => !removed[e.wordId])
    let totalErrors = 0
    let thisWeek = 0

    entries.forEach(e => {
      const count = e.totalErrors || 0
      totalErrors += count
      if (e.lastErrorAt > weekAgo) thisWeek++
    })

    if (sortBy === 'recent') {
      entries.sort((a, b) => (b.lastErrorAt || 0) - (a.lastErrorAt || 0))
    } else {
      entries.sort((a, b) => (b.totalErrors || 0) - (a.totalErrors || 0))
    }

    return { entries, totalErrors, thisWeek }
  }, [childId, sortBy, removed, cleared])

  const handleRemove = (wordId) => {
    removeWordError(childId, 'english', wordId)
    setRemoved(prev => ({ ...prev, [wordId]: true }))
  }

  const handleClearAll = () => {
    clearErrorBook(childId, 'english')
    setCleared(true)
    setRemoved({})
  }

  if (!childId) return <EmptyState variant="child" text="请先选择一个孩子" />

  if (data.entries.length === 0) {
    return (
      <div>
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(212,165,116,0.1)' }}>
            <svg className="w-8 h-8 text-[#d4a574]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <p className="text-sm font-bold text-[#f5f0e8] mb-1">暂无错词</p>
          <p className="text-xs text-[#8a7d6f]">孩子答错的英语单词会出现在这里</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-2">
        <KpiCard label="错词总数" value={data.entries.length} />
        <KpiCard label="累计错误" value={data.totalErrors} />
        <KpiCard label="本周新增" value={data.thisWeek} />
      </div>

      {/* 操作栏 */}
      <div className="flex items-center justify-between">
        <div className="tabs">
          {SORT_OPTIONS.map(opt => (
            <button key={opt.key} onClick={() => setSortBy(opt.key)}
              className={`tab ${sortBy === opt.key ? 'active' : ''}`}>
              {opt.label}
            </button>
          ))}
        </div>
        <button onClick={handleClearAll}
          className="btn btn-danger btn-sm">
          清空全部
        </button>
      </div>

      {/* 错词列表 */}
      <div className="space-y-1.5">
        {data.entries.map((entry, idx) => {
          const dateStr = entry.lastErrorAt
            ? new Date(entry.lastErrorAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
            : ''
          const types = entry.errorTypes || {}
          const typeLabels = Object.entries(types)
            .map(([type, count]) => {
              const label = type === 'image_choice' ? '看图' : type === 'letter_fill' ? '拼写' : type
              return `${label}×${count}`
            })
            .join(' ')

          return (
            <div key={entry.wordId}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group"
              style={{ background: '#141414', border: '1px solid #2a2520' }}>
              {/* 排名 */}
              <span className="text-[11px] font-bold tabular-nums w-5 text-right shrink-0" style={{ color: idx < 3 ? '#d4a574' : '#8a7d6f' }}>
                {idx < 3 ? ['🥇', '🥈', '🥉'][idx] : `${idx + 1}`}
              </span>

              {/* 单词信息 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#f5f0e8] truncate">{entry.word}</span>
                  <span className="text-[11px] text-[#8a7d6f] truncate">{entry.meaning}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-semibold" style={{ color: '#ef4444' }}>
                    错 {entry.totalErrors} 次
                  </span>
                  {typeLabels && (
                    <span className="text-[10px] text-[#8a7d6f]">{typeLabels}</span>
                  )}
                  {dateStr && (
                    <span className="text-[10px] text-[#8a7d6f] ml-auto">{dateStr}</span>
                  )}
                </div>
              </div>

              {/* 已纠正按钮 */}
              <button onClick={() => handleRemove(entry.wordId)}
                className="btn btn-sm btn-icon btn-ghost shrink-0"
                style={{ color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}
                title="标记为已纠正">
                已纠正 ✓
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
