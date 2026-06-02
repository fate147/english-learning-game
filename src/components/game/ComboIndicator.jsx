import { useEffect, useState } from 'react'

export default function ComboIndicator({ combo }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (combo >= 3) {
      setShow(true)
      const timer = setTimeout(() => setShow(false), 1500)
      return () => clearTimeout(timer)
    } else {
      setShow(false)
    }
  }, [combo])

  if (!show) return null

  const messages = {
    3: '连续 3 题！+1 ⭐',
    5: '连续 5 题！+2 ⭐',
  }

  const message = messages[combo] || `🔥 ${combo} 连击！`

  return (
    <div className="fixed top-1/3 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
      <div className="combo-pop bg-gradient-to-r from-yellow-400 to-orange-500 text-white
                      px-6 py-3 rounded-2xl shadow-lg font-bold text-lg whitespace-nowrap">
        {message}
      </div>
    </div>
  )
}
