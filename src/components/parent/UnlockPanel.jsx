import { useState, useEffect, useMemo, useRef } from 'react'
import { useUnlockState } from '../../hooks/useUnlockState.js'
import { useToast } from '../ui/Toast.jsx'
import { getWordsByUnit, getWordsByGradeSemester } from '../../lib/words.js'
import EmptyState from '../ui/EmptyState.jsx'

const UNIT_NAMES = { 1: '感觉', 2: '身体', 3: '衣服', 4: '天气', 5: '日常', 6: '食物' }
const GRADES = [3, 4, 5, 6]
const GRADE_LABEL = { 3: '三年级', 4: '四年级', 5: '五年级', 6: '六年级' }

function KpiCard({ label, value, sub }) {
  return (
    <div className="rounded-xl p-2.5 text-center" style={{ background: '#141414', border: '1px solid #2a2520' }}>
      <p className="text-base font-bold tabular-nums leading-none text-[#d4a574]">{value}</p>
      <p className="text-[10px] font-semibold text-[#8a7d6f] mt-0.5">{label}</p>
      {sub && <p className="text-[9px] font-medium text-[#8a7d6f] mt-0.5">{sub}</p>}
    </div>
  )
}

function WordCell({ word, isUnlocked, progress, onToggle }) {
  const correctCount = progress?.correct_count || 0
  const isFull = correctCount >= 10
  const fillPct = Math.min((correctCount / 10) * 100, 100)

  return (
    <button onClick={() => onToggle(word.id)}
      className="w-full rounded-lg text-[11px] font-bold flex flex-col items-center justify-center gap-0.5 border transition-all duration-100 py-1.5 relative overflow-hidden active:scale-[0.95]"
      style={{
        background: isUnlocked ? (isFull ? '#d4a574' : '#1f1f1f') : '#141414',
        borderColor: isUnlocked ? (isFull ? '#d4a574' : '#2a2520') : '#2a2520',
        color: isUnlocked ? (isFull ? '#0a0a0a' : '#f5f0e8') : '#8a7d6f',
      }}>
      {isUnlocked && correctCount > 0 && (
        <div className="absolute inset-0 rounded-lg transition-all duration-300"
          style={{ background: isFull ? '#d4a574' : 'rgba(212,165,116,0.15)', width: `${fillPct}%` }} />
      )}
      <span className="font-bold relative z-10">
        {isUnlocked ? word.word : (
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" />
          </svg>
        )}
      </span>
      {isUnlocked && (
        <span className="text-[9px] relative z-10" style={{ color: isFull ? '#0a0a0a' : '#a39880' }}>
          {isFull ? '✓ 已掌握' : `${correctCount}/10`}
        </span>
      )}
    </button>
  )
}

function UnitSection({ unit, unlockedWords, wordProgress, filter, onToggleWord, onToggleAll, isExpanded, onToggle }) {
  const words = getWordsByUnit(unit)
  const unitUnlocked = words.filter((w) => unlockedWords.includes(w.id))
  const allSelected = unitUnlocked.length === words.length

  let filtered = words
  if (filter === 'unlocked') filtered = words.filter((w) => unlockedWords.includes(w.id))
  if (filter === 'locked') filtered = words.filter((w) => !unlockedWords.includes(w.id))
  if (filtered.length === 0) return null

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: '#141414', border: '1px solid #2a2520' }}>
      <button onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-1 hover:bg-[#1f1f1f] transition-all">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: allSelected ? '#d4a574' : unitUnlocked.length > 0 ? '#a39880' : '#8a7d6f' }} />
          <span className="font-bold text-sm text-[#f5f0e8]">Unit {unit}</span>
          <span className="text-xs text-[#8a7d6f]">{UNIT_NAMES[unit]}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[#a39880] tabular-nums">{unitUnlocked.length}/{words.length}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleAll(words.map(w => w.id), allSelected) }}
            className="px-1.5 py-0.5 rounded text-[10px] font-bold border transition-all"
            style={{
              color: allSelected ? '#d4a574' : '#a39880',
              borderColor: allSelected ? 'rgba(212,165,116,0.3)' : '#2a2520',
            }}
          >
            {allSelected ? '✓' : '全选'}
          </button>
          <svg className={`w-3.5 h-3.5 text-[#8a7d6f] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>
      {isExpanded && (
        <div className="px-3 pt-2 pb-3">
          <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5">
            {filtered.map((w) => (
              <WordCell key={w.id} word={w} isUnlocked={unlockedWords.includes(w.id)}
                progress={wordProgress?.[w.id]} onToggle={onToggleWord} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function UnlockPanel({ childId }) {
  const { unlocked, progress, loading, error, fetch, toggle, toggleAll } = useUnlockState()
  const toast = useToast()
  const fetchedRef = useRef(false)
  const [filter, setFilter] = useState('all')
  const [grade, setGrade] = useState(3)
  const [semester, setSemester] = useState(2)
  const [expandedUnit, setExpandedUnit] = useState(1)

  useEffect(() => {
    if (!childId || fetchedRef.current) return
    fetchedRef.current = true
    fetch(childId, 'english', grade)
  }, [childId])

  const allWords = useMemo(() => getWordsByGradeSemester(grade, semester), [grade, semester])

  const totalWords = allWords.length
  const unlockedCount = allWords.filter(w => unlocked.includes(w.id)).length
  const lockedCount = totalWords - unlockedCount
  const pct = totalWords > 0 ? Math.round((unlockedCount / totalWords) * 100) : 0

  const filters = [
    { key: 'all', label: '全部', count: totalWords },
    { key: 'unlocked', label: '已解锁', count: unlockedCount },
    { key: 'locked', label: '未解锁', count: lockedCount },
  ]

  const selectAllSemester = () => {
    const allIds = allWords.map(w => w.id)
    toggleAll(childId, allIds)
    toast('已全选本学期单词')
  }

  if (!childId) return <EmptyState variant="child" text="请先选择一个孩子" />

  if (loading && !fetchedRef.current) {
    return (
      <div className="space-y-3">
        {[1,2,3].map(i => (
          <div key={i} className="rounded-xl p-3" style={{ background: '#141414', border: '1px solid #2a2520' }}>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full" style={{ background: '#1f1f1f' }} />
              <div className="h-3 w-16 rounded" style={{ background: '#1f1f1f' }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)' }}>
          <svg className="w-8 h-8 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <p className="text-sm mb-2" style={{ color: '#f5f0e8' }}>加载失败</p>
        <p className="text-xs mb-4" style={{ color: '#8a7d6f' }}>{error}</p>
        <button onClick={() => { fetchedRef.current = false; fetch(childId, 'english', grade) }}
          className="px-5 py-2 rounded-lg text-xs font-bold" style={{ background: '#d4a574', color: '#0a0a0a' }}>
          重试
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* 年级 */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {GRADES.map(g => (
          <button key={g}               onClick={() => { setGrade(g); fetchedRef.current = false; fetch(childId, 'english', g) }}
            className="px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all"
            style={{
              background: grade === g ? '#d4a574' : '#1f1f1f',
              color: grade === g ? '#0a0a0a' : '#a39880',
              border: `1px solid ${grade === g ? '#d4a574' : '#2a2520'}`,
            }}>
            {GRADE_LABEL[g]}
          </button>
        ))}
      </div>

      {/* 学期 */}
      <div className="flex gap-2">
        {[1, 2].map(s => (
          <button key={s} onClick={() => setSemester(s)}
            className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all"
            style={{
              background: semester === s ? 'rgba(212,165,116,0.2)' : '#1f1f1f',
              color: semester === s ? '#d4a574' : '#8a7d6f',
              border: `1px solid ${semester === s ? '#d4a574' : '#2a2520'}`,
            }}>
            {s === 1 ? '上学期' : '下学期'}
          </button>
        ))}
      </div>

      {/* 统计 */}
      <div className="grid grid-cols-4 gap-2">
        <KpiCard label="总单词" value={totalWords} />
        <KpiCard label="已解锁" value={unlockedCount} sub={`${pct}%`} />
        <KpiCard label="未解锁" value={lockedCount} />
        <KpiCard label="完成率" value={`${pct}%`} />
      </div>

      {/* 筛选 + 全选 */}
      <div className="flex items-center justify-between">
        <div className="inline-flex gap-1 p-0.5 rounded-lg" style={{ background: '#141414', border: '1px solid #2a2520' }}>
          {filters.map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all duration-100"
              style={{
                background: filter === f.key ? '#1f1f1f' : 'transparent',
                color: filter === f.key ? '#d4a574' : '#8a7d6f',
                border: filter === f.key ? '1px solid #2a2520' : '1px solid transparent',
              }}>
              {f.label} <span className="tabular-nums opacity-70">({f.count})</span>
            </button>
          ))}
        </div>
        <button onClick={selectAllSemester}
          className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
          style={{ background: '#d4a574', color: '#0a0a0a' }}>
          全选学期
        </button>
      </div>

      {/* 单元列表 */}
      <div className="flex flex-col gap-2">
        {[1, 2, 3, 4, 5, 6].map(unit => {
          const unitWords = getWordsByUnit(unit, grade, semester)
          if (unitWords.length === 0) return null
          return (
            <UnitSection key={unit} unit={unit} unlockedWords={unlocked} wordProgress={progress}
              filter={filter}
              onToggleWord={(id) => { toggle(childId, id) }}
              onToggleAll={(ids, all) => { toggleAll(childId, ids) }}
              isExpanded={expandedUnit === unit}
              onToggle={() => setExpandedUnit(expandedUnit === unit ? null : unit)} />
          )
        })}
      </div>
    </div>
  )
}
