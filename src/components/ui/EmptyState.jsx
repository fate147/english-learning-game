const ICONS = {
  child: (
    <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="24" cy="16" r="8" />
      <path d="M12 40c0-6.627 5.373-12 12-12s12 5.373 12 12" />
      <path d="M6 4v8" /><path d="M2 8h8" />
      <path d="M40 22v8" /><path d="M36 26h8" />
    </svg>
  ),
  record: (
    <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="6" y="10" width="36" height="28" rx="4" />
      <line x1="14" y1="20" x2="34" y2="20" />
      <line x1="14" y1="28" x2="28" y2="28" />
    </svg>
  ),
  star: (
    <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="24 4 29.5 16.5 43 18.5 33 28 35.5 42 24 35.5 12.5 42 15 28 5 18.5 18.5 16.5 24 4" />
    </svg>
  ),
  search: (
    <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="20" cy="20" r="14" />
      <line x1="30" y1="30" x2="42" y2="42" />
    </svg>
  ),
}

export default function EmptyState({ variant = 'record', text = '暂无数据', subtext }) {
  const Icon = ICONS[variant] || ICONS.record
  return (
    <div className="empty-state page-enter">
      <div className="empty-state-icon">
        {Icon}
      </div>
      <p className="empty-state-title">{text}</p>
      {subtext && <p className="empty-state-description">{subtext}</p>}
    </div>
  )
}
