import { useEffect, useRef } from 'react'

export default function Modal({ isOpen, onClose, title, children, theme = 'light' }) {
  const overlayRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose?.()
  }

  const isDark = theme === 'dark'

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overlay-in"
    >
      <div className={`${isDark ? 'bg-slate-800 border border-slate-700' : 'glass-card'} rounded-2xl shadow-xl max-w-md w-full mx-4 p-6 scale-in`}>
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-bold ${isDark ? 'text-slate-100' : 'text-white'}`}>{title}</h2>
            <button
              onClick={onClose}
              className={`${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-white/60 hover:text-white'} text-2xl leading-none`}
            >
              &times;
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
