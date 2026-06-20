import { useEffect, useRef, useCallback } from 'react'

export default function Modal({ isOpen, onClose, title, children, theme = 'light' }) {
  const overlayRef = useRef(null)
  const closeBtnRef = useRef(null)
  const previousFocusRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement
      document.body.style.overflow = 'hidden'
      closeBtnRef.current?.focus()
    } else {
      document.body.style.overflow = ''
      previousFocusRef.current?.focus()
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onClose?.()
    }
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return
    const el = overlayRef.current
    if (!el) return
    el.addEventListener('keydown', handleKeyDown)
    return () => el.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose?.()
  }

  const isDark = theme === 'dark'

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={title || '对话框'}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overlay-in"
    >
      <div className={`${isDark ? 'bg-slate-800 border border-slate-700' : 'glass-card'} rounded-2xl shadow-xl max-w-md w-full mx-4 p-6 scale-in`}>
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-bold ${isDark ? 'text-slate-100' : 'text-white'}`}>{title}</h2>
            <button
              ref={closeBtnRef}
              onClick={onClose}
              aria-label="关闭"
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
