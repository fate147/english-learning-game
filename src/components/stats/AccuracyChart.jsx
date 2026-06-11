import { useState, useMemo } from 'react'

export default function AccuracyChart({ dailyStats }) {
  if (!dailyStats) return null

  const [monthOffset, setMonthOffset] = useState(0)

  const { days, monthLabel } = useMemo(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth() + monthOffset
    // 处理跨年
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

  return (
    <div className="bg-slate-800/50 border border-slate-700/35 rounded-xl px-5 py-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setMonthOffset((p) => p - 1)}
          className="w-7 h-7 rounded-full bg-slate-700/50 text-slate-400 hover:bg-slate-600/50 hover:text-slate-200 flex items-center justify-center text-sm transition-all"
        >
          ◀
        </button>
        <h4 className="section-title text-slate-200" style={{margin: 0}}><span>📈</span> {monthLabel}正确率趋势</h4>
        <button
          onClick={() => setMonthOffset((p) => Math.min(p + 1, 0))}
          disabled={monthOffset === 0}
          className={`w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all
            ${monthOffset === 0
              ? 'bg-slate-800/30 text-slate-700 cursor-not-allowed'
              : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50 hover:text-slate-200'
            }`}
        >
          ▶
        </button>
      </div>
      <div className="flex items-end gap-px mt-4" style={{ height: '140px' }}>
        {allStats.map((s) => {
          const parts = s.day.slice(5).split('-')
          const label = `${parseInt(parts[0])}/${parseInt(parts[1])}`
          const total = s.correct + s.wrong
          const rate = total > 0 ? Math.round((s.correct / total) * 100) : 0
          const hasData = s.correct > 0 || s.wrong > 0
          const barH = hasData ? Math.max(4, (s.correct / maxCorrect) * 100) : 0
          const showLabel = true // 每个柱子都显示日期

          return (
            <div key={s.day} className="flex flex-col items-center justify-end" style={{ flex: '1 1 0%' }}>
              <div
                style={{
                  width: '100%',
                  height: barH > 0 ? `${barH}px` : '0',
                  minHeight: barH > 0 ? '4px' : '0',
                  background: hasData
                    ? 'linear-gradient(0deg, rgba(129,199,132,0.7) 0%, rgba(129,199,132,0.25) 100%)'
                    : 'transparent',
                  borderRadius: '2px 2px 0 0',
                }}
                title={`${label}${hasData ? ` - ${rate}% (${s.correct}/${total})` : ' - 无记录'}`}
              />
              {showLabel && (
                <span className="text-[8px] text-slate-600 leading-none mt-0.5">{label}</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
