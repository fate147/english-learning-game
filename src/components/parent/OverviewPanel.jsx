import { useState, useEffect } from 'react'
import { useParentStats } from '../../hooks/useParentStats.js'
import { groupSessionsByDate } from '../../lib/parentStats.js'
import Skeleton from '../ui/Skeleton.jsx'
import EmptyState from '../ui/EmptyState.jsx'

const SUBJECTS = [
  { id: 'chinese', label: '语文' },
  { id: 'english', label: '英语' },
  { id: 'math', label: '数学' },
]

function formatDayAbbr(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()] || ''
}

function formatShortDate(dateStr) {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  if (parts.length < 3) return dateStr
  return `${parseInt(parts[1])}/${parseInt(parts[2])}`
}

function SubjectFilter({ subject, onChange }) {
  return (
    <div className="inline-flex items-center gap-0.5 p-0.5 rounded-xl bg-[var(--c-bg-secondary)] border border-[var(--c-border)]" role="group" aria-label="选择科目">
      {SUBJECTS.map((s) => (
        <button key={s.id} onClick={() => onChange(s.id)}
          className={`px-3.5 py-1.5 rounded-lg text-sm font-bold transition-all duration-100
            ${subject === s.id
              ? 'bg-[var(--c-bg)] text-[var(--c-primary)] shadow-sm border border-[var(--c-border)]'
              : 'text-[var(--c-text-muted)] hover:text-[var(--c-text)]'
            }`}
          aria-pressed={subject === s.id}>{s.label}</button>
      ))}
    </div>
  )
}

function KpiCard({ label, value, accent, sub, trend }) {
  const accentColor = accent === 'correct' ? 'var(--c-correct)'
    : accent === 'wrong' ? 'var(--c-wrong)'
    : accent === 'warning' ? 'var(--c-warning)'
    : 'var(--c-primary)'

  return (
    <div className="card card-compact">
      <p className="text-[11px] font-semibold text-[var(--c-text-muted)] tracking-wide">{label}</p>
      <div className="flex items-baseline gap-1.5 mt-0.5">
        <span className="text-xl font-bold tabular-nums leading-none" style={{ color: accentColor }}>
          {value}
        </span>
        {trend != null && (
          <span className={`text-[11px] font-bold tabular-nums ${trend >= 0 ? 'text-[var(--c-correct)]' : 'text-[var(--c-wrong)]'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}
          </span>
        )}
      </div>
      <p className="text-[10px] font-medium text-[var(--c-text-muted)] mt-0.5">{sub}</p>
    </div>
  )
}

function WeeklyChart({ daysMap, days }) {
  const maxSessions = Math.max(1, ...days.map((d) => daysMap[d].sessions.length))
  if (days.length === 0) return null

  return (
    <div className="card card-compact">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-[var(--c-text)]">本周趋势</p>
        <span className="text-[10px] font-medium text-[var(--c-text-muted)]">场次/天</span>
      </div>
      <div className="flex items-end gap-1.5 h-28" aria-label="本周游戏场次趋势" role="img">
        {days.map((day) => {
          const count = daysMap[day].sessions.length
          const pct = maxSessions > 0 ? (count / maxSessions) * 100 : 0
          const h = Math.max(12, pct)

          return (
            <div key={day} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
              <span className="text-[10px] font-bold text-[var(--c-text-secondary)] tabular-nums leading-none">{count}</span>
              <div className="w-full rounded-md relative overflow-hidden transition-all duration-300"
                style={{ height: `${h}%`, background: 'var(--c-primary)', minHeight: '12px' }}>
                <div className="absolute inset-0 bg-[var(--c-bg)]/10" style={{ opacity: count === maxSessions ? 0.2 : 0 }} />
              </div>
              <span className="text-[9px] font-medium text-[var(--c-text-muted)] leading-none mt-auto pt-1">{formatDayAbbr(day)}</span>
              <span className="text-[8px] text-[var(--c-text-muted)] leading-none -mt-0.5">{formatShortDate(day)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AchievementBadges({ totalCorrect, totalWrong, days, sessions }) {
  const total = totalCorrect + totalWrong
  const pct = total > 0 ? Math.round((totalCorrect / total) * 100) : 0

  const badges = []
  if (days.length >= 7) badges.push({ label: '全勤一周', icon: '🔥', desc: '连续7天学习' })
  else if (days.length >= 5) badges.push({ label: '坚持5天', icon: '🔥', desc: '' })
  else if (days.length >= 3) badges.push({ label: '开始习惯', icon: '📅', desc: '' })

  if (pct >= 90) badges.push({ label: '卓越正确率', icon: '🎯', desc: `${pct}%` })
  else if (pct >= 80) badges.push({ label: '优秀正确率', icon: '🎯', desc: `${pct}%` })

  if (totalCorrect >= 100) badges.push({ label: '百题达人', icon: '🏆', desc: `${totalCorrect} 题` })
  else if (totalCorrect >= 50) badges.push({ label: '练习达人', icon: '🏆', desc: `${totalCorrect} 题` })

  const totalSessions = sessions?.length || 0
  if (totalSessions >= 20) badges.push({ label: '游戏达人', icon: '🎮', desc: `${totalSessions} 场` })

  if (badges.length === 0) return null

  return (
    <div className="card card-compact">
      <p className="text-xs font-bold text-[var(--c-text)] mb-2.5">近期成就</p>
      <div className="flex flex-wrap gap-1.5">
        {badges.map((b, i) => (
          <span key={i}
            className="badge badge-outline">
            <span className="text-sm">{b.icon}</span>
            <span className="text-[11px] font-semibold">{b.label}</span>
            {b.desc && <span className="text-[10px] text-[var(--c-text-muted)] font-medium ml-0.5">{b.desc}</span>}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function OverviewPanel({ childId }) {
  const { sessions, loading, error, stars, fetchRecentSessions, fetchStars } = useParentStats()
  const [subject, setSubject] = useState('english')

  useEffect(() => {
    if (childId) {
      fetchRecentSessions(childId, 7, 0, subject)
      fetchStars(childId)
    }
  }, [childId, subject, fetchRecentSessions, fetchStars])

  const daysMap = groupSessionsByDate(sessions)
  const days = Object.keys(daysMap).sort().reverse().slice(0, 7)

  const totalCorrect = days.reduce((acc, d) => acc + daysMap[d].correct, 0)
  const totalWrong = days.reduce((acc, d) => acc + daysMap[d].wrong, 0)
  const totalQ = totalCorrect + totalWrong
  const avgPct = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0
  const totalSessions = days.reduce((acc, d) => acc + daysMap[d].sessions.length, 0)

  if (!childId) return <EmptyState variant="child" text="请先选择一个孩子" />

  if (loading && days.length === 0) {
    return (
      <div className="space-y-4">
        <SubjectFilter subject={subject} onChange={setSubject} />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-[5.5rem]" />)}
        </div>
        <Skeleton className="h-36" />
        <Skeleton className="h-20" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <SubjectFilter subject={subject} onChange={setSubject} />
        <div className="mt-8">
          <div className="w-11 h-11 mx-auto mb-3.5 rounded-full bg-[var(--c-danger)]/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-[var(--c-danger)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="text-sm text-[var(--c-text-muted)] mb-4">{error}</p>
          <button onClick={() => fetchRecentSessions(childId, 7, 0, subject)}
            className="btn btn-primary">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
            重试
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-enter space-y-4">
      <div className="flex items-center justify-between">
        <SubjectFilter subject={subject} onChange={setSubject} />
        {stars && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-400/10 border border-yellow-400/20">
            <svg className="w-4 h-4 text-yellow-400" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
            <span className="text-sm font-bold text-yellow-400 tabular-nums">{stars.availableStars}</span>
            <span className="text-[11px] font-medium text-yellow-400">星星</span>
          </div>
        )}
      </div>

      {days.length === 0 ? (
        <div className="mt-4"><EmptyState variant="record" text="近7天暂无游戏记录" subtext="完成闯关或记忆练习后，数据会显示在这里" /></div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <KpiCard label="总答题" value={`${totalCorrect}/${totalQ}`} sub={`${totalSessions} 场游戏`} accent="primary" />
            <KpiCard label="正确率" value={`${avgPct}%`} sub={`正确 ${totalCorrect} 题`}
              accent={avgPct >= 80 ? 'correct' : avgPct >= 50 ? 'warning' : 'wrong'} />
            <KpiCard label="学习天数" value={`${days.length}/7`}
              sub={days.length >= 5 ? '保持得不错！' : days.length >= 3 ? '继续加油' : '坚持打卡'} accent="primary" />
          </div>
          <WeeklyChart daysMap={daysMap} days={days} />
          <AchievementBadges totalCorrect={totalCorrect} totalWrong={totalWrong} days={days} sessions={sessions} />
        </>
      )}
    </div>
  )
}
