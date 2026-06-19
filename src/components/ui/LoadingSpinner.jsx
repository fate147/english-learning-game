export default function LoadingSpinner({ text = '加载中...', theme = 'light' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      {text && <p className={`mt-3 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-white/70'}`}>{text}</p>}
    </div>
  )
}
