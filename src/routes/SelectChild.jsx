import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useChild } from '../hooks/useChild.js'
import ChildCard from '../components/child/ChildCard.jsx'
import ChildForm from '../components/child/ChildForm.jsx'
import Modal from '../components/ui/Modal.jsx'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'
import Button from '../components/ui/Button.jsx'
import PageShell from '../components/ui/PageShell.jsx'

export default function SelectChild() {
  const { user, logout } = useAuth()
  const { childrenList, activeChild, loading, addChild, selectChild } = useChild()
  const navigate = useNavigate()
  const [showAddForm, setShowAddForm] = useState(false)

  const handleSelect = (child) => {
    selectChild(child)
    try {
      localStorage.setItem('app_last_child_id', child.child_id)
      localStorage.setItem('app_stars_' + child.child_id, JSON.stringify({
        total_earned_stars: child.total_earned_stars || 0,
        available_stars: child.available_stars || 0,
      }))
    } catch {}
    navigate('/home')
  }

  const handleAddChild = async (childId, name, avatar) => {
    const { error } = await addChild(childId, name, avatar)
    if (!error) setShowAddForm(false)
    return { error }
  }

  const handleParentAccess = () => {
    if (!activeChild && childrenList.length > 0) {
      selectChild(childrenList[0])
    }
    navigate('/parent')
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <PageShell>
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] p-4">
        <div className="w-full max-w-lg page-enter">

          {/* 标题区 */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-black text-white" style={{textShadow: '0 2px 8px rgba(0,0,0,0.2)'}}>
              选择小伙伴
            </h1>
            <p className="text-sm text-white/55 mt-1">选一个开始学习之旅</p>
          </div>

          {/* 孩子列表 */}
          {loading ? (
            <LoadingSpinner />
          ) : childrenList.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 mb-6">
              {childrenList.map((child, idx) => (
                <div key={child.child_id} className="fade-slide-enter" style={{animationDelay: `${idx * 0.06}s`}}>
                  <ChildCard
                    child={child}
                    isActive={activeChild?.child_id === child.child_id}
                    onSelect={handleSelect}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 glass-card !rounded-2xl mb-6">
              <div className="text-5xl mb-3">👋</div>
              <p className="text-white/70 font-bold">还没有小伙伴</p>
              <p className="text-white/45 text-sm mt-1">添加一个孩子开始吧</p>
            </div>
          )}

          {/* 添加孩子 — 主操作 */}
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setShowAddForm(true)}
            className="w-full border-dashed mb-4 !text-white/65 hover:!text-white/85"
          >
            + 添加孩子
          </Button>

          {/* 辅助操作 — 视觉分离 */}
          <div className="flex items-center justify-center gap-6 pt-1">
            <Button variant="ghost" size="sm" onClick={handleParentAccess}>
              <span>👨‍👩‍👧</span>
              <span>家长管理</span>
            </Button>
            <span className="text-white/15">|</span>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="hover:!text-red-300">
              <span>🚪</span>
              <span>退出登录</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 添加孩子弹窗 */}
      <Modal isOpen={showAddForm} onClose={() => setShowAddForm(false)} title="添加孩子">
        <ChildForm
          onSubmit={handleAddChild}
          onCancel={() => setShowAddForm(false)}
        />
      </Modal>
    </PageShell>
  )
}
