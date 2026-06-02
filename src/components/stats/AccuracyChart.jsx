export default function AccuracyChart({ dailyStats }) {
  if (!dailyStats) return null

  const days = Object.entries(dailyStats)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)

  if (days.length === 0) {
    return <div className="text-center text-slate-400 py-8 text-sm">暂无数据</div>
  }

  return (
    <div>
      <h4 className="font-medium text-slate-300 mb-3">每日正确数</h4>
      <div className="grid grid-cols-2 gap-3">
        {days.map(([day, stats]) => {
          const parts = day.slice(5).split('-')
          const label = `${parseInt(parts[0])}/${parseInt(parts[1])}`
          const total = stats.correct + stats.wrong
          const rate = total > 0 ? Math.round((stats.correct / total) * 100) : 0

          return (
            <div key={day} className="bg-slate-800 rounded-xl p-3 text-center border border-slate-700">
              <div className="text-xs text-slate-400 mb-1">{label}</div>
              <div className="text-xl font-bold text-slate-100">{stats.correct}</div>
              <div className="text-xs text-slate-400">{rate}% · 共{total}题</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
