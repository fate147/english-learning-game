export default function LoadingSpinner({ text = '加载中...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12" role="status" aria-live="polite">
      <div className="spinner spinner-lg" />
      {text && <p className="mt-3 text-sm text-[var(--c-text-muted)]">{text}</p>}
    </div>
  )
}
