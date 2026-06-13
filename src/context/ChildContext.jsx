import { createContext, useState, useCallback, useContext, useEffect } from 'react'
import { AuthContext } from './AuthContext.jsx'
import { getChildren, createChild, updateChild, deleteChild } from '../lib/child.js'

const CACHE_KEY = 'app_children'

export const ChildContext = createContext(null)

export function ChildProvider({ children }) {
  const { user } = useContext(AuthContext)
  const [childrenList, setChildrenList] = useState([])
  const [activeChild, setActiveChild] = useState(null)
  const [loading, setLoading] = useState(false)

  // 从缓存读取，缓存过期才从网络拉
  useEffect(() => {
    if (!user) return
    const cacheKey = CACHE_KEY + '_' + user.id
    const tsKey = cacheKey + '_ts'
    try {
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setChildrenList(parsed)
        }
      }
      // 5分钟内不重新拉取
      const ts = parseInt(localStorage.getItem(tsKey) || '0')
      if (Date.now() - ts < 5 * 60 * 1000 && cached) return
    } catch {}
    fetchChildren().then(() => {
      try { localStorage.setItem(tsKey, String(Date.now())) } catch {}
    })
  }, [user])

  const fetchChildren = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await getChildren(user.id)
    if (!error && data) {
      setChildrenList(data)
      try {
        const key = CACHE_KEY + '_' + user.id
        localStorage.setItem(key, JSON.stringify(data))
        localStorage.setItem(key + '_ts', String(Date.now()))
      } catch {}
    }
    setLoading(false)
    return { data, error }
  }, [user])

  const addChild = useCallback(
    async (childId, name, avatar) => {
      if (!user) return { data: null, error: new Error('未登录') }
      const { data, error } = await createChild(user.id, childId, name, avatar)
      if (!error && data) {
        setChildrenList((prev) => [...prev, data])
      }
      return { data, error }
    },
    [user]
  )

  const selectChild = useCallback((child) => {
    setActiveChild(child)
  }, [])

  const refreshActiveChild = useCallback(
    async (updates) => {
      if (!user || !activeChild) return
      const { data, error } = await updateChild(user.id, activeChild.child_id, updates)
      if (!error && data) {
        setActiveChild(data)
        setChildrenList((prev) =>
          prev.map((c) => (c.child_id === data.child_id ? data : c))
        )
      }
      return { data, error }
    },
    [user, activeChild]
  )

  const removeChild = useCallback(
    async (childId) => {
      if (!user) return { error: new Error('未登录') }
      const { error } = await deleteChild(user.id, childId)
      if (!error) {
        setChildrenList((prev) => prev.filter((c) => c.child_id !== childId))
        if (activeChild?.child_id === childId) {
          setActiveChild(null)
        }
      }
      return { error }
    },
    [user, activeChild]
  )

  return (
    <ChildContext.Provider
      value={{
        childrenList,
        activeChild,
        loading,
        fetchChildren,
        addChild,
        selectChild,
        refreshActiveChild,
        removeChild,
      }}
    >
      {children}
    </ChildContext.Provider>
  )
}
