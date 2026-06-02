import { useEffect } from 'react'

export default function Toast({ message, type = 'info', onClose, duration = 2500 }) {
  useEffect(() => {
    if (!onClose) return
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  const bgMap = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-[var(--theme-color)]',
    warning: 'bg-yellow-500',
  }

  return (
    <div className="fixed top-4 right-4 z-[100] animate-fade-in">
      <div
        className={`${bgMap[type]} text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2`}
      >
        <span className="text-sm">{message}</span>
        {onClose && (
          <button onClick={onClose} className="ml-2 text-white/80 hover:text-white">
            &times;
          </button>
        )}
      </div>
    </div>
  )
}
