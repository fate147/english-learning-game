import { useState, useEffect } from 'react'
import { calcScore } from '../../engines/scoring.js'
import { useGameTheme } from '../../context/GameThemeContext.jsx'
import Button from '../ui/Button.jsx'
import StarRain from '../ui/StarRain.jsx'

function AnimatedNumber({ value, duration = 800, delay = 0 }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const timer = setTimeout(() => {
      const start = Date.now()
      const tick = () => {
        const elapsed = Date.now() - start
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setDisplay(Math.round(eased * value))
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, delay)
    return () => clearTimeout(timer)
  }, [value, duration, delay])
  return <span>{display}</span>
}

function RingChart({ correct, total, delay = 200 }) {
  const pct = total > 0 ? correct / total : 0
  const r = 54
  const c = 2 * Math.PI * r
  const [offset, setOffset] = useState(c)

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(c * (1 - pct))
    }, delay)
    return () => clearTimeout(timer)
  }, [pct, c, delay])

  const color = pct >= 0.8 ? 'var(--c-correct)' : pct >= 0.5 ? 'var(--c-warning)' : 'var(--c-wrong)'

  return (
    <div className="relative w-32 h-32">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--c-border)" strokeWidth="8" />
        <circle
          cx="60" cy="60" r={r} fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.4s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-2xl font-bold text-[var(--c-text)]">
          <AnimatedNumber value={Math.round(pct * 100)} delay={delay + 300} />%
        </div>
        <div className="text-[10px] text-[var(--c-text-muted)] font-bold">正确率</div>
      </div>
    </div>
  )
}

export default function ResultScreen({ results, onPlayAgain, onGoHome }) {
  if (!results) return null

  const { gameTheme } = useGameTheme()
  const { totalQuestions, correctCount, wrongCount, maxCombo, isPerfect } = results
  const { totalAdd } = calcScore(correctCount, maxCombo, isPerfect, false, false)

  const confettiColors = ['#22c55e', '#f59e0b', '#22d3ee', '#a855f7', '#f97316', '#10b981']
  const confettiCount = 14

  return (
    <div className={`min-h-screen ${gameTheme.pattern} flex flex-col relative overflow-hidden`}>
      <StarRain count={15} />
      <div className="confetti-container">
        {Array.from({ length: confettiCount }, (_, i) => (
          <div
            key={i}
            className="confetti-piece"
            style={{
              left: `${(i / confettiCount) * 100}%`,
              background: confettiColors[i % confettiColors.length],
              animationDuration: `${2 + Math.random() * 2}s`,
              animationDelay: `${i * 0.15}s`,
              width: `${6 + Math.random() * 5}px`,
              height: `${6 + Math.random() * 5}px`,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            }}
          />
        ))}
      </div>

      <main className="flex-1 flex flex-col items-center justify-center gap-5 px-4 relative z-10" aria-live="polite">
        <div className="text-center page-enter">
          <h2 className="text-2xl font-bold text-white">
            {isPerfect ? '太棒了！全对！' : correctCount > wrongCount ? '做得不错！' : '继续加油！'}
          </h2>
          <p className="text-white/80 text-sm max-w-xs mt-2">
            {isPerfect
              ? '每道题都答对了，你真厉害！'
              : correctCount > wrongCount
                ? `答对了 ${correctCount} 道题，再接再厉！`
                : `答对了 ${correctCount} 道题，多练习会更好哦！`
            }
          </p>
        </div>

        <div className="fade-slide-enter" style={{animationDelay: '0.1s'}}>
          <RingChart correct={correctCount} total={totalQuestions} delay={300} />
        </div>

        <div className="flex gap-3 w-full max-w-sm fade-slide-enter" style={{animationDelay: '0.2s'}}>
          <div className="flex-1 glass-card text-center">
            <div className="text-2xl font-bold text-[var(--c-correct)]">
              <AnimatedNumber value={correctCount} delay={400} />
            </div>
            <div className="text-[10px] text-white/75 font-bold mt-0.5">答对</div>
          </div>
          <div className="flex-1 glass-card text-center">
            <div className="text-2xl font-bold text-[var(--c-wrong)]">
              <AnimatedNumber value={wrongCount} delay={500} />
            </div>
            <div className="text-[10px] text-white/75 font-bold mt-0.5">答错</div>
          </div>
          {maxCombo >= 3 && (
            <div className="flex-1 glass-card text-center">
              <div className="text-2xl font-bold text-orange-500">
                <AnimatedNumber value={maxCombo} delay={600} />
              </div>
              <div className="text-[10px] text-white/75 font-bold mt-0.5">连击</div>
            </div>
          )}
        </div>

        {totalAdd > 0 && (
          <div className="glass-card text-center px-8 fade-slide-enter" style={{animationDelay: '0.3s'}}>
            <div className="text-[10px] text-yellow-400 font-bold">获得星星</div>
            <div className="text-3xl font-bold text-yellow-400 mt-0.5">
              ★ +<AnimatedNumber value={totalAdd} delay={700} />
            </div>
          </div>
        )}

        <div className="flex gap-3 w-full max-w-xs fade-slide-enter" style={{animationDelay: '0.35s'}}>
          <button
            onClick={onGoHome}
            className="flex-1 py-3 rounded-xl font-bold text-white/80 border border-white/30
                       hover:bg-white/10 hover:text-white transition-all duration-150"
          >
            回首页
          </button>
          <Button variant="primary" size="lg" onClick={onPlayAgain} className="flex-1">
            再来一次
          </Button>
        </div>
      </main>
    </div>
  )
}
