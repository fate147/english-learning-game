import { useState, useEffect, useRef } from 'react'
import { useRewardsState } from '../../hooks/useRewardsState.js'
import { useToast } from '../ui/Toast.jsx'
import EmptyState from '../ui/EmptyState.jsx'

const ICON_OPTIONS = ['🎁', '🎮', '📚', '🎨', '🍰', '🧸', '🎪', '🎠', '🏖️', '🎬', '📱', '⭐', '🏆', '🎵', '🚀', '🌈']

function relativeTime(dateStr) {
  if (!dateStr) return ''
  try {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}分钟前`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}小时前`
    const days = Math.floor(hrs / 24)
    return `${days}天前`
  } catch { return '' }
}

export default function RewardsPanel({ childId }) {
  const { templates, records, stars, loading, error, fetch, redeem, addTemplate, deleteTemplate } = useRewardsState()
  const toast = useToast()
  const fetchedRef = useRef(false)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCost, setNewCost] = useState(10)
  const [newIcon, setNewIcon] = useState('🎁')

  useEffect(() => {
    if (!childId || fetchedRef.current) return
    fetchedRef.current = true
    fetch(childId)
  }, [childId])

  if (!childId) return <EmptyState variant="star" text="请先选择一个孩子" />

  if (loading && !fetchedRef.current) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl p-4" style={{ background: '#141414', border: '1px solid #2a2520' }}>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full mb-2" style={{ background: '#1f1f1f' }} />
            <div className="h-6 w-16 rounded mb-1" style={{ background: '#1f1f1f' }} />
            <div className="h-2 w-12 rounded" style={{ background: '#1f1f1f' }} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1,2,3].map(i => (
            <div key={i} className="rounded-xl p-3" style={{ background: '#141414', border: '1px solid #2a2520' }}>
              <div className="h-5 w-10 mx-auto rounded mb-1" style={{ background: '#1f1f1f' }} />
              <div className="h-2 w-8 mx-auto rounded" style={{ background: '#1f1f1f' }} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-[#a39880] mb-4">{error}</p>
        <button onClick={() => { fetchedRef.current = false; fetch(childId) }}
          className="px-4 py-2 rounded-lg text-xs font-bold" style={{ background: '#d4a574', color: '#0a0a0a' }}>
          重试
        </button>
      </div>
    )
  }

  const recentCount = Array.isArray(records)
    ? records.filter(r => {
        try {
          const d = new Date(r.created_at)
          const now = new Date()
          return d > new Date(now.setDate(now.getDate() - 3))
        } catch { return false }
      }).length
    : 0

  const handleAdd = async () => {
    if (!newName.trim()) return
    await addTemplate(childId, { name: newName.trim(), icon: newIcon, cost: newCost })
    setNewName('')
    setNewCost(10)
    setNewIcon('🎁')
    setShowAdd(false)
    toast('奖励模板已添加')
  }

  const handleDelete = async (t) => {
    if (!confirm(`确认删除「${t.name}」？`)) return
    await deleteTemplate(childId, t.id)
    toast('已删除')
  }

  return (
    <div className="space-y-3">
      {/* 星星数量卡片 */}
      <div className="rounded-xl p-4 text-center" style={{ background: '#141414', border: '1px solid #2a2520' }}>
        <div className="text-3xl mb-1">⭐</div>
        <div className="text-2xl font-bold text-[#d4a574]">{stars}</div>
        <div className="text-[11px] text-[#8a7d6f] mt-0.5">可用星星</div>
      </div>

      {/* 统计 */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl p-3 text-center" style={{ background: '#141414', border: '1px solid #2a2520' }}>
          <p className="text-xl font-bold tabular-nums leading-none text-[#d4a574]">{templates?.length || 0}</p>
          <p className="text-[11px] font-semibold text-[#8a7d6f] mt-0.5">奖励模板</p>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: '#141414', border: '1px solid #2a2520' }}>
          <p className="text-xl font-bold tabular-nums leading-none text-[#d4a574]">{records?.length || 0}</p>
          <p className="text-[11px] font-semibold text-[#8a7d6f] mt-0.5">已兑换</p>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: '#141414', border: '1px solid #2a2520' }}>
          <p className="text-xl font-bold tabular-nums leading-none text-[#d4a574]">★{records?.reduce((s, r) => s + (r.cost || 0), 0) || 0}</p>
          <p className="text-[11px] font-semibold text-[#8a7d6f] mt-0.5">累计消耗</p>
        </div>
      </div>

      {/* 添加奖励 */}
      {showAdd ? (
        <div className="rounded-xl p-4" style={{ background: '#141414', border: '1px solid #2a2520' }}>
          <div className="text-xs font-bold text-[#f5f0e8] mb-3">添加新奖励</div>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex gap-1 flex-wrap">
              {ICON_OPTIONS.map(ic => (
                <button key={ic} onClick={() => setNewIcon(ic)}
                  className="w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-all"
                  style={{ background: newIcon === ic ? '#2a2520' : '#1f1f1f', border: `1px solid ${newIcon === ic ? '#d4a574' : '#2a2520'}` }}>
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 mb-3">
            <input value={newName} onChange={(e) => setNewName(e.target.value)}
              placeholder="奖励名称" className="input flex-1" style={{ background: '#1f1f1f', color: '#f5f0e8', border: '1px solid #2a2520' }} />
            <input type="number" value={newCost} onChange={(e) => setNewCost(Math.max(1, parseInt(e.target.value) || 1))}
              className="input w-20" style={{ background: '#1f1f1f', color: '#f5f0e8', border: '1px solid #2a2520' }} />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="flex-1 py-2 rounded-lg text-xs font-bold" style={{ background: '#d4a574', color: '#0a0a0a' }}>
              添加
            </button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg text-xs font-bold" style={{ border: '1px solid #2a2520', color: '#a39880' }}>
              取消
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAdd(true)}
          className="w-full py-2.5 rounded-xl text-xs font-bold transition-all"
          style={{ background: '#1f1f1f', border: '1px solid #2a2520', color: '#d4a574' }}>
          + 添加奖励模板
        </button>
      )}

      {/* 奖励模板卡片 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-[#f5f0e8]">奖励模板</h3>
          <span className="text-[10px] font-medium text-[#8a7d6f]">{templates?.length || 0} 个</span>
        </div>
        {templates?.length === 0 ? (
          <div className="rounded-xl p-6 text-center" style={{ background: '#141414', border: '1px solid #2a2520' }}>
            <p className="text-[11px] text-[#8a7d6f]">暂无奖励模板</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {templates.map((t) => (
              <div key={t.id} className="rounded-xl p-3 text-center" style={{ background: '#141414', border: '1px solid #2a2520' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xl">{t.icon || '🎁'}</span>
                  <button onClick={() => handleDelete(t)}
                    className="w-5 h-5 rounded-full text-[10px] flex items-center justify-center transition-all hover:bg-red-400/20"
                    style={{ color: '#ef4444' }}>
                    ×
                  </button>
                </div>
                <div className="font-bold text-sm text-[#f5f0e8] mb-0.5 truncate">{t.name || ''}</div>
                <div className="text-xs font-semibold text-[#d4a574] mb-2">★ {t.cost || 10}</div>
                <button
                  onClick={async () => {
                    if (!confirm(`确认兑换「${t.name}」？`)) return
                    const err = await redeem(childId, t)
                    if (err) { toast(err, 'error'); return }
                    toast(`成功兑换「${t.name}」！`, 'success')
                  }}
                  disabled={stars < (t.cost || 10)}
                  className="w-full py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-40"
                  style={{ background: '#d4a574', color: '#0a0a0a' }}>
                  兑换
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 兑换记录 */}
      <div className="rounded-xl p-3" style={{ background: '#141414', border: '1px solid #2a2520' }}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-[#f5f0e8]">兑换记录</h3>
          <span className="text-[10px] font-medium text-[#8a7d6f]">共 {records?.length || 0} 次</span>
        </div>
        {records?.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-[11px] text-[#8a7d6f]">暂无兑换记录</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {records?.map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: '#1f1f1f' }}>
                <span className="text-lg">{r.icon || '🎁'}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-[#f5f0e8]">{r.name || ''}</span>
                </div>
                <span className="text-xs font-bold text-red-400 tabular-nums">-★{r.cost ?? 0}</span>
                <span className="text-[10px] font-medium text-[#8a7d6f] shrink-0">{relativeTime(r.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
