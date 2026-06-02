import { getWordById } from '../../lib/words.js'

export default function ErrorRanking({ errorRanking }) {
  if (!errorRanking || errorRanking.length === 0) {
    return (
      <div className="text-center text-slate-400 py-8 text-sm">
        暂无错误记录
      </div>
    )
  }

  return (
    <div>
      <h4 className="font-medium text-slate-300 mb-3">易错单词排名</h4>
      <div className="space-y-1">
        {errorRanking.map(([wordId, count], index) => {
          const wordObj = getWordById(wordId)
          return (
            <div
              key={wordId}
              className="flex items-center justify-between bg-slate-800 rounded-lg px-3 py-2 text-sm border border-slate-700"
            >
              <div className="flex items-center gap-2">
                <span className={`font-bold w-5 ${index < 3 ? 'text-red-400' : 'text-slate-400'}`}>
                  #{index + 1}
                </span>
                <span className="font-bold text-slate-100">{wordObj?.word || wordId}</span>
                <span className="text-slate-400 text-xs">{wordObj?.meaning || ''}</span>
              </div>
              <span className="text-red-400 font-bold">{count}次</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
