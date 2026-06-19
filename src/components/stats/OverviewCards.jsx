import { useState, useEffect } from 'react'

function AnimatedValue({ value, delay = 0 }) {
  const [display, setDisplay] = useState(0)
  const numVal = typeof value === 'number' ? value : parseInt(value) || 0
  const suffix = typeof value === 'string' ? value.replace(/[\d]/g, '') : ''

  useEffect(() => {
    const timer = setTimeout(() => {
      const start = Date.now()
      const duration = 600
      const tick = () => {
        const elapsed = Date.now() - start
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setDisplay(Math.round(eased * numVal))
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, delay)
    return () => clearTimeout(timer)
  }, [numVal, delay])

  return <span>{display}{suffix}</span>
}

export default function OverviewCards({ stats }) {
  if (!stats) return null

  const cards = [
    { label: '总场次', value: stats.totalSessions, icon: '📝', border: 'border-t-emerald-400' },
    { label: '正确率', value: stats.accuracy, suffix: '%', icon: '✅', border: 'border-t-green-400' },
    { label: '总答对', value: stats.totalCorrect, icon: '🔥', border: 'border-t-amber-400' },
    { label: '星星总数', value: stats.totalEarnedStars || 0, icon: '🏆', border: 'border-t-violet-400' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
      {cards.map((card, i) => (
        <div
          key={i}
          className="bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-center border-t-2
                     hover:bg-white/[0.08] transition-colors"
          style={{
            borderTopColor: card.border === 'border-t-emerald-400' ? '#34d399'
              : card.border === 'border-t-green-400' ? '#4ade80'
              : card.border === 'border-t-amber-400' ? '#fbbf24'
              : '#a78bfa',
            animationDelay: `${i * 0.08}s`,
          }}
        >
          <div className="text-xl mb-1">{card.icon}</div>
          <div className="text-xl font-extrabold text-white">
            {card.suffix
              ? <><AnimatedValue value={card.value} delay={i * 80} />{card.suffix}</>
              : <AnimatedValue value={card.value} delay={i * 80} />
            }
          </div>
          <div className="text-[11px] text-white/40 mt-0.5">{card.label}</div>
        </div>
      ))}
    </div>
  )
}
