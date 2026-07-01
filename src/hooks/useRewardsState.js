import { useState, useCallback, useRef } from 'react'
import { useAuth } from './useAuth.js'
import { createRewardTemplate, deleteRewardTemplate, getRewardRecords, initDefaultTemplates, redeemReward } from '../lib/rewards.js'
import { getStars } from '../lib/stars.js'

export function useRewardsState() {
  const { user } = useAuth()
  const [templates, setTemplates] = useState([])
  const [records, setRecords] = useState([])
  const [stars, setStars] = useState(0)
  const loadingRef = useRef(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetch = useCallback(async (childId) => {
    if (!user || !childId || loadingRef.current) return
    loadingRef.current = true
    setLoading(true)
    setError(null)
    try {
      const [tmpls, r, s] = await Promise.all([
        initDefaultTemplates(user.id, childId),
        getRewardRecords(user.id, childId),
        getStars(user.id, childId),
      ])
      setTemplates(Array.isArray(tmpls) ? tmpls : [])
      setRecords(r?.data ? r.data : [])
      setStars(s?.data?.available_stars ?? 0)
    } catch (err) {
      setError(err?.message || '加载奖励数据失败')
      setTemplates([])
      setRecords([])
      setStars(0)
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [user])

  const redeem = useCallback(async (childId, tmpl) => {
    if (!user) return '请先登录'
    try {
      const { error } = await redeemReward(user.id, childId, tmpl)
      if (error) return error.message || '兑换失败'
      setStars((s) => s - tmpl.cost)
      setRecords((prev) => [
        { id: Date.now().toString(), name: tmpl.name, cost: tmpl.cost, created_at: new Date().toISOString() },
        ...prev,
      ])
      return null
    } catch (e) {
      return e.message || '兑换失败'
    }
  }, [user])

  const addTemplate = useCallback(async (childId, t) => {
    if (!user) return
    try {
      const { data, error } = await createRewardTemplate(user.id, childId, t)
      if (error) throw error
      if (data) setTemplates((p) => [...p, data])
    } catch (err) {
      console.error('添加奖励模板失败:', err)
    }
  }, [user])

  const deleteTemplate = useCallback(async (childId, templateId) => {
    if (!user) return
    try {
      const { error } = await deleteRewardTemplate(user.id, childId, templateId)
      if (error) throw error
      setTemplates((prev) => prev.filter((t) => t.id !== templateId))
    } catch (err) {
      console.error('删除奖励模板失败:', err)
    }
  }, [user])

  return { templates, records, stars, loading, error, fetch, redeem, addTemplate, deleteTemplate }
}
