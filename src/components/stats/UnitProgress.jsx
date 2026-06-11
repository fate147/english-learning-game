import { getWordsByUnit } from '../../lib/words.js'

export default function UnitProgress({ wordProgress }) {
  const units = [1, 2, 3, 4, 5, 6]

  return (
    <div className="bg-slate-800/50 border border-slate-700/35 rounded-xl px-5 py-4">
      <h4 className="section-title text-slate-200"><span>📚</span> 单元进度</h4>
      <div className="flex flex-col gap-2.5">
        {units.map((unit) => {
          const words = getWordsByUnit(unit)
          const learned = words.filter((w) => {
            const wp = wordProgress?.[w.id]
            return wp && wp.level >= 2
          }).length
          const percent = words.length > 0 ? Math.round((learned / words.length) * 100) : 0

          return (
            <div key={unit} className="flex items-center gap-3">
              <span className="text-xs text-slate-500 w-[72px] shrink-0">Unit {unit}</span>
              <div className="flex-1 h-2 bg-slate-700/60 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-green-400 transition-all duration-700"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="text-xs text-slate-500 w-10 text-right font-semibold">{percent}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
