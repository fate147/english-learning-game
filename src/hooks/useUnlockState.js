import { useState, useCallback, useRef } from 'react'
import { useAuth } from './useAuth.js'
import { getLearningState, upsertLearningState, getWordProgress, loadUnlockedWordsWithCache, saveUnlockedWordsToCache } from '../lib/game.js'

export function useUnlockState() {
  const { user } = useAuth()
  const [unlocked, setUnlocked] = useState([])
  const [progress, setProgress] = useState({})
  const loadingRef = useRef(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetch = useCallback(async (childId, subject = 'english', grade = 3) => {
    if (!user || !childId || loadingRef.current) return
    loadingRef.current = true
    setLoading(true)
    setError(null)
    try {
      const { unlockedIds } = loadUnlockedWordsWithCache(childId)
      if (unlockedIds.length) setUnlocked(unlockedIds)
      const [s, wp] = await Promise.all([
        getLearningState(user.id, childId, subject, grade),
        getWordProgress(user.id, childId, subject, grade),
      ])
      if (s.data?.unlocked_words) setUnlocked(s.data.unlocked_words)
      const map = {}
      if (wp.data) wp.data.forEach((w) => { map[w.word_id] = w })
      setProgress(map)
    } catch (e) {
      console.error('加载解锁数据失败:', e)
      setError(e.message || '加载失败')
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [user])

  const toggle = useCallback(async (childId, wordId) => {
    if (!user) return
    setUnlocked(prev => {
      const next = prev.includes(wordId)
        ? prev.filter((id) => id !== wordId)
        : [...prev, wordId]
      saveUnlockedWordsToCache(childId, next)
      upsertLearningState(user.id, childId, { unlocked_words: next }, 'english', 3)
      return next
    })
  }, [user])

  const toggleAll = useCallback(async (childId, wordIds) => {
    if (!user) return
    setUnlocked(prev => {
      const allUnlocked = wordIds.every((id) => prev.includes(id))
      const next = allUnlocked
        ? prev.filter((id) => !wordIds.includes(id))
        : [...new Set([...prev, ...wordIds])]
      saveUnlockedWordsToCache(childId, next)
      upsertLearningState(user.id, childId, { unlocked_words: next }, 'english', 3)
      return next
    })
  }, [user])

  return { unlocked, progress, loading, error, fetch, toggle, toggleAll }
}
