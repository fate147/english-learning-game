export default function Skeleton({ className = '' }) {
  return (
    <div className={`skeleton-card ${className}`}>
      <div className="p-6 space-y-4">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-text" style={{ width: '50%' }} />
        <div className="skeleton skeleton-text" style={{ width: '66%' }} />
      </div>
    </div>
  )
}
