export default function OverviewCards({ stats }) {
  if (!stats) return null

  const cards = [
    { label: '总答题', value: stats.totalSessions, icon: '📝', border: 'border-t-cyan-400' },
    { label: '正确率', value: `${stats.accuracy}%`, icon: '✅', border: 'border-t-green-400' },
    { label: '最高连击', value: stats.maxCombo || stats.totalCorrect, icon: '🔥', border: 'border-t-yellow-400' },
    { label: '本周星星', value: `⭐ ${stats.totalEarnedStars || 0}`, icon: '🏆', border: 'border-t-purple-400' },
  ]

  return (
    <div className="grid grid-cols-4 gap-2.5 mb-4">
      {cards.map((card, i) => (
        <div
          key={i}
          className={`bg-slate-800/40 border border-slate-700/30 rounded-xl px-4 py-3.5 text-center border-t-2 ${card.border}`}
        >
          <div className="text-xl mb-1">{card.icon}</div>
          <div className="text-xl font-extrabold text-slate-100">{card.value}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{card.label}</div>
        </div>
      ))}
    </div>
  )
}
