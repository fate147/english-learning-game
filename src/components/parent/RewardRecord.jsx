import { useState } from 'react'

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

  return (
    <div className="space-y-4">
      {/* 概览统计 */}
      <div className="grid grid-cols-4 gap-2.5">
        <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl px-4 py-3.5 text-center border-t-2 border-t-yellow-400">
          <div className="text-xl mb-1">⭐</div>
          <div className="text-xl font-extrabold text-slate-100">{availableStars}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">可用星星</div>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl px-4 py-3.5 text-center border-t-2 border-t-green-400">
          <div className="text-xl mb-1">🏆</div>
          <div className="text-xl font-extrabold text-slate-100">{records?.length || 0}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">已兑换次数</div>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl px-4 py-3.5 text-center border-t-2 border-t-purple-400">
          <div className="text-xl mb-1">📦</div>
          <div className="text-xl font-extrabold text-slate-100">{templates.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">奖励模板</div>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl px-4 py-3.5 text-center border-t-2 border-t-red-400">
          <div className="text-xl mb-1">💳</div>
          <div className="text-xl font-extrabold text-slate-100">{
            records?.filter(r => {
              const d = new Date(r.created_at)
              const now = new Date()
              return d > new Date(now.setDate(now.getDate() - 3))
            }).length || 0
          }</div>
          <div className="text-[11px] text-slate-500 mt-0.5">待领取</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 奖励模板 */}
        <div className="bg-slate-800/50 border border-slate-700/35 rounded-xl px-5 py-4 border-t-2 border-t-yellow-400/30">
          <h4 className="section-title text-slate-200"><span>🎁</span> 奖励模板</h4>
          <div className="grid grid-cols-2 gap-2">
            {templates.map((t) => {
              const canAfford = availableStars >= t.cost
              return (
                <div key={t.id} className="relative">
                  <div className="rounded-xl p-3 text-center border bg-slate-800/30 border-slate-700/40 text-slate-200">
                    <div className="text-2xl mb-1">{t.icon || '🎁'}</div>
                    <div className="font-semibold text-sm mb-1">{t.name}</div>
                    <div className="text-xs text-yellow-400 mb-2">⭐ {t.cost}</div>
                    <button
                      onClick={() => canAfford && onRedeem(t)}
                      disabled={!canAfford}
                      className={`inline-block px-4 py-1.5 rounded-lg text-xs font-bold transition-all
                        ${canAfford
                          ? 'bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-900 hover:brightness-110'
                          : 'bg-slate-700/30 text-slate-600 cursor-not-allowed'
                        }`}
                    >
                      兑换
                    </button>
                  </div>
                  <button
                    onClick={() => onDeleteTemplate?.(t.id)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-600/80 text-slate-300 text-xs flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                    title="删除此奖励模板"
                  >
                    ✕
                  </button>
                </div>
              )
            })}
          </div>

          {/* 添加新奖励 */}
          <div className="mt-4 pt-4 border-t border-slate-700/40">
            <div className="text-xs font-semibold text-slate-500 mb-2">➕ 添加新奖励</div>
            <div className="flex gap-2">
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                placeholder="奖励名称" maxLength={20}
                className="flex-1 px-3 py-1.5 border border-slate-700/50 rounded-lg text-xs bg-slate-900/40 text-slate-400 placeholder-slate-600 focus:border-cyan-400/50 focus:outline-none" />
              <input type="number" value={newCost} onChange={(e) => setNewCost(Math.max(1, parseInt(e.target.value) || 1))}
                min={1} max={999}
                className="w-16 px-3 py-1.5 border border-slate-700/50 rounded-lg text-xs bg-slate-900/40 text-slate-400 placeholder-slate-600 focus:border-cyan-400/50 focus:outline-none" placeholder="⭐" />
              <input type="text" value={newIcon} onChange={(e) => setNewIcon(e.target.value)} maxLength={2}
                className="w-12 px-2 py-1.5 border border-slate-700/50 rounded-lg text-xs text-center bg-slate-900/40 text-slate-400 focus:border-cyan-400/50 focus:outline-none" />
              <button onClick={() => {
                  if (!newName.trim()) return
                  onAddTemplate?.({ name: newName.trim(), cost: newCost, icon: newIcon })
                  setNewName(''); setNewCost(10); setNewIcon('🎁')
                }}
                disabled={!newName.trim()}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                添加
              </button>
            </div>
          </div>
        </div>

        {/* 兑换记录 */}
        <div className="bg-slate-800/50 border border-slate-700/35 rounded-xl px-5 py-4 border-t-2 border-t-green-400/30">
          <div className="flex items-center justify-between mb-3">
            <h4 className="section-title text-slate-200" style={{margin:0}}><span>📋</span> 兑换记录</h4>
            <span className="text-xs text-slate-600">共 {records?.length || 0} 次</span>
          </div>
          <div className="flex flex-col gap-1">
            {records && records.length > 0 ? (
              records.slice(0, 10).map((r) => (
                <div key={r.id} className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-slate-900/30 text-sm">
                  <span className="flex-1 text-slate-300">{r.name}</span>
                  <span className="text-red-400 font-bold text-xs">-⭐{r.cost}</span>
                  <span className="text-slate-500 text-[11px]">{relativeTime(r.created_at)}</span>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-600 text-sm py-6">暂无兑换记录</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
