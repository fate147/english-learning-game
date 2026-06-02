import { useContext, useEffect } from 'react'
import { AuthContext } from '../../context/AuthContext.jsx'
import { getChildren } from '../../lib/child.js'
import { getLearningState, getWordProgress } from '../../lib/game.js'
import { getStars } from '../../lib/stars.js'
import { setCachedData } from '../../lib/offline.js'

const CACHE_PREFIX = 'eng_preload_'

// 登录时一次性拉取所有数据，写 localStorage
// 后续页面直接读缓存，不再调接口
export default function DataPrefetch({ children }) {
  const { user } = useContext(AuthContext)

  useEffect(() => {
    if (!user) return
    const cacheKey = CACHE_PREFIX + user.id
    const tsKey = cacheKey + '_ts'
    const ts = parseInt(localStorage.getItem(tsKey) || '0')

    // 10分钟内不重复拉
    if (Date.now() - ts < 10 * 60 * 1000) return

    // 后台静默拉取所有数据
    ;(async () => {
      const { data: children } = await getChildren(user.id)
      if (!children || children.length === 0) {
        localStorage.setItem(tsKey, String(Date.now()))
        return
      }

      const childId = children[0].child_id
      const [state, wp, stars] = await Promise.all([
        getLearningState(user.id, childId).catch(() => ({ data: null })),
        getWordProgress(user.id, childId).catch(() => ({ data: null })),
        getStars(user.id, childId).catch(() => ({ data: null })),
      ])

      // 缓存全部数据
      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          children,
          unlockedWords: state.data?.unlocked_words || [],
          wordProgress: wp.data || [],
          totalStars: stars.data?.total_earned_stars || 0,
          availableStars: stars.data?.available_stars || 0,
        }))
        localStorage.setItem(tsKey, String(Date.now()))
        // 写入离线缓存标记，OfflineGate 据此判断有可用缓存
        setCachedData({ initialized: true })
      } catch {}
    })()
  }, [user])

  return children
}
