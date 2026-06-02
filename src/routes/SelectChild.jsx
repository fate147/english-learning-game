import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useChild } from '../hooks/useChild.js'
import ChildCard from '../components/child/ChildCard.jsx'
import ChildForm from '../components/child/ChildForm.jsx'
import Modal from '../components/ui/Modal.jsx'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'
import PageShell from '../components/ui/PageShell.jsx'
import Card from '../components/ui/Card.jsx'

export default function SelectChild() {
  const { user, logout } = useAuth()
  const { childrenList, activeChild, loading, addChild, selectChild } = useChild()
  const navigate = useNavigate()
  const [showAddForm, setShowAddForm] = useState(false)

  // fetchChildren 由 ChildContext 内部自动调用，此处不再重复

  const handleSelect = (child) => {
    selectChild(child)
    // 选孩子时立即缓存星星数据 + 最后选的孩子 ID
    // 下次启动时 StarContext 可以直接从缓存恢复主题色，无需等待服务器
    try {
      localStorage.setItem('eng_last_child_id', child.child_id)
      localStorage.setItem('eng_stars_' + child.child_id, JSON.stringify({
        total_earned_stars: child.total_earned_stars || 0,
        available_stars: child.available_stars || 0,
      }))
    } catch {}
    navigate('/game')
  }

  const handleAddChild = async (childId, name, avatar) => {
    const { error } = await addChild(childId, name, avatar)
    if (!error) setShowAddForm(false)
    return { error }
  }

  const handleParentAccess = () => {
    // 进家长面板前先选中第一个孩子
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
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <Card className="w-full max-w-lg mx-auto page-enter">

          {/* 孩子列表 */}
          {loading ? (
            <LoadingSpinner />
          ) : childrenList.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 mb-6">
              {childrenList.map((child) => (
                <ChildCard
                  key={child.child_id}
                  child={child}
                  isActive={activeChild?.child_id === child.child_id}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-2">📝</div>
              <p>还没有添加孩子，点击下方添加</p>
            </div>
          )}

          {/* 添加孩子按钮 */}
          <div className="space-y-3">
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-500
                         font-bold hover:border-[var(--theme-color)] hover:text-[var(--theme-color-dark)]
                         transition-all"
            >
              + 添加孩子
            </button>

            <div className="flex gap-3 pt-2">
              <button onClick={handleParentAccess}
                className="flex-1 py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >家长管理</button>
              <button onClick={handleLogout}
                className="flex-1 py-2 text-sm text-gray-400 hover:text-red-500 transition-colors"
              >退出登录</button>
            </div>
          </div>
        </Card>
      </div>

      {/* 添加孩子弹窗 — 在 Card 外部，避免嵌套定位问题 */}
      <Modal isOpen={showAddForm} onClose={() => setShowAddForm(false)} title="添加孩子">
        <ChildForm
          onSubmit={handleAddChild}
          onCancel={() => setShowAddForm(false)}
        />
      </Modal>

    </PageShell>
  )
}
