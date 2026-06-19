import { getWordById } from '../../lib/words.js'

const TITLE_MAP = {
  english: '🔴 常错单词',
  chinese: '🔴 常错题目',
  math: '🔴 常错题目',
}

export default function ErrorRanking({ errorRanking, subject = 'english' }) {
  if (!errorRanking || errorRanking.length === 0) {
    return (
      <div className="text-center text-white/30 py-8 text-sm">
        暂无错误记录
      </div>
    )
  }

  const rankStyles = ['bg-amber-400 text-slate-900', 'bg-slate-400 text-slate-900', 'bg-amber-700 text-white', 'bg-white/10 text-white/50', 'bg-white/10 text-white/50']

  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-xl px-5 py-4">
      <h4 className="section-title text-white/90"><span>{TITLE_MAP[subject] || '🔴 常错记录'}</span> Top 5</h4>
      <div className="flex flex-col gap-1.5">
        {errorRanking.map(([key, count, text], index) => {
          const displayName = subject === 'english'
            ? (getWordById(key)?.word || key)
            : (text || key)
          const badgeClass = count >= 5 ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'
          return (
            <div key={key} className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-white/[0.03]">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${rankStyles[index] || 'bg-white/10 text-white/50'}`}>
                {index + 1}
              </div>
              <span className="flex-1 font-semibold text-sm text-white/90 truncate" title={displayName}>{displayName}</span>
              <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold shrink-0 ${badgeClass}`}>
                错 {count} 次
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
