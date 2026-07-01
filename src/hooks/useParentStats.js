import { useState, useCallback, useRef } from 'react'
import { useAuth } from './useAuth.js'
import { getRecentGameSessions, getChildStars } from '../lib/parentStats.js'

export function useParentStats() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState([])
  const loadingRef = useRef(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [stars, setStars] = useState({ totalEarnedStars: 0, availableStars: 0 })

  const fetchRecentSessions = useCallback(async (childId, days = 7, weekOffset = 0, subject = null) => {
    if (!user || !childId || loadingRef.current) return
    loadingRef.current = true
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await getRecentGameSessions(user.id, childId, days, weekOffset, subject)
      if (err) {
        setError(err.message || '加载游戏记录失败')
        setSessions([])
      } else {
        setSessions(data || [])
      }
    } catch (e) {
      setError(e.message || '网络错误')
      setSessions([])
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [user])

  const fetchStars = useCallback(async (childId) => {
    if (!user || !childId) return
    try {
      const { data } = await getChildStars(user.id, childId)
      if (data) setStars(data)
    } catch (e) {
      console.error('获取星星失败:', e)
    }
  }, [user])

  return {
    sessions,
    loading,
    error,
    stars,
    fetchRecentSessions,
    fetchStars,
  }
}
