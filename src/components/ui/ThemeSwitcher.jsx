import { useState, useRef, useEffect } from 'react'
import { THEMES, getSavedTheme, saveTheme } from '../../config/themes.js'

export default function ThemeSwitcher({ onThemeChange }) {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState(getSavedTheme)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = (theme) => {
    setCurrent(theme)
    saveTheme(theme.id)
    setOpen(false)
    onThemeChange?.(theme)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold
                   text-[#a39880] hover:text-[#d4a574] hover:bg-[#1f1f1f] transition-all duration-150 border border-[#2a2520]"
        aria-label="切换主题"
        aria-expanded={open}
      >
        <span className="w-3 h-3 rounded-full" style={{ background: current.colors.gradient }} />
        <span className="hidden sm:inline">{current.name}</span>
        <svg className={`w-3 h-3 text-[#8a7d6f] shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 min-w-[8rem] rounded-xl border border-[#2a2520] shadow-lg py-1 z-50"
          style={{ background: '#141414' }}
          role="listbox" aria-label="选择主题">
          {THEMES.map((theme) => {
            const isActive = theme.id === current.id
            return (
              <button key={theme.id} onClick={() => handleSelect(theme)} role="option" aria-selected={isActive}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-left transition-colors duration-100"
                style={{ color: isActive ? '#d4a574' : '#a39880', background: isActive ? '#1f1f1f' : 'transparent' }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#1f1f1f' }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent' }}>
                <span className="w-3 h-3 rounded-full shrink-0" style={{ background: theme.colors.gradient }} />
                <span className="truncate">{theme.name}</span>
                {isActive && (
                  <svg className="w-3 h-3 ml-auto shrink-0 text-[#d4a574]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
