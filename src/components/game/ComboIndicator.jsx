import { useEffect, useState, useRef } from 'react'

const COMBO_TIERS = [
  { min: 7, gradient: 'from-red-500 via-orange-500 to-yellow-400', glow: 'rgba(251,191,36,0.5)', scale: 1.5, icon: '⚡', label: '超神连击！' },
  { min: 5, gradient: 'from-orange-500 via-amber-500 to-yellow-400', glow: 'rgba(249,115,22,0.4)', scale: 1.35, icon: '🔥', label: '势不可挡！' },
  { min: 3, gradient: 'from-yellow-400 to-amber-500', glow: 'rgba(234,179,8,0.35)', scale: 1.2, icon: '🔥', label: '' },
]

function getTier(combo) {
  for (const t of COMBO_TIERS) {
    if (combo >= t.min) return t
  }
  return null
}

function getMessage(combo) {
  if (combo === 3) return '连续 3 题！+1 ⭐'
  if (combo === 5) return '连续 5 题！+2 ⭐'
  if (combo >= 7) return `⚡ ${combo} 连击！`
  return `🔥 ${combo} 连击！`
}

export default function ComboIndicator({ combo, prevCombo }) {
  const [show, setShow] = useState(false)
  const [displayCombo, setDisplayCombo] = useState(0)
  const [broken, setBroken] = useState(false)
  const prevRef = useRef(0)

  useEffect(() => {
    const was = prevRef.current

    if (combo >= 3) {
      setDisplayCombo(combo)
      setShow(true)
      setBroken(false)
      const timer = setTimeout(() => setShow(false), 1500)
      prevRef.current = combo
      return () => clearTimeout(timer)
    }

    // 连击断掉：之前 >= 3，现在 < 3
    if (was >= 3 && combo < 3) {
      setBroken(true)
      setShow(true)
      const timer = setTimeout(() => {
        setShow(false)
        setBroken(false)
      }, 1200)
      prevRef.current = combo
      return () => clearTimeout(timer)
    }

    setShow(false)
    prevRef.current = combo
  }, [combo])

  if (!show) return null

  // 连击断掉提示
  if (broken) {
    return (
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <div className="combo-break pop-out">
          <span className="text-lg">😅</span>
          <span className="font-bold">可惜了！</span>
        </div>
      </div>
    )
  }

  const tier = getTier(displayCombo)
  const message = getMessage(displayCombo)

  return (
    <div className="fixed top-1/3 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
      <div
        className={`combo-pop combo-glow flex items-center gap-2 bg-gradient-to-r ${tier.gradient} text-white
                     px-6 py-3 rounded-2xl shadow-xl font-black whitespace-nowrap`}
        style={{
          transform: `scale(${tier.scale})`,
          textShadow: '0 2px 8px rgba(0,0,0,0.3)',
          boxShadow: `0 8px 32px ${tier.glow}, 0 0 60px ${tier.glow}`,
        }}
      >
        {tier.icon && <span className="text-2xl">{tier.icon}</span>}
        <span>{message}</span>
      </div>
    </div>
  )
}
