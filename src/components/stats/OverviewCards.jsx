export default function OverviewCards({ stats }) {
  if (!stats) return null

  const cards = [
    { label: '总游戏次数', value: stats.totalSessions },
    { label: '正确率', value: `${stats.accuracy}%` },
    { label: '总正确', value: stats.totalCorrect },
    { label: '总星星', value: `⭐ ${stats.totalEarnedStars}` },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card, i) => {
        const colors = [
          { bg: 'bg-slate-800 border-blue-500/30', accent: 'text-blue-400' },
          { bg: 'bg-slate-800 border-green-500/30', accent: 'text-green-400' },
          { bg: 'bg-slate-800 border-yellow-500/30', accent: 'text-yellow-400' },
          { bg: 'bg-slate-800 border-purple-500/30', accent: 'text-purple-400' },
        ]
        return (
          <div key={i} className={`rounded-xl p-4 border-l-4 ${colors[i].bg}`}>
            <div className={`text-xs ${colors[i].accent} opacity-80 mb-1`}>{card.label}</div>
            <div className={`text-2xl font-bold text-slate-100`}>{card.value}</div>
          </div>
        )
      })}
    </div>
  )
}
