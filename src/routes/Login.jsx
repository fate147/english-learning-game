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
    }
  }

  return (
    <PageShell>
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <div className="w-full max-w-sm space-y-6">

          {/* 装饰元素 */}
          <div className="deco-cloud float-cloud" style={{width:'100px',height:'32px',top:'8%',left:'5%'}} />
          <div className="deco-cloud float-cloud" style={{width:'70px',height:'24px',top:'15%',right:'8%',animationDelay:'1s'}} />
          <div className="deco-star" style={{top:'12%',left:'55%'}}>✨</div>
          <div className="deco-star" style={{top:'20%',right:'15%',animationDelay:'0.7s'}}>⭐</div>

          {/* 品牌区 */}
          <div className="text-center page-enter">
            {/* 吉祥物形象 */}
            <div className="relative inline-block mb-4">
              <div className="w-28 h-28 mx-auto rounded-full overflow-hidden border-4 border-white/25 shadow-xl
                              bg-white/10 backdrop-blur-sm flex items-center justify-center login-mascot">
                <img
                  src="images/dragon_happy.png"
                  alt="小龙"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.textContent = '🐉' }}
                />
              </div>
              {/* 呼吸光环 */}
              <div className="absolute inset-0 rounded-full border-2 border-white/20 login-glow" />
            </div>

            <h1 className="text-3xl font-black text-white" style={{textShadow: '0 2px 12px rgba(0,0,0,0.3)'}}>
              和小伙伴一起学！
            </h1>
            <p className="text-white/65 mt-2 text-sm">登录你的账号开始学习之旅</p>
          </div>

          {/* 表单 */}
          <Card className="page-enter" style={{animationDelay: '0.1s'}}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-white/60 mb-1.5">邮箱</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35 text-base pointer-events-none">📧</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border-2 border-white/18 rounded-xl text-base text-white placeholder-white/30
                               focus:border-emerald-400 focus:bg-white/15 focus:outline-none focus:shadow-[0_0_0_3px_rgba(52,211,153,0.15)] transition-all duration-200"
                    autoFocus
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-white/60 mb-1.5">密码</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35 text-base pointer-events-none">🔒</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="输入密码"
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border-2 border-white/18 rounded-xl text-base text-white placeholder-white/30
                               focus:border-emerald-400 focus:bg-white/15 focus:outline-none focus:shadow-[0_0_0_3px_rgba(52,211,153,0.15)] transition-all duration-200"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-300 text-sm text-center justify-center bg-red-500/10 rounded-lg py-2 px-3">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-3.5 rounded-xl font-black text-lg transition-all duration-200 btn-ripple disabled:opacity-50
                  ${isRegister
                    ? 'bg-white/12 border-2 border-white/25 text-white hover:bg-white/18'
                    : 'bg-gradient-to-r from-[var(--theme-color)] to-[var(--theme-color-light)] text-white hover:brightness-110 shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                  }`}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    处理中...
                  </span>
                ) : isRegister ? '✨ 注册' : '🚀 开始学习'}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => { setIsRegister(!isRegister); setError('') }}
                  className="text-sm text-white/55 hover:text-white/80 transition-colors"
                >
                  {isRegister ? '已有账号？去登录' : '没有账号？注册一个'}
                </button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </PageShell>
  )
}
