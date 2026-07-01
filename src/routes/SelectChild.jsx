import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useChild } from '../hooks/useChild.js'
import { useGameTheme } from '../context/GameThemeContext.jsx'
import ChildCard from '../components/child/ChildCard.jsx'
import ChildForm from '../components/child/ChildForm.jsx'
import Modal from '../components/ui/Modal.jsx'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'
import Button from '../components/ui/Button.jsx'
import PageShell from '../components/ui/PageShell.jsx'
import StarRain from '../components/ui/StarRain.jsx'

export default function SelectChild() {
  const { user, logout } = useAuth()
  const { childrenList, activeChild, loading, addChild, selectChild } = useChild()
  const { gameTheme } = useGameTheme()
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
    <PageShell className={gameTheme.pattern}>
      <StarRain count={25} />
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-3.5rem)] p-4">
        <div className="w-full max-w-lg page-enter">

          {/* 标题区 */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-black text-white">
              选择小伙伴
            </h1>
            <p className="text-sm text-white/80 mt-1">选一个开始学习之旅</p>
          </div>

          {/* 孩子列表 */}
          {loading ? (
            <LoadingSpinner />
          ) : childrenList.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
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
            <div className="text-center py-10 border border-white/20 rounded-xl mb-6">
              <p className="text-white font-bold">还没有小伙伴</p>
              <p className="text-white/80 text-sm mt-1">添加一个孩子开始吧</p>
            </div>
          )}

          {/* 添加孩子 — 主操作 */}
          <Button
            variant="primary"
            size="lg"
            onClick={() => setShowAddForm(true)}
            className="w-full mb-4"
          >
            + 添加孩子
          </Button>

          {/* 辅助操作 */}
          <div className="flex items-center justify-center gap-4 pt-1">
              <button onClick={handleParentAccess}
                className="text-sm font-medium text-white/75 hover:text-white transition-colors">
                家长管理
              </button>
              <span className="text-white/40">|</span>
              <button onClick={handleLogout}
                className="text-sm font-medium text-white/75 hover:text-red-200 transition-colors">
                退出登录
              </button>
          </div>
        </div>
      </div>

      <Modal isOpen={showAddForm} onClose={() => setShowAddForm(false)} title="添加孩子">
        <ChildForm
          onSubmit={handleAddChild}
          onCancel={() => setShowAddForm(false)}
        />
      </Modal>
    </PageShell>
  )
}
