import { useState, useEffect, useMemo, useRef } from 'react'
import { useParentStats } from '../../hooks/useParentStats.js'
import EmptyState from '../ui/EmptyState.jsx'

const SUBJECT_META = {
  english: { label: '英语', icon: '📝' },
  math: { label: '数学', icon: '🔢' },
  chinese: { label: '语文', icon: '📖' },
}
const SUBJECT_IDS = ['english', 'math', 'chinese']

function formatDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function getWeekDates() {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysSinceMonday)
  const result = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    result.push(formatDate(d))
  }
  return result
}

function formatDayAbbr(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()]
}

function formatDayNum(dateStr) {
  const parts = dateStr.split('-')
  return parts[2] ? parseInt(parts[2]) : dateStr
}

function DayRow({ date, correct, wrong, errors }) {
  const [expanded, setExpanded] = useState(false)
  const total = correct + wrong
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0
  const today = new Date().toISOString().split('T')[0]
  const isToday = date === today
  const hasErrors = errors.length > 0

  return (
    <div>
      <button onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all"
        style={{ background: isToday ? 'rgba(212,165,116,0.1)' : '#1f1f1f' }}>
        <span className="w-10 text-[10px] font-bold" style={{ color: isToday ? '#d4a574' : '#8a7d6f' }}>
          {formatDayAbbr(date)}
        </span>
        <span className="w-6 text-sm font-bold" style={{ color: isToday ? '#f5f0e8' : '#a39880' }}>
          {formatDayNum(date)}
        </span>
        {total > 0 ? (
          <>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#2a2520' }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: pct >= 80 ? '#d4a574' : pct >= 50 ? '#a39880' : '#8a7d6f' }} />
            </div>
            <span className="text-[10px] font-bold tabular-nums" style={{ color: '#d4a574' }}>{correct}/{total}</span>
            {wrong > 0 && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>✕{wrong}</span>
            )}
          </>
        ) : (
          <span className="text-[10px]" style={{ color: '#8a7d6f' }}>无数据</span>
        )}
        {hasErrors && (
          <svg className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} style={{ color: '#8a7d6f' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        )}
      </button>

      {expanded && hasErrors && (
        <div className="ml-9 mt-1 space-y-1">
          {errors.map((err, i) => (
            <div key={i} className="flex items-center gap-2 px-2 py-1 rounded text-[10px]" style={{ background: '#0a0a0a' }}>
              <span style={{ color: '#ef4444' }}>✕</span>
              <span className="font-bold truncate" style={{ color: '#f5f0e8' }}>{err.questionText || err.wordId || '未知'}</span>
              {err.correctAnswer && <span style={{ color: '#8a7d6f' }}>→ {err.correctAnswer}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SubjectSection({ subject, sessions, allErrors }) {
  const [expanded, setExpanded] = useState(false)
  const meta = SUBJECT_META[subject]
  const weekDates = useMemo(() => getWeekDates(), [])

  const weekSessions = sessions.filter(s => {
    const d = s.created_at?.split('T')[0]
    return d && weekDates.includes(d)
  })

  const totalSessions = sessions.length
  const weekSessions_count = weekSessions.length
  const totalCorrect = sessions.reduce((s, sess) => s + (sess.correct_count || 0), 0)
  const totalWrong = sessions.reduce((s, sess) => s + (sess.wrong_count || 0), 0)
  const totalQ = totalCorrect + totalWrong
  const pct = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0

  const grouped = {}
  weekSessions.forEach(s => {
    const d = s.created_at?.split('T')[0]
    if (!d) return
    if (!grouped[d]) grouped[d] = { correct: 0, wrong: 0 }
    grouped[d].correct += s.correct_count || 0
    grouped[d].wrong += s.wrong_count || 0
  })

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: '#141414', border: '1px solid #2a2520' }}>
      <button onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 transition-all"
        style={{ background: expanded ? '#1f1f1f' : 'transparent' }}>
        <div className="flex items-center gap-3">
          <span className="text-lg">{meta.icon}</span>
          <div className="text-left">
            <div className="text-sm font-bold" style={{ color: '#f5f0e8' }}>{meta.label}</div>
            <div className="text-[10px]" style={{ color: '#8a7d6f' }}>总 {totalSessions} 场 · 本周 {weekSessions_count} 场</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-bold" style={{ color: '#d4a574' }}>{totalCorrect}/{totalQ}</div>
            <div className="text-[10px]" style={{ color: '#8a7d6f' }}>{pct}%</div>
          </div>
          <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: '#2a2520' }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: '#d4a574' }} />
          </div>
          <svg className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} style={{ color: '#8a7d6f' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="px-3 pt-2 pb-3 space-y-1.5">
          {weekDates.map(date => (
            <DayRow key={date} date={date}
              correct={grouped[date]?.correct || 0}
              wrong={grouped[date]?.wrong || 0}
              errors={allErrors.filter(e => e.date === date && e.subject === subject)} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function StatsPanel({ childId }) {
  const { sessions, loading, error, fetchRecentSessions } = useParentStats()
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (!childId || fetchedRef.current) return
    fetchedRef.current = true
    fetchRecentSessions(childId, 90, 0)
  }, [childId])

  if (!childId) return <EmptyState variant="child" text="请先选择一个孩子" />

  if (loading && !fetchedRef.current) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl p-4" style={{ background: '#141414', border: '1px solid #2a2520' }}>
          <div className="h-3 w-20 rounded mb-3" style={{ background: '#1f1f1f' }} />
          <div className="grid grid-cols-4 gap-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="text-center">
                <div className="h-6 w-12 mx-auto rounded mb-1" style={{ background: '#1f1f1f' }} />
                <div className="h-2 w-8 mx-auto rounded" style={{ background: '#1f1f1f' }} />
              </div>
            ))}
          </div>
        </div>
        {[1,2,3].map(i => (
          <div key={i} className="rounded-xl p-3" style={{ background: '#141414', border: '1px solid #2a2520' }}>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded" style={{ background: '#1f1f1f' }} />
              <div className="flex-1">
                <div className="h-3 w-16 rounded mb-1" style={{ background: '#1f1f1f' }} />
                <div className="h-2 w-24 rounded" style={{ background: '#1f1f1f' }} />
              </div>
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
        <button onClick={() => { fetchedRef.current = false; fetchRecentSessions(childId, 90, 0) }}
          className="px-5 py-2 rounded-lg text-xs font-bold" style={{ background: '#d4a574', color: '#0a0a0a' }}>
          重试
        </button>
      </div>
    )
  }

  const totalGames = sessions.length
  const weekDates = getWeekDates()
  const weekGames = sessions.filter(s => {
    const d = s.created_at?.split('T')[0]
    return d && weekDates.includes(d)
  }).length
  const totalCorrect = sessions.reduce((s, sess) => s + (sess.correct_count || 0), 0)
  const totalWrong = sessions.reduce((s, sess) => s + (sess.wrong_count || 0), 0)
  const totalQ = totalCorrect + totalWrong
  const overallPct = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0
  const allErrors = useMemo(() => {
    const errors = []
    sessions.forEach(s => {
      if (!s.results) return
      let results
      try { results = typeof s.results === 'string' ? JSON.parse(s.results) : s.results } catch { return }
      if (!Array.isArray(results)) return
      results.forEach(r => {
        if (r.correct === false || r.isCorrect === false) {
          errors.push({
            wordId: r.wordId || r.questionText,
            questionText: r.questionText || r.word || r.wordId || '',
            correctAnswer: r.correctAnswer || '',
            date: s.played_on || s.created_at?.split('T')[0],
            subject: s.subject || 'english',
          })
        }
      })
    })
    return errors
  }, [sessions])

  return (
    <div className="space-y-3">
      {/* 总体统计 */}
      <div className="rounded-xl p-4" style={{ background: '#141414', border: '1px solid #2a2520' }}>
        <div className="text-xs font-bold mb-3" style={{ color: '#a39880' }}>总体统计</div>
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center">
            <div className="text-xl font-bold" style={{ color: '#d4a574' }}>{totalGames}</div>
            <div className="text-[10px]" style={{ color: '#8a7d6f' }}>总场次</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold" style={{ color: '#d4a574' }}>{weekGames}</div>
            <div className="text-[10px]" style={{ color: '#8a7d6f' }}>本周场次</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold" style={{ color: '#d4a574' }}>{totalCorrect}</div>
            <div className="text-[10px]" style={{ color: '#8a7d6f' }}>答对</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold" style={{ color: overallPct >= 80 ? '#d4a574' : '#a39880' }}>{overallPct}%</div>
            <div className="text-[10px]" style={{ color: '#8a7d6f' }}>正确率</div>
          </div>
        </div>
      </div>

      {/* 分科目统计 */}
      {SUBJECT_IDS.map(subject => {
        const subjectSessions = sessions.filter(s => s.subject === subject)
        if (subjectSessions.length === 0) return null
        return (
          <SubjectSection key={subject} subject={subject} sessions={subjectSessions} allErrors={allErrors} />
        )
      })}
    </div>
  )
}
