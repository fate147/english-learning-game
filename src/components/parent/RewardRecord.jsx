import { useState } from 'react'

const ICON_OPTIONS = ['🎁', '🎮', '📚', '🎨', '🍰', '🧸', '🎪', '🎠', '🏖️', '🎬', '📱', '⭐', '🏆', '🎵', '🎠', '🚀']

function relativeTime(dateStr) {
  const now = new Date()
  const d = new Date(dateStr)
  const diffMs = now - d
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `${diffDays} 天前`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} 周前`
  return new Date(dateStr).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}

export default function RewardRecord({ templates, onRedeem, availableStars, records, onAddTemplate, onDeleteTemplate }) {
  const [newName, setNewName] = useState('')
  const [newCost, setNewCost] = useState(10)
  const [newIcon, setNewIcon] = useState('🎁')
  const [showIconPicker, setShowIconPicker] = useState(false)

  const recentCount = records?.filter(r => {
    const d = new Date(r.created_at)
    const now = new Date()
    return d > new Date(now.setDate(now.getDate() - 3))
  }).length || 0

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2.5">
        <div className="bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-center border-t-2 border-t-amber-400">
          <div className="text-xl mb-1">⭐</div>
          <div className="text-xl font-extrabold text-white">{availableStars}</div>
          <div className="text-[11px] text-white/40 mt-0.5">可用星星</div>
        </div>
        <div className="bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-center border-t-2 border-t-green-400">
          <div className="text-xl mb-1">🏆</div>
          <div className="text-xl font-extrabold text-white">{records?.length || 0}</div>
          <div className="text-[11px] text-white/40 mt-0.5">已兑换次数</div>
        </div>
        <div className="bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-center border-t-2 border-t-violet-400">
          <div className="text-xl mb-1">📦</div>
          <div className="text-xl font-extrabold text-white">{templates.length}</div>
          <div className="text-[11px] text-white/40 mt-0.5">奖励模板</div>
        </div>
        <div className="bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-center border-t-2 border-t-rose-400">
          <div className="text-xl mb-1">💳</div>
          <div className="text-xl font-extrabold text-white">{recentCount}</div>
          <div className="text-[11px] text-white/40 mt-0.5">待领取</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 奖励模板 */}
        <div className="bg-white/[0.04] border border-white/10 rounded-xl px-5 py-4">
          <h4 className="section-title text-white/90"><span>🎁</span> 奖励模板</h4>
          <div className="grid grid-cols-2 gap-2">
            {templates.map((t) => {
              const canAfford = availableStars >= t.cost
              return (
                <div key={t.id} className="relative group">
                  <div className="rounded-xl p-3 text-center border bg-white/[0.03] border-white/10 text-white/90
                                  hover:border-white/20 hover:bg-white/[0.06] transition-all">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-2xl">{t.icon || '🎁'}</span>
                      <button
                        onClick={() => onDeleteTemplate?.(t.id)}
                        className="w-6 h-6 rounded-lg text-xs flex items-center justify-center
                                   text-white/20 hover:bg-red-500/20 hover:text-red-400 transition-all
                                   opacity-0 group-hover:opacity-100"
                        title="删除此奖励模板"
                      >🗑</button>
                    </div>
                    <div className="font-semibold text-sm mb-1">{t.name}</div>
                    <div className="text-xs text-amber-400 mb-2">⭐ {t.cost}</div>
                    <button
                      onClick={() => canAfford && onRedeem(t)}
                      disabled={!canAfford}
                      className={`inline-block px-4 py-1.5 rounded-lg text-xs font-bold transition-all
                        ${canAfford
                          ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-slate-900 hover:brightness-110'
                          : 'bg-white/[0.06] text-white/25 cursor-not-allowed'
                        }`}
                    >兑换</button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* 添加新奖励 */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="text-xs font-semibold text-white/40 mb-2">➕ 添加新奖励</div>
            <div className="flex gap-2 items-start">
              <div className="relative">
                <button
                  onClick={() => setShowIconPicker(!showIconPicker)}
                  className="w-9 h-9 border border-white/15 rounded-lg text-lg bg-white/[0.04] text-white/60
                             hover:border-emerald-400/50 transition-all flex items-center justify-center"
                >{newIcon}</button>
                {showIconPicker && (
                  <div className="absolute z-50 top-full left-0 mt-1 bg-white/[0.08] backdrop-blur-md border border-white/15 rounded-xl p-2 shadow-2xl grid grid-cols-4 gap-1 w-40">
                    {ICON_OPTIONS.map(icon => (
                      <button key={icon}
                        onClick={() => { setNewIcon(icon); setShowIconPicker(false) }}
                        className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center hover:bg-white/10 transition-all
                          ${newIcon === icon ? 'bg-emerald-500/20 ring-1 ring-emerald-400/50' : ''}`}
                      >{icon}</button>
                    ))}
                  </div>
                )}
              </div>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                placeholder="奖励名称" maxLength={20}
                className="flex-1 px-3 py-1.5 border border-white/15 rounded-lg text-xs bg-white/[0.04] text-white/80 placeholder-white/25 focus:border-emerald-400/50 focus:outline-none" />
              <input type="number" value={newCost} onChange={(e) => setNewCost(Math.max(1, parseInt(e.target.value) || 1))}
                min={1} max={999}
                className="w-16 px-3 py-1.5 border border-white/15 rounded-lg text-xs bg-white/[0.04] text-white/80 placeholder-white/25 focus:border-emerald-400/50 focus:outline-none" placeholder="⭐" />
              <button onClick={() => {
                  if (!newName.trim()) return
                  onAddTemplate?.({ name: newName.trim(), cost: newCost, icon: newIcon })
                  setNewName(''); setNewCost(10); setNewIcon('🎁')
                }}
                disabled={!newName.trim()}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                添加
              </button>
            </div>
          </div>
        </div>

        {/* 兑换记录 */}
        <div className="bg-white/[0.04] border border-white/10 rounded-xl px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="section-title text-white/90" style={{margin:0}}><span>📋</span> 兑换记录</h4>
            <span className="text-xs text-white/30">共 {records?.length || 0} 次</span>
          </div>
          <div className="flex flex-col gap-1">
            {records && records.length > 0 ? (
              records.slice(0, 10).map((r) => (
                <div key={r.id} className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-white/[0.03] text-sm">
                  <span className="flex-1 text-white/80">{r.name}</span>
                  <span className="text-rose-400 font-bold text-xs">-⭐{r.cost}</span>
                  <span className="text-white/30 text-[11px]">{relativeTime(r.created_at)}</span>
                </div>
              ))
            ) : (
              <div className="text-center text-white/25 text-sm py-6">暂无兑换记录</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
