import { getWordsByUnit } from '../../lib/words.js'

export default function UnitProgress({ wordProgress }) {
  const units = [1, 2, 3, 4, 5, 6]

  return (
    <div>
      <h4 className="font-medium text-slate-300 mb-3">单元进度</h4>
      <div className="space-y-2">
        {units.map((unit) => {
          const words = getWordsByUnit(unit)
          const learned = words.filter((w) => {
            const wp = wordProgress?.[w.id]
            return wp && wp.level >= 2
          }).length
          const percent = words.length > 0 ? Math.round((learned / words.length) * 100) : 0

          return (
            <div key={unit} className="bg-slate-800 rounded-xl p-3 border border-slate-700">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-200">单元 {unit}</span>
                <span className="text-xs text-slate-400">
                  {learned}/{words.length} ({percent}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-600 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--theme-color)] transition-all duration-700"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
