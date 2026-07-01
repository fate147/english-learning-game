import { useEffect, useRef, useCallback } from 'react'

export default function Modal({ isOpen, onClose, title, children }) {
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

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={title || '对话框'}
      className={`modal-overlay ${isOpen ? 'open' : ''}`}
    >
      <div className="modal">
        {title && (
          <div className="modal-header">
            <h2 className="modal-title">{title}</h2>
            <button
              ref={closeBtnRef}
              onClick={onClose}
              aria-label="关闭"
              className="modal-close"
            >
              &times;
            </button>
          </div>
        )}
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  )
}
