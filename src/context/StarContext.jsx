import { createContext, useState, useCallback, useContext, useEffect } from 'react'
import { AuthContext } from './AuthContext.jsx'
import { ChildContext } from './ChildContext.jsx'
import { getStars, addEarnedStars, spendStars, calcLevel } from '../lib/stars.js'
import { enqueue } from '../lib/offline.js'

export const StarContext = createContext(null)

// 尝试从缓存恢复上次选中的孩子的星星数据（避免初始渲染绿色闪烁）
function initStarsFromCache() {
  try {
    const lastChildId = localStorage.getItem('app_last_child_id')
    if (!lastChildId) return { total: 0, avail: 0 }
    const cache = localStorage.getItem('app_stars_' + lastChildId)
    if (!cache) return { total: 0, avail: 0 }
    const parsed = JSON.parse(cache)
    return { total: parsed.total_earned_stars || 0, avail: parsed.available_stars || 0 }
  } catch {
    return { total: 0, avail: 0 }
  }
}

export function StarProvider({ children }) {
  const { user } = useContext(AuthContext)
  const { activeChild } = useContext(ChildContext)
  const [totalEarned, setTotalEarned] = useState(() => initStarsFromCache().total)
  const [available, setAvailable] = useState(() => initStarsFromCache().avail)

  // 加载 / 切换孩子时拉取真实星星数据，确保级别和主题色正确
  useEffect(() => {
    if (!user || !activeChild) return

    const childId = activeChild.child_id
    // 更新 last_child_id，下次启动时可以恢复颜色
    try { localStorage.setItem('app_last_child_id', childId) } catch {}

    // 先读本地缓存（同步），立即恢复主题色，无闪烁
    try {
      const starCache = localStorage.getItem('app_stars_' + childId)
      if (starCache) {
        const parsed = JSON.parse(starCache)
        if (parsed.total_earned_stars !== totalEarned) setTotalEarned(parsed.total_earned_stars)
        if (parsed.available_stars !== available) setAvailable(parsed.available_stars)
      }
    } catch {}
    // 再拉服务器数据覆盖（保证新鲜度）
    getStars(user.id, childId).then(({ data, error }) => {
      if (!error && data) {
        setTotalEarned(data.total_earned_stars)
        setAvailable(data.available_stars)
        try { localStorage.setItem('app_stars_' + childId, JSON.stringify(data)) } catch {}
      }
    })
  }, [user, activeChild])

  const refreshStars = useCallback(async () => {
    if (!user || !activeChild) return
    const { data, error } = await getStars(user.id, activeChild.child_id)
    if (!error && data) {
      setTotalEarned(data.total_earned_stars)
      setAvailable(data.available_stars)
    }
    return { data, error }
  }, [user, activeChild])

  const addStars = useCallback(
    (totalAdd, availAdd) => {
      if (!user || !activeChild) {
        return Promise.resolve({ data: null, error: new Error('未选择孩子') })
      }

      // 先乐观更新本地状态（界面立即响应）
      setTotalEarned(prev => prev + totalAdd)
      setAvailable(prev => prev + availAdd)

      // 同步到 Supabase，返回 Promise 供调用方链式刷新
      return addEarnedStars(user.id, activeChild.child_id, totalAdd, availAdd)
        .then(({ error }) => {
          if (error) {
            // 失败进离线重试队列
            enqueue({
              type: 'add_stars',
              userId: user.id,
              childId: activeChild.child_id,
              totalAdd,
              availAdd,
            })
          }
          return { error }
        })
    },
    [user, activeChild]
  )

  const spend = useCallback(
    async (cost) => {
      if (!user || !activeChild) return { data: null, error: new Error('未选择孩子') }
      const { data, error } = await spendStars(user.id, activeChild.child_id, cost)
      if (!error && data) {
        setAvailable(data.available_stars)
      }
      return { data, error }
    },
    [user, activeChild]
  )

  const level = calcLevel(totalEarned)

  return (
    <StarContext.Provider
      value={{
        totalEarned,
        available,
        level,
        refreshStars,
        addStars,
        spend,
      }}
    >
      {children}
    </StarContext.Provider>
  )
}
