import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useGameTheme } from '../context/GameThemeContext.jsx'
import { translateError } from '../lib/errors.js'


export default function Login() {
  const { user, loading: authLoading, login, register } = useAuth()
  const { gameTheme } = useGameTheme()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/select-child', { replace: true })
    }
  }, [user, authLoading, navigate])

  if (authLoading) {
    return (
      <div className={`min-h-screen ${gameTheme.pattern} flex items-center justify-center`}>
        <div className="spinner spinner-lg" />
      </div>
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
    if (err) setError(translateError(err))
  }

  return (
    <div className={`min-h-screen ${gameTheme.pattern} flex items-center justify-center p-4 sm:p-6 relative overflow-hidden`}>

      <div className="w-full max-w-4xl flex flex-col lg:flex-row items-center gap-8 lg:gap-16 relative z-10">

        {/* 左侧 — 品牌视觉 */}
        <div className="flex-1 text-center lg:text-left page-enter">
          <div className="relative inline-block mb-6">
            <div className="login-mascot-ring">
              <div className="login-mascot-inner">
                <img
                  src="images/dragon_happy.png"
                  alt="小龙"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.classList.add('no-img') }}
                />
              </div>
            </div>
          </div>

          <h1 className="login-title">
            和小伙伴<br />一起学！
          </h1>
          <p className="login-subtitle" style={{ color: 'rgba(255,255,255,0.85)' }}>
            英语、语文、数学闯关练习<br />
            让学习变成一场冒险
          </p>

          <div className="flex flex-wrap justify-center lg:justify-start gap-2 mt-5">
            <span className="login-feature-tag">闯关答题</span>
            <span className="login-feature-tag">单词记忆</span>
            <span className="login-feature-tag">情景对话</span>
          </div>
        </div>

        {/* 右侧 — 登录表单 */}
        <div className="w-full max-w-sm page-enter" style={{animationDelay: '0.15s'}}>
          <div className="card">
            <div className="card-content">
              <div className="text-center mb-5">
                <h2 className="text-xl font-bold text-[var(--c-text)]">
                  {isRegister ? '创建账号' : '欢迎回来'}
                </h2>
                <p className="text-sm text-[var(--c-text-muted)] mt-0.5">
                  {isRegister ? '注册一个新账号' : '登录你的学习账号'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="input-group">
                  <label htmlFor="login-email" className="input-label">邮箱</label>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="input"
                    autoFocus
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="login-password" className="input-label">密码</label>
                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="输入密码"
                    className="input"
                  />
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary btn-lg w-full"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="spinner spinner-sm" />
                      处理中...
                    </span>
                  ) : isRegister ? '创建账号' : '开始学习'}
                </button>
              </form>

              <div className="mt-4 pt-3 text-center">
                <button
                  type="button"
                  onClick={() => { setIsRegister(!isRegister); setError('') }}
                  className="text-sm text-[var(--c-text-muted)] hover:text-[var(--c-primary)] transition-colors"
                >
                  {isRegister ? '已有账号？去登录' : '没有账号？注册一个'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
