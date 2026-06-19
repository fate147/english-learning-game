import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useChild } from '../hooks/useChild.js'

import Skeleton from '../components/ui/Skeleton.jsx'
import PageShell from '../components/ui/PageShell.jsx'

import UnitTree from '../components/parent/UnitTree.jsx'
import RewardRecord from '../components/parent/RewardRecord.jsx'
import OverviewCards from '../components/stats/OverviewCards.jsx'
import AccuracyChart from '../components/stats/AccuracyChart.jsx'
import ErrorRanking from '../components/stats/ErrorRanking.jsx'
import UnitProgress from '../components/stats/UnitProgress.jsx'
import { getLearningState, upsertLearningState, getWordProgress } from '../lib/game.js'
import { getRewardTemplates, createRewardTemplate, deleteRewardTemplate, getRewardRecords, addRewardRecord } from '../lib/rewards.js'
import { getStars, spendStars } from '../lib/stars.js'
import { getAggregatedStats } from '../lib/stats.js'
import { DEFAULT_REWARD_TEMPLATES } from '../config/rewards.js'
import { SUBJECTS, getSubjectList } from '../config/subjects.js'

import { AVATARS } from '../config/avatars.js'

export default function ParentDashboard() {
  const { user } = useAuth()
  const { activeChild, childrenList, fetchChildren, removeChild } = useChild()
  const navigate = useNavigate()
  const [selectedChildId, setSelectedChildId] = useState(null)
  const [tab, setTab] = useState('stats') // 'stats' | 'unlock' | 'rewards'
  const [confirmDialog, setConfirmDialog] = useState(null) // { title, message, onConfirm }

  useEffect(() => {
    fetchChildren()
  }, [fetchChildren])

  // 默认选中第一个孩子
  const childList = childrenList || []
  const currentChildId = selectedChildId || (childList.length > 0 ? childList[0].child_id : null)

  const handleBack = () => {
    navigate('/select-child')
  }



  // 当前选中的孩子对象
  const currentChild = childList.find((c) => c.child_id === currentChildId)

  return (
    <div className="min-h-screen parent-bg flex items-start justify-center p-3 sm:p-5">
      <div className="w-full max-w-[1280px] bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl">

        {/* ===== 顶部栏 ===== */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-white/[0.04] border-b border-white/10">
          <button onClick={handleBack} className="flex items-center gap-1.5 text-white/60 text-sm font-medium hover:text-white/90 transition-colors">
            <span className="text-lg">←</span> 返回
          </button>
          <div className="flex items-center gap-2.5">
            <img src="images/dragon_happy.png" alt="小龙"
              className="w-8 h-8 rounded-full object-contain"
              onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.textContent = '🐉' }} />
            <h1 className="text-base font-bold text-white">家长管理</h1>
          </div>
          {currentChild && (
            <div className="flex items-center gap-2 bg-white/8 rounded-full px-3 py-1.5">
              <span className="text-lg">{AVATARS[parseInt(currentChild.avatar)] || '🐱'}</span>
              <span className="text-sm font-bold text-white">⭐ {currentChild.total_earned_stars || 0}</span>
            </div>
          )}
          {!currentChild && <span className="w-20" />}
        </div>

        <div className="p-4 sm:p-5">

          {/* ===== 孩子选择卡片行 ===== */}
          {childList.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-4 pt-1 mb-4 scrollbar-hide">
              {childList.map((c) => {
                const isActive = c.child_id === currentChildId
                return (
                  <div key={c.child_id} className="relative group shrink-0">
                    <button
                      onClick={() => setSelectedChildId(c.child_id)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 border-2 min-w-[130px]
                        ${isActive
                          ? 'bg-white/10 border-emerald-400/60 text-white shadow-lg shadow-emerald-500/10 -translate-y-0.5'
                          : 'bg-white/[0.04] border-white/10 text-white/60 hover:bg-white/[0.08] hover:border-white/20'
                        }`}
                    >
                      <span className={`w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0
                        ${isActive ? 'bg-emerald-500/20' : 'bg-white/10'}`}>
                        {AVATARS[parseInt(c.avatar)] || '🐱'}
                      </span>
                      <div className="text-left min-w-0">
                        <div className={`font-bold truncate text-xs ${isActive ? 'text-white' : 'text-white/80'}`}>{c.name}</div>
                        <div className="text-[10px] text-white/40">⭐ {c.total_earned_stars || 0}</div>
                      </div>
                      <span
                        onClick={(e) => {
                          e.stopPropagation()
                          setConfirmDialog({
                            title: '删除孩子',
                            message: `确定要删除孩子「${c.name}」吗？此操作不可恢复。`,
                            onConfirm: () => removeChild(c.child_id),
                          })
                        }}
                        className="w-5 h-5 rounded text-[10px] flex items-center justify-center shrink-0
                                   text-white/20 hover:bg-red-500/20 hover:text-red-400 transition-all
                                   opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="删除此孩子"
                      >🗑</span>
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* ===== Tab 栏 ===== */}
          <div className="flex gap-1 mb-5 p-1 bg-white/[0.04] rounded-xl">
            {[
              { key: 'stats', icon: '📊', label: '学习统计' },
              { key: 'unlock', icon: '🔓', label: '单词解锁' },
              { key: 'rewards', icon: '🎁', label: '学习奖励' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200
                  ${tab === t.key
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                  }`}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* ===== 标签内容 ===== */}
          <div key={tab} className="page-enter">
            {tab === 'unlock' && <UnlockPanel key={currentChildId} childId={currentChildId} />}
            {tab === 'rewards' && <RewardsPanel key={currentChildId} childId={currentChildId} />}
            {tab === 'stats' && <StatsPanel key={currentChildId} childId={currentChildId} />}
          </div>
        </div>
      </div>

      {/* 确认弹窗 */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white/[0.08] backdrop-blur-md border border-white/15 rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-6 scale-in">
            <h3 className="text-lg font-bold text-white mb-2">{confirmDialog.title}</h3>
            <p className="text-sm text-white/50 mb-6">{confirmDialog.message}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white/50 hover:text-white/80 hover:bg-white/10 transition-all"
              >
                取消
              </button>
              <button
                onClick={() => { confirmDialog.onConfirm(); setConfirmDialog(null) }}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-red-500/80 text-white hover:bg-red-500 transition-all"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ===== 科目标签选择器 ===== */
function SubjectTabs({ subject, onChange }) {
  const subjects = getSubjectList()
  return (
    <div className="flex gap-1 p-1 bg-white/[0.04] rounded-xl mb-4">
      {subjects.map((s) => (
        <button
          key={s.id}
          onClick={() => onChange(s.id)}
          className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200
            ${subject === s.id
              ? 'bg-white/10 text-white shadow-sm'
              : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'}`}
        >
          <span>{s.icon}</span>
          <span>{s.name}</span>
        </button>
      ))}
    </div>
  )
}

/* ===== 单词解锁面板 ===== */
function UnlockPanel({ childId }) {
  const { user } = useAuth()
  const [unlocked, setUnlocked] = useState([])
  const [progress, setProgress] = useState({})
  const subject = 'english'
  useEffect(() => {
    if (!user || !childId) return
    // 先读 localStorage 缓存，再从 Supabase 更新
    const cacheKey = subject + '_g3_learning_state_' + childId
    try {
      const raw = localStorage.getItem(cacheKey)
      if (raw) {
        const cached = JSON.parse(raw)
        if (cached?.unlockedWords?.length) setUnlocked(cached.unlockedWords)
      }
    } catch {}
    Promise.all([getLearningState(user.id, childId, subject, 3), getWordProgress(user.id, childId, subject, 3)]).then(([s, wp]) => {
      if (s.data?.unlocked_words) setUnlocked(s.data.unlocked_words)
      const map = {}
      if (wp.data) wp.data.forEach((w) => { map[w.word_id] = w })
      setProgress(map)
    })
  }, [user, childId])
  const toggle = async (wordId) => {
    const next = unlocked.includes(wordId) ? unlocked.filter((id) => id !== wordId) : [...unlocked, wordId]
    setUnlocked(next)
    try { localStorage.setItem(subject + '_g3_learning_state_' + childId, JSON.stringify({ unlockedWords: next })) } catch {}
    await upsertLearningState(user.id, childId, { unlocked_words: next }, subject, 3)
  }
  const toggleAll = async (wordIds, allUnlocked) => {
    const next = allUnlocked ? unlocked.filter((id) => !wordIds.includes(id)) : [...new Set([...unlocked, ...wordIds])]
    setUnlocked(next)
    try { localStorage.setItem(subject + '_g3_learning_state_' + childId, JSON.stringify({ unlockedWords: next })) } catch {}
    await upsertLearningState(user.id, childId, { unlocked_words: next }, subject, 3)
  }
  if (!childId) return <p className="text-white/40 text-center py-8">请先选择一个孩子</p>
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-block px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-semibold">
          🔤 英语
        </span>
        <span className="text-xs text-white/35">单词解锁仅英语闯关/记忆需要</span>
      </div>
      <UnitTree unlockedWords={unlocked} wordProgress={progress} onToggleWord={toggle} onToggleAll={toggleAll} />
    </div>
  )
}

/* ===== 奖励面板 ===== */
function RewardsPanel({ childId }) {
  const { user } = useAuth()
  const [templates, setTemplates] = useState([])
  const [records, setRecords] = useState([])
  const [stars, setStars] = useState(0)
  useEffect(() => {
    if (!user || !childId) return
    Promise.all([getRewardTemplates(user.id, childId), getRewardRecords(user.id, childId), getStars(user.id, childId)])
      .then(async ([t, r, s]) => {
        let tmpls = t.data || []
        if (tmpls.length === 0) {
          for (const d of DEFAULT_REWARD_TEMPLATES) {
            const { data } = await createRewardTemplate(user.id, childId, d)
            if (data) tmpls.push(data)
          }
        }
        setTemplates(tmpls)
        if (r.data) setRecords(r.data)
        if (s.data) setStars(s.data.available_stars)
      })
  }, [user, childId])
  const redeem = async (tmpl) => {
    const { error } = await spendStars(user.id, childId, tmpl.cost)
    if (error) return alert(error.message)
    setStars((s) => s - tmpl.cost)
    setRecords((prev) => [{ id: Date.now().toString(), name: tmpl.name, cost: tmpl.cost, created_at: new Date().toISOString() }, ...prev])
    addRewardRecord(user.id, childId, tmpl.id, tmpl.name, tmpl.cost)
  }
  const handleDeleteTemplate = async (templateId) => {
    const { error } = await deleteRewardTemplate(user.id, childId, templateId)
    if (error) return alert(error.message)
    setTemplates((prev) => prev.filter((t) => t.id !== templateId))
  }
  if (!childId) return <p className="text-white/40 text-center py-8">请先选择一个孩子</p>
  return (
    <div className="space-y-5">
      <RewardRecord
        templates={templates}
        onRedeem={redeem}
        availableStars={stars}
        records={records}
        onAddTemplate={(t) => createRewardTemplate(user.id, childId, t).then(({ data }) => data && setTemplates((p) => [...p, data]))}
        onDeleteTemplate={handleDeleteTemplate}
      />
    </div>
  )
}

/* ===== 统计面板 ===== */
function StatsPanel({ childId }) {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [subject, setSubject] = useState('english')
  const grade = 3

  const fetchStats = () => {
    if (!user || !childId) return
    setLoading(true)
    setError(null)
    getAggregatedStats(user.id, childId, subject, grade).then(({ data, error: err }) => {
      if (err) {
        setError(err.message || '加载统计数据失败')
        setStats(null)
      } else {
        setStats(data)
      }
      setLoading(false)
    }).catch((err) => {
      setError(err.message || '网络错误，请检查连接')
      setLoading(false)
    })
  }

  useEffect(() => { fetchStats() }, [user, childId, subject, grade])

  if (!childId) return <p className="text-white/40 text-center py-8">请先选择一个孩子</p>

  const emptyStats = stats ? stats : { totalSessions: 0, totalCorrect: 0, totalWrong: 0, totalAnswered: 0, accuracy: 0, totalEarnedStars: 0, dailyStats: {}, errorRanking: [], wordProgress: {} }
  return (
    <div>
      <SubjectTabs subject={subject} onChange={setSubject} />
      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} variant="card" className="h-24" />
            ))}
          </div>
          <Skeleton variant="card" className="h-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton variant="card" className="h-40" />
            <Skeleton variant="card" className="h-40" />
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-white/60 text-sm mb-4">{error}</p>
          <button onClick={fetchStats}
            className="px-5 py-2 rounded-xl bg-white/15 text-white text-sm font-bold hover:bg-white/25 transition-all">
            重试
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <OverviewCards stats={emptyStats} />
          <AccuracyChart dailyStats={emptyStats.dailyStats} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ErrorRanking errorRanking={emptyStats.errorRanking} subject={subject} />
            <UnitProgress wordProgress={emptyStats.wordProgress} subject={subject} />
          </div>
        </div>
      )}
    </div>
  )
}
