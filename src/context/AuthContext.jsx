import { createContext, useState, useEffect, useCallback } from 'react'
import { signIn, signUp, signOut, getSession, onAuthStateChange } from '../lib/auth.js'

const SESSION_CACHE_KEY = 'app_session_cache'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // 启动时先从 localStorage 恢复
    try {
      const cached = localStorage.getItem(SESSION_CACHE_KEY)
      if (cached) return JSON.parse(cached)
    } catch {}
    return null
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    let subscription = null
    setLoading(true)

    // 有缓存就不调 Supabase（避免速率限制）
    const cached = localStorage.getItem(SESSION_CACHE_KEY)
    if (cached) {
      try { setUser(JSON.parse(cached)) } catch {}
    }

    // 后台检查 session
    getSession()
      .then(({ data }) => {
        if (!cancelled) {
          if (data?.session?.user) {
            setUser(data.session.user)
            try { localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(data.session.user)) } catch {}
          } else {
            // session 无效时清除缓存，避免假登录
            setUser(null)
            try { localStorage.removeItem(SESSION_CACHE_KEY) } catch {}
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    const { data: authData } = onAuthStateChange((_event, session) => {
      if (!cancelled) {
        setUser(session?.user ?? null)
        if (session?.user) {
          try { localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(session.user)) } catch {}
        } else {
          try { localStorage.removeItem(SESSION_CACHE_KEY) } catch {}
        }
      }
    })
    subscription = authData?.subscription

    return () => {
      cancelled = true
      subscription?.unsubscribe?.()
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const { data, error } = await signIn(email, password)
    if (!error && data?.user) {
      setUser(data.user)
      try { localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(data.user)) } catch {}
    }
    return { data, error }
  }, [])

  const register = useCallback(async (email, password) => {
    const { data, error } = await signUp(email, password)
    if (!error && data?.user) {
      setUser(data.user)
      try { localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(data.user)) } catch {}
    }
    return { data, error }
  }, [])

  const logout = useCallback(async () => {
    await signOut()
    setUser(null)
    try { localStorage.removeItem(SESSION_CACHE_KEY) } catch {}
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
