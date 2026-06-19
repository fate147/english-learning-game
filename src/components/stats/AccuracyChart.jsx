import { useState, useMemo } from 'react'

export default function AccuracyChart({ dailyStats }) {
  if (!dailyStats) return null

  const [monthOffset, setMonthOffset] = useState(0)

  const { days, monthLabel } = useMemo(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth() + monthOffset
    const targetYear = month < 0 ? year - 1 : (month > 11 ? year + 1 : year)
    const targetMonth = ((month % 12) + 12) % 12
    const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate()

    const dateStr = (d) => {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    }

    const days = []
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(targetYear, targetMonth, i)
      days.push(dateStr(d))
    }

    return {
      days,
      monthLabel: `${targetYear}年${targetMonth + 1}月`,
    }
  }, [monthOffset])

  const allStats = useMemo(() => days.map((day) => {
    const stats = dailyStats[day]
    return {
      day,
      correct: stats?.correct || 0,
      wrong: stats?.wrong || 0,
      sessions: stats?.sessions || 0,
    }
  }), [days, dailyStats])

  const maxCorrect = Math.max(...allStats.map((s) => s.correct), 1)

  const totalCorrect = allStats.reduce((s, d) => s + d.correct, 0)
  const totalWrong = allStats.reduce((s, d) => s + d.wrong, 0)
  const totalAnswered = totalCorrect + totalWrong
  const monthAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0

  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-xl px-4 sm:px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setMonthOffset((p) => p - 1)}
          className="w-7 h-7 rounded-full bg-white/10 text-white/50 hover:bg-white/15 hover:text-white/80 flex items-center justify-center text-sm transition-all"
        >
          ◀
        </button>
        <div className="flex items-center gap-3">
          <h4 className="text-sm font-bold text-white/90">{monthLabel}</h4>
          {totalAnswered > 0 && (
            <span className="text-xs text-emerald-400 font-semibold">本月正确率 {monthAccuracy}%</span>
          )}
        </div>
        <button
          onClick={() => setMonthOffset((p) => Math.min(p + 1, 0))}
          disabled={monthOffset === 0}
          className={`w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all
            ${monthOffset === 0
              ? 'bg-white/[0.03] text-white/15 cursor-not-allowed'
              : 'bg-white/10 text-white/50 hover:bg-white/15 hover:text-white/80'
            }`}
        >
          ▶
        </button>
      </div>

      {totalAnswered === 0 ? (
        <div className="flex items-center justify-center h-[120px] text-white/25 text-sm">
          暂无答题记录
        </div>
      ) : (
        <div className="relative mt-2" style={{ height: '140px' }}>
          <div className="absolute inset-0 flex items-end gap-[2px]">
            {allStats.map((s) => {
              const parts = s.day.slice(5).split('-')
              const dayNum = parseInt(parts[1])
              const total = s.correct + s.wrong
              const hasData = s.correct > 0 || s.wrong > 0
              const barH = hasData ? Math.max(6, (s.correct / maxCorrect) * 120) : 0

              return (
                <div key={s.day} className="flex-1 flex flex-col items-center justify-end h-full" style={{ minWidth: 0 }}>
                  <div
                    className="w-full rounded-t transition-all duration-300"
                    style={{
                      height: barH > 0 ? `${barH}px` : '2px',
                      minHeight: hasData ? '6px' : '2px',
                      background: hasData
                        ? 'linear-gradient(0deg, rgba(52,211,153,0.6) 0%, rgba(52,211,153,0.2) 100%)'
                        : 'rgba(255,255,255,0.06)',
                    }}
                    title={hasData ? `${dayNum}日 - ${Math.round((s.correct / total) * 100)}% (${s.correct}/${total})` : `${dayNum}日 - 无记录`}
                  />
                </div>
              )
            })}
          </div>
          <div className="absolute bottom-0 left-0 right-0 flex">
            {allStats.map((s) => {
              const parts = s.day.slice(5).split('-')
              const dayNum = parseInt(parts[1])
              const showLabel = dayNum === 1 || dayNum === 10 || dayNum === 20 || dayNum === (allStats.length)
              return (
                <div key={s.day + '-label'} className="flex-1 flex justify-center" style={{ minWidth: 0 }}>
                  {showLabel && (
                    <span className="text-[9px] text-white/30 leading-none">{dayNum}</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
