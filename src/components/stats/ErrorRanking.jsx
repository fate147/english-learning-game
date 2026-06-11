import { getWordById } from '../../lib/words.js'

export default function ErrorRanking({ errorRanking }) {
  if (!errorRanking || errorRanking.length === 0) {
    return (
      <div className="text-center text-slate-500 py-8 text-sm">
        暂无错误记录
      </div>
    )
  }

  const rankStyles = ['bg-amber-400 text-slate-900', 'bg-slate-400 text-slate-900', 'bg-amber-700 text-white', 'bg-slate-700/50 text-slate-400', 'bg-slate-700/50 text-slate-400']

  return (
    <div className="bg-slate-800/50 border border-slate-700/35 rounded-xl px-5 py-4">
      <h4 className="section-title text-slate-200"><span>🔴</span> 常错单词 Top 5</h4>
      <div className="flex flex-col gap-1.5">
        {errorRanking.map(([wordId, count], index) => {
          const wordObj = getWordById(wordId)
          const badgeClass = count >= 5 ? 'bg-red-500/15 text-red-400' : 'bg-yellow-500/15 text-yellow-400'
          return (
            <div key={wordId} className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-slate-900/30">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${rankStyles[index] || 'bg-slate-700/50 text-slate-400'}`}>
                {index + 1}
              </div>
              <span className="flex-1 font-semibold text-sm text-slate-200">{wordObj?.word || wordId}</span>
              <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${badgeClass}`}>
                错 {count} 次
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
