import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth.js'
import { useChild } from '../../hooks/useChild.js'
import { verifyParentPassword, setParentPassword } from '../../lib/child.js'
import { PARENT_SESSION_DURATION_MS } from '../../config/index.js'

const PARENT_SESSION_KEY = 'parent_session_'

export function isParentSessionValid(childId) {
  try {
    const raw = localStorage.getItem(PARENT_SESSION_KEY + childId)
    if (!raw) return false
    const session = JSON.parse(raw)
    return Date.now() - session.timestamp < PARENT_SESSION_DURATION_MS
  } catch {
    return false
  }
}

export function setParentSession(childId) {
  localStorage.setItem(
    PARENT_SESSION_KEY + childId,
    JSON.stringify({ timestamp: Date.now(), childId })
  )
}

export default function PasswordGate({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth()
  const { activeChild } = useChild()
  const [mode, setMode] = useState('verify') // 'verify' | 'setup'
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setPassword('')
    setConfirmPw('')
    setError('')
    setMode('verify')
  }, [isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user || !activeChild) return
    setLoading(true)
    setError('')

    // setup / reset: 设置新密码
    if (mode === 'setup' || mode === 'forgot') {
      if (!password.trim() || password.length < 4) {
        setError('密码至少4位')
        setLoading(false)
        return
      }
      if (password !== confirmPw) {
        setError('两次密码输入不一致')
        setLoading(false)
        return
      }
      const { error: err } = await setParentPassword(user.id, activeChild.child_id, password)
      if (err) {
        setError(err.message || '设置失败')
        setLoading(false)
        return
      }
      setParentSession(activeChild.child_id)
      setLoading(false)
      onSuccess?.()
      return
    }

    // verify mode
    if (!password.trim()) {
      setError('请输入密码')
      setLoading(false)
      return
    }
    const { data: isValid, error: err } = await verifyParentPassword(user.id, activeChild.child_id, password)
    if (err?.message === '未设置家长密码') {
      setMode('setup')
      setPassword('')
      setError('请先设置家长密码')
      setLoading(false)
      return
    }
    if (err || !isValid) {
      setError('密码错误，请重试')
      setLoading(false)
      return
    }
    setParentSession(activeChild.child_id)
    setLoading(false)
    onSuccess?.()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 overlay-in">
      <div className="bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 scale-in border border-slate-700">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">{mode === 'forgot' ? '🔑' : '🔒'}</div>
          <h2 className="text-xl font-bold text-slate-100">家长管理</h2>
          <p className="text-sm text-slate-400 mt-1">
            {mode === 'setup' ? '首次使用，请设置家长密码' : mode === 'forgot' ? '已通过邮箱验证，请设置新密码' : '请输入家长密码'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError('') }}
            placeholder={mode === 'verify' ? '输入家长密码' : '新密码（至少4位）'}
            autoFocus
            className="w-full px-4 py-3 border-2 border-slate-600 rounded-xl text-center text-lg text-slate-100 bg-slate-700
                       focus:border-[var(--theme-color)] focus:outline-none transition-colors placeholder-slate-400"
          />
          {mode !== 'verify' && (
            <input
              type="password"
              value={confirmPw}
              onChange={(e) => { setConfirmPw(e.target.value); setError('') }}
              placeholder="再次输入密码"
              className="w-full px-4 py-3 border-2 border-slate-600 rounded-xl text-center text-lg text-slate-100 bg-slate-700
                         focus:border-[var(--theme-color)] focus:outline-none transition-colors placeholder-slate-400"
            />
          )}
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border-2 border-slate-600 text-slate-300 font-bold hover:bg-slate-700 transition-colors"
            >取消</button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 rounded-xl bg-[var(--theme-color)] text-white font-bold hover:brightness-110 disabled:opacity-50 transition-all"
            >{loading ? '处理中...' : mode === 'verify' ? '确认' : '设置密码'}</button>
          </div>

          {/* 忘记密码 — 仅 verify 模式显示 */}
          {mode === 'verify' && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => { setMode('forgot'); setPassword(''); setConfirmPw(''); setError('') }}
                className="text-sm text-slate-400 hover:text-[var(--theme-color)] transition-colors"
              >
                忘记密码？通过邮箱重置
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
