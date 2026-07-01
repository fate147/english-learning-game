import { useState, useRef, useEffect } from 'react'
import { AVATARS } from '../../config/avatars.js'
import ThemeSwitcher from '../ui/ThemeSwitcher.jsx'

const NAV_ITEMS = [
  {
    key: 'stats',
    label: '统计',
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
  },
  {
    key: 'unlock',
    label: '解锁',
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></svg>,
  },
  {
    key: 'rewards',
    label: '激励',
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  },
]

function ChildSwitcher({ childList, currentChildId, onSelectChild }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!childList?.length) return null
  const current = childList.find((c) => c.child_id === currentChildId)
  const currentAvatar = current ? AVATARS[parseInt(current.avatar)] : '🐱'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 pl-3 pr-2 h-8 rounded-lg text-sm font-semibold
                   text-[#a39880] hover:text-[#d4a574] hover:bg-[#1f1f1f] transition-all duration-150"
        aria-label={`当前孩子: ${current?.name || '未选择'}`}
        aria-expanded={open}
      >
        <span aria-hidden="true" className="text-base">{currentAvatar}</span>
        <span className="hidden sm:inline max-w-[7rem] truncate">{current?.name || '选择孩子'}</span>
        <svg className={`w-3.5 h-3.5 text-[#8a7d6f] shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 min-w-[10rem] rounded-xl border border-[#2a2520] shadow-lg py-1 z-50"
             style={{ background: '#141414' }}
             role="listbox" aria-label="选择孩子">
          {childList.map((c) => {
            const isActive = c.child_id === currentChildId
            const avatar = AVATARS[parseInt(c.avatar)]
            return (
              <button key={c.child_id} onClick={() => { onSelectChild(c.child_id); setOpen(false) }} role="option" aria-selected={isActive}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-left transition-colors duration-100"
                style={{ color: isActive ? '#d4a574' : '#a39880', background: isActive ? '#1f1f1f' : 'transparent' }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#1f1f1f' }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent' }}>
                <span aria-hidden="true" className="text-base">{avatar}</span>
                <span className="truncate">{c.name}</span>
                {isActive && (
                  <svg className="w-3.5 h-3.5 ml-auto shrink-0 text-[#d4a574]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function NavTabs({ activeNav, onNavChange, variant = 'desktop' }) {
  if (variant === 'mobile') {
    return (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-200 border-t border-[#2a2520] flex items-stretch"
           style={{ background: 'rgba(10,10,10,0.95)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} role="tablist" aria-label="底部导航">
        {NAV_ITEMS.map((item) => {
          const isActive = activeNav === item.key
          return (
            <button key={item.key} onClick={() => onNavChange(item.key)} role="tab" aria-selected={isActive}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 py-1.5 transition-colors duration-100
                ${isActive ? 'text-[#d4a574]' : 'text-[#8a7d6f] hover:text-[#a39880]'}`}>
              <span className={isActive ? 'scale-110 transition-transform duration-150' : ''}>
                {item.icon}
              </span>
              <span className={`text-[10px] font-semibold leading-tight ${isActive ? '' : 'opacity-70'}`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>
    )
  }

  return (
    <div className="flex items-stretch gap-0 border-b border-[#2a2520]">
      {NAV_ITEMS.map((item) => {
        const isActive = activeNav === item.key
        return (
          <button key={item.key} onClick={() => onNavChange(item.key)} role="tab" aria-selected={isActive}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold transition-all border-b-2 -mb-px
              ${isActive ? 'text-[#d4a574] border-[#d4a574]' : 'text-[#8a7d6f] border-transparent hover:text-[#a39880]'}`}>
            {item.icon}
            <span>{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default function ParentLayout({
  children, childList, currentChildId, onSelectChild,
  activeNav, onNavChange, onBack, onThemeChange,
}) {
  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      {/* Header */}
      <header className="sticky top-0 z-200" style={{ background: 'rgba(10,10,10,0.95)', borderBottom: '1px solid #2a2520' }}>
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center">
          <div className="flex items-center gap-1.5 shrink-0 w-24">
            {onBack && (
              <button onClick={onBack} className="btn btn-ghost btn-sm btn-icon text-[#a39880] hover:text-[#d4a574] hover:bg-[#1f1f1f]" aria-label="返回">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
            )}
          </div>

          <div className="flex-1 flex justify-center items-center gap-1.5">
            <svg className="w-5 h-5 text-[#d4a574]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            <h1 className="text-sm font-bold text-[#f5f0e8]">家长管理</h1>
          </div>

          <div className="flex items-center shrink-0 gap-2 justify-end">
            <ThemeSwitcher onThemeChange={onThemeChange} />
            <ChildSwitcher childList={childList} currentChildId={currentChildId} onSelectChild={onSelectChild} />
          </div>
        </div>

        {/* Desktop tab bar */}
        <div className="max-w-5xl mx-auto px-4">
          <NavTabs activeNav={activeNav} onNavChange={onNavChange} variant="desktop" />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-6 lg:px-8 lg:py-8 md:pb-8 pb-20">
        <div className="rounded-2xl p-5" style={{ background: '#141414', border: '1px solid #2a2520' }}>
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <NavTabs activeNav={activeNav} onNavChange={onNavChange} variant="mobile" />
    </div>
  )
}
