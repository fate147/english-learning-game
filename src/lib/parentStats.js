import { supabase } from './supabase.js'

/**
 * 获取某孩子某周（7天窗口）的游戏记录
 * @param {string} userId
 * @param {string} childId
 * @param {number} [days=7] 窗口天数
 * @param {number} [weekOffset=0] 周偏移，0=本周, -1=上一周
 * @returns {Promise<{data: Array, error}>}
 */
export async function getRecentGameSessions(userId, childId, days = 7, weekOffset = 0, subject = null) {
  const end = new Date()
  end.setDate(end.getDate() + weekOffset * 7)
  const start = new Date(end)
  start.setDate(end.getDate() - days + 1)

  const startDate = start.toISOString().split('T')[0]
  const endDate = end.toISOString().split('T')[0]

  try {
    let query = supabase
      .from('game_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('child_id', childId)
      .gte('played_on', startDate)
      .lte('played_on', endDate)

    if (subject) query = query.eq('subject', subject)

    const { data, error } = await query
      .order('played_on', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) return { data: null, error }
    return { data, error: null }
  } catch (e) {
    return { data: null, error: { message: e.message || '网络连接失败' } }
  }
}

/**
 * 获取某孩子的星星信息
 */
export async function getChildStars(userId, childId) {
  const { data, error } = await supabase
    .from('child_profiles')
    .select('total_earned_stars, available_stars')
    .eq('user_id', userId)
    .eq('child_id', childId)
    .maybeSingle()
  if (error) return { data: null, error }
  return {
    data: {
      totalEarnedStars: data?.total_earned_stars || 0,
      availableStars: data?.available_stars || 0,
    },
    error: null,
  }
}
