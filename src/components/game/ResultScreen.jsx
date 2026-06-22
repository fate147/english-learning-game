import { useState, useEffect } from 'react'
import { calcScore } from '../../engines/scoring.js'
import Button from '../ui/Button.jsx'

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

  const color = pct >= 0.8 ? '#4ade80' : pct >= 0.5 ? '#fbbf24' : '#f87171'

  return (
    <div className="relative w-36 h-36">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={r} fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-3xl font-black text-white">
          <AnimatedNumber value={Math.round(pct * 100)} delay={delay + 300} />%
        </div>
        <div className="text-[10px] text-white/50 font-bold">正确率</div>
      </div>
    </div>
  )
}

export default function ResultScreen({ results, onPlayAgain, onGoHome }) {
  if (!results) return null

  const { totalQuestions, correctCount, wrongCount, maxCombo, isPerfect } = results
  const { totalAdd } = calcScore(correctCount, maxCombo, isPerfect, false, false)

  const confettiColors = ['#ff6b9d', '#fbbf24', '#4ade80', '#4d96ff', '#c084fc', '#fb923c']
  const confettiCount = 18

  return (
    <div className="game-page-bg min-h-screen flex flex-col relative overflow-hidden">
      {/* 彩纸 — 加密 */}
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
              width: `${6 + Math.random() * 6}px`,
              height: `${6 + Math.random() * 6}px`,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            }}
          />
        ))}
      </div>

      {/* 装饰 */}
      <div className="deco-cloud float-cloud" style={{width:'100px',height:'32px',top:'6%',left:'8%'}} />
      <div className="deco-cloud float-cloud" style={{width:'70px',height:'24px',top:'14%',right:'12%',animationDelay:'1s'}} />

      {/* 主内容 */}
      <main className="flex-1 flex flex-col items-center justify-center gap-5 sm:gap-6 px-4 relative z-10" aria-live="polite">

        {/* 表情 + 标题 */}
        <div className="text-center page-enter">
          <div className={`text-7xl mb-3 ${isPerfect ? 'result-bounce' : ''}`}>
            {isPerfect ? '🎉' : correctCount > wrongCount ? '👏' : '💪'}
          </div>
          <h2 className="text-2xl font-black text-white" style={{textShadow: '0 2px 12px rgba(0,0,0,0.3)'}}>
            {isPerfect ? '太棒了！全对！' : correctCount > wrongCount ? '做得不错！' : '继续加油！'}
          </h2>
          <p className="guide-text max-w-xs mt-2">
            {isPerfect
              ? '每道题都答对了，你真厉害！'
              : correctCount > wrongCount
                ? `答对了 ${correctCount} 道题，再接再厉！`
                : `答对了 ${correctCount} 道题，多练习会更好哦！`
            }
          </p>
        </div>

        {/* 环形正确率 */}
        <div className="fade-slide-enter" style={{animationDelay: '0.1s'}}>
          <RingChart correct={correctCount} total={totalQuestions} delay={300} />
        </div>

        {/* 数据卡片行 */}
        <div className="flex gap-3 w-full max-w-sm fade-slide-enter" style={{animationDelay: '0.2s'}}>
          <div className="flex-1 glass-card !p-3 text-center">
            <div className="text-2xl font-black text-green-400">
              <AnimatedNumber value={correctCount} delay={400} />
            </div>
            <div className="text-[10px] text-white/50 font-bold mt-0.5">✅ 答对</div>
          </div>
          <div className="flex-1 glass-card !p-3 text-center">
            <div className="text-2xl font-black text-red-400">
              <AnimatedNumber value={wrongCount} delay={500} />
            </div>
            <div className="text-[10px] text-white/50 font-bold mt-0.5">❌ 答错</div>
          </div>
          {maxCombo >= 3 && (
            <div className="flex-1 glass-card !p-3 text-center">
              <div className="text-2xl font-black text-orange-400">
                <AnimatedNumber value={maxCombo} delay={600} />
              </div>
              <div className="text-[10px] text-white/50 font-bold mt-0.5">🔥 连击</div>
            </div>
          )}
        </div>

        {/* 星星获得 — 带动画 */}
        {totalAdd > 0 && (
          <div className="glass-card !px-8 !py-3 text-center fade-slide-enter" style={{animationDelay: '0.3s'}}>
            <div className="text-[10px] text-white/50 font-bold">获得星星</div>
            <div className="text-3xl font-black text-amber-400 mt-0.5" style={{textShadow: '0 0 20px rgba(251,191,36,0.3)'}}>
              ⭐ +<AnimatedNumber value={totalAdd} delay={700} />
            </div>
          </div>
        )}

        {/* 按钮 */}
        <div className="flex gap-3 w-full max-w-xs fade-slide-enter" style={{animationDelay: '0.35s'}}>
          <Button variant="glass" size="xl" onClick={onGoHome}>
            🏠 回首页
          </Button>
          <Button variant="game" size="xl" onClick={onPlayAgain} className="result-play-pulse">
            🔄 再来一次
          </Button>
        </div>
      </main>
    </div>
  )
}
