import { useState } from 'react'
import Button from '../ui/Button.jsx'

export default function RewardRecord({ templates, onRedeem, availableStars, records }) {
  const [selectedId, setSelectedId] = useState(null)

  const handleRedeem = async () => {
    if (!selectedId) return
    const tmpl = templates.find((t) => t.id === selectedId)
    if (!tmpl) return
    if (availableStars < tmpl.cost) return
    await onRedeem(tmpl)
    setSelectedId(null)
  }

  return (
    <div className="space-y-4">
      {/* 星星余额 */}
      <div className="text-center">
        <div className="text-sm text-slate-400">可用星星</div>
        <div className="text-3xl font-bold text-yellow-400">⭐ {availableStars}</div>
      </div>

      {/* 兑换区 */}
      {templates.length > 0 && (
        <div>
          <h4 className="font-medium text-slate-300 mb-2">选择奖励</h4>
          <div className="grid grid-cols-2 gap-2">
            {templates.map((t) => {
              const canAfford = availableStars >= t.cost
              const isSelected = selectedId === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => canAfford && setSelectedId(t.id)}
                  disabled={!canAfford}
                  className={`
                    rounded-xl p-3 text-center border-2 transition-all
                    ${isSelected
                      ? 'border-[var(--theme-color)] bg-slate-700'
                      : canAfford
                        ? 'border-slate-600 bg-slate-800 text-slate-100 hover:border-[var(--theme-color)]'
                        : 'border-slate-700 bg-slate-800/50 opacity-50 cursor-not-allowed'
                    }
                  `}
                >
                  <div className="text-2xl">{t.icon || '🎁'}</div>
                  <div className="font-bold text-sm mt-1 text-slate-100">{t.name}</div>
                  <div className="text-xs text-slate-400">⭐ {t.cost}</div>
                </button>
              )
            })}
          </div>

          {selectedId && (
            <Button onClick={handleRedeem} className="w-full mt-3">
              兑换奖励
            </Button>
          )}
        </div>
      )}

      {/* 兑换记录 */}
      {records && records.length > 0 && (
        <div>
          <h4 className="font-medium text-slate-300 mb-2">兑换记录</h4>
          <div className="space-y-1">
            {records.slice(0, 10).map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between bg-slate-800 rounded-lg px-3 py-2 text-sm border border-slate-700"
              >
                <span className="text-slate-200">{r.name}</span>
                <span className="text-yellow-400 font-bold">-⭐{r.cost}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
