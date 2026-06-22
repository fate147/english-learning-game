export default function EmptyState({ icon = '📭', text = '暂无数据', subtext }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-5xl mb-4 opacity-60">{icon}</div>
      <p className="text-white/60 font-bold text-sm">{text}</p>
      {subtext && <p className="text-white/35 text-xs mt-1">{subtext}</p>}
    </div>
  )
}
