import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useChild } from '../hooks/useChild.js'

import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'
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


const AVATARS = ['🐱', '🐶', '🐰', '🐼', '🦊', '🐸', '🐵', '🦁']

export default function ParentDashboard() {
  const { user } = useAuth()
  const { activeChild, childrenList, fetchChildren, removeChild } = useChild()
  const navigate = useNavigate()
  const [selectedChildId, setSelectedChildId] = useState(null)
  const [tab, setTab] = useState('stats') // 'stats' | 'unlock' | 'rewards'

  useEffect(() => {
    fetchChildren()
  }, [fetchChildren])

  // 默认选中第一个孩子
  const childList = childrenList || []
  const currentChildId = selectedChildId || (childList.length > 0 ? childList[0].child_id : null)

  const handleBack = () => {
    navigate('/select-child')
  }



  return (
    <div className="bg-[#0a0e1a] min-h-screen flex items-start justify-center p-3 sm:p-5">
      <div className="w-full max-w-[1280px]">
        {/* 顶部栏 */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900/85 backdrop-blur-md border-b border-slate-700/50 rounded-t-xl">
          <button onClick={handleBack} className="text-slate-400 text-sm font-medium hover:text-slate-200 transition-colors">
            ← 返回
          </button>
          <h1 className="text-base font-bold text-slate-100">👨‍👩‍👧 家长管理</h1>
          <span className="w-[60px]" />
        </div>

        <div className="flex gap-5 p-5 bg-slate-900 border border-slate-700/30 border-t-0 rounded-b-xl min-h-[600px]">
        {/* ===== 左侧边栏 ===== */}
        <div className="w-52 shrink-0 flex flex-col gap-1">
          {/* 孩子列表 */}
          <div className="flex-1 space-y-1">

            {childList.length === 0 ? (
              <p className="text-slate-500 text-sm">暂无孩子</p>
            ) : (
              childList.map((c) => {
                const isActive = c.child_id === currentChildId
                return (
                  <div
                    key={c.child_id}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all border cursor-pointer
                      ${isActive
                        ? 'bg-gradient-to-r from-cyan-500/10 to-transparent border-cyan-500/30 text-slate-100'
                        : 'border-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                      }`}
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0" onClick={() => setSelectedChildId(c.child_id)}>
                      <span className="w-9 h-9 rounded-full flex items-center justify-center text-lg bg-gradient-to-br from-slate-700 to-slate-600 shrink-0">
                        {AVATARS[parseInt(c.avatar)] || '🐱'}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate font-semibold">{c.name}</div>
                        <div className="text-xs text-slate-500">⭐ {c.total_earned_stars || 0}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (window.confirm(`确定要删除孩子「${c.name}」吗？此操作不可恢复。`)) {
                          removeChild(c.child_id)
                        }
                      }}
                      className="w-6 h-6 rounded-full bg-slate-700/50 text-slate-500 hover:bg-red-500 hover:text-white flex items-center justify-center text-xs transition-all shrink-0"
                      title="删除此孩子"
                    >
                      ✕
                    </button>
                  </div>
                )
              })
            )}
          </div>


        </div>

        {/* ===== 右侧内容区 ===== */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* 标签栏 */}
          <div className="flex border-b border-slate-700 mb-5">
            <button
              key="stats-tab"
              onClick={() => setTab('stats')}
              className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-all duration-200
                ${tab === 'stats'
                  ? 'text-cyan-400 border-b-cyan-400'
                  : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
              📊 学习统计
            </button>
            <button
              key="unlock-tab"
              onClick={() => setTab('unlock')}
              className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-all duration-200
                ${tab === 'unlock'
                  ? 'text-cyan-400 border-b-cyan-400'
                  : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
              🔓 单词解锁
            </button>
            <button
              key="rewards-tab"
              onClick={() => setTab('rewards')}
              className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-all duration-200
                ${tab === 'rewards'
                  ? 'text-cyan-400 border-b-cyan-400'
                  : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
              🎁 学习奖励
            </button>
          </div>

          {/* 标签内容 — 带切换动效 */}
          <div key={tab} className="page-enter">
            {tab === 'unlock' && <UnlockPanel key={currentChildId} childId={currentChildId} />}
            {tab === 'rewards' && <RewardsPanel key={currentChildId} childId={currentChildId} />}
            {tab === 'stats' && <StatsPanel key={currentChildId} childId={currentChildId} />}
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

/* ===== 科目标签选择器 ===== */
function SubjectTabs({ subject, onChange }) {
  const subjects = getSubjectList()
  return (
    <div className="flex gap-1 mb-4">
      {subjects.map((s) => (
        <button
          key={s.id}
          onClick={() => onChange(s.id)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
            ${subject === s.id
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-500 hover:text-slate-300 border border-transparent'}`}
        >
          {s.icon} {s.name}
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
    await upsertLearningState(user.id, childId, { unlocked_words: next }, subject, 3)
  }
  const toggleAll = async (wordIds, allUnlocked) => {
    const next = allUnlocked ? unlocked.filter((id) => !wordIds.includes(id)) : [...new Set([...unlocked, ...wordIds])]
    setUnlocked(next)
    await upsertLearningState(user.id, childId, { unlocked_words: next }, subject, 3)
  }
  if (!childId) return <p className="text-slate-400 text-center py-8">请先在左侧选择一个孩子</p>
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-block px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 text-xs font-semibold">
          🔤 英语
        </span>
        <span className="text-xs text-slate-500">单词解锁仅英语闯关/记忆需要</span>
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
  if (!childId) return <p className="text-slate-400 text-center py-8">请先在左侧选择一个孩子</p>
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
  const [subject, setSubject] = useState('english')
  useEffect(() => {
    if (!user || !childId) return
    setLoading(true)
    getAggregatedStats(user.id, childId, subject, 3).then(({ data }) => { setStats(data); setLoading(false) })
  }, [user, childId, subject])
  if (!childId) return <p className="text-slate-400 text-center py-8">请先在左侧选择一个孩子</p>
  return (
    <div>
      <SubjectTabs subject={subject} onChange={setSubject} />
      {loading ? <LoadingSpinner /> : stats ? (
        <div className="space-y-4">
          <OverviewCards stats={stats} />
          <AccuracyChart dailyStats={stats.dailyStats} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ErrorRanking errorRanking={stats.errorRanking} subject={subject} />
            <UnitProgress wordProgress={stats.wordProgress} subject={subject} />
          </div>
        </div>
      ) : (
        <p className="text-slate-400 text-center py-8">暂无统计数据</p>
      )}
    </div>
  )
}
