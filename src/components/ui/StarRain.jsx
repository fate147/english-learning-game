import { useMemo } from 'react'

const STAR_COLORS = ['#fbbf24', '#f472b6', '#60a5fa', '#34d399', '#a78bfa', '#fb923c', '#f87171']

function Star({ style }) {
  return (
    <div
      className="absolute text-white/30 pointer-events-none animate-[star-fall_linear_infinite]"
      style={style}
    >
      ★
    </div>
  )
}

export default function StarRain({ count = 20 }) {
  const stars = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      fontSize: `${8 + Math.random() * 12}px`,
      color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      duration: `${4 + Math.random() * 6}s`,
      delay: `${Math.random() * 8}s`,
      opacity: 0.15 + Math.random() * 0.25,
    }))
  }, [count])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <style>{`
        @keyframes star-fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
      {stars.map((s) => (
        <Star
          key={s.id}
          style={{
            left: s.left,
            fontSize: s.fontSize,
            color: s.color,
            animationDuration: s.duration,
            animationDelay: s.delay,
            opacity: s.opacity,
          }}
        />
      ))}
    </div>
  )
}
