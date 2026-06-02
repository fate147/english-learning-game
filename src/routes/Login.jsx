import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { translateError } from '../lib/errors.js'
import { STRINGS } from '../config/strings.js'
import PageShell from '../components/ui/PageShell.jsx'
import Card from '../components/ui/Card.jsx'

export default function Login() {
  const { user, loading: authLoading, login, register } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // 已登录则跳转（用 useEffect 避免 render 中导航）
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/select-child', { replace: true })
    }
  }, [user, authLoading, navigate])

  if (authLoading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-4 border-white/50 border-t-white rounded-full animate-spin" />
        </div>
      </PageShell>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('请输入邮箱和密码')
      return
    }

    setSubmitting(true)
    setError('')

    const { error: err } = isRegister
      ? await register(email, password)
      : await login(email, password)

    setSubmitting(false)

    if (err) {
      setError(translateError(err))
    } else if (isRegister) {
      // 注册成功后导航由 useEffect 处理
    }
  }

  return (
    <PageShell>
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <div className="w-full max-w-sm space-y-8">
          {/* 标题 */}
          <div className="text-center page-enter">
            <div className="text-6xl mb-4">📚</div>
            <h1 className="text-3xl font-bold text-white">{STRINGS.app.name}</h1>
            <p className="text-white/70 mt-2">登录后开始学习</p>
          </div>

          {/* 表单 */}
          <Card className="page-enter">
            <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">邮箱</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base
                           focus:border-[var(--theme-color)] focus:outline-none transition-colors"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="输入密码"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base
                           focus:border-[var(--theme-color)] focus:outline-none transition-colors"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3 rounded-xl font-bold text-lg transition-all disabled:opacity-50
                ${isRegister
                  ? 'bg-white border-2 border-[var(--theme-color)] text-[var(--theme-color-dark)] hover:bg-gray-50'
                  : 'bg-[var(--theme-color)] text-white hover:brightness-110'
                }`}
            >
              {submitting ? '处理中...' : isRegister ? '注册' : '登录'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => { setIsRegister(!isRegister); setError('') }}
                className="text-sm text-[var(--theme-color-dark)] hover:underline"
              >
                {isRegister ? '已有账号？登录' : '没有账号？注册'}
              </button>
            </div>
          </form>
          </Card>
        </div>
      </div>
    </PageShell>
  )
}
