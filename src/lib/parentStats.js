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
 * 解析 results JSON 中的错误条目
 * @param {Array} results 游戏记录的 results 数组
 * @returns {Array<{wordId:string, questionText:string, correctAnswer?:string}>}
 */
export function extractErrorsFromResults(results) {
  if (!Array.isArray(results)) return []
  return results
    .filter((r) => r && !r.correct)
    .map((r) => ({
      wordId: r.wordId || r.questionId || '',
      questionText: r.questionText || r.word || '',
      correctAnswer: r.correctAnswer || '',
      userAnswer: r.userAnswer || '',
    }))
}

/**
 * 按日期聚合游戏记录
 * @param {Array} sessions
 * @returns {Object} { 'YYYY-MM-DD': { correct, wrong, sessions: [...] } }
 */
export function groupSessionsByDate(sessions) {
  const map = {}
  if (!sessions) return map
  for (const s of sessions) {
    const day = s.played_on
    if (!map[day]) {
      map[day] = { correct: 0, wrong: 0, sessions: [] }
    }
    map[day].correct += s.correct_count || 0
    map[day].wrong += s.wrong_count || 0
    map[day].sessions.push(s)
  }
  return map
}

/**
 * 按日期 + 科目聚合游戏记录
 * @param {Array} sessions
 * @returns {Object} { 'YYYY-MM-DD': { 'english': { correct, wrong, sessions }, ... } }
 */
export function groupByDateSubject(sessions) {
  const map = {}
  if (!sessions) return map
  for (const s of sessions) {
    const day = s.played_on
    if (!day) continue
    if (!map[day]) map[day] = {}
    const subj = s.subject || 'english'
    if (!map[day][subj]) {
      map[day][subj] = { correct: 0, wrong: 0, sessions: [] }
    }
    map[day][subj].correct += s.correct_count || 0
    map[day][subj].wrong += s.wrong_count || 0
    map[day][subj].sessions.push(s)
  }
  return map
}

/**
 * 从某天的某科目 sessions 中提取去重错题
 * @param {Object} dayData - grouped[day]
 * @param {string} subject
 * @returns {Array<{wordId:string, questionText:string, correctAnswer?:string}>}
 */
export function collectSubjectErrors(dayData, subject) {
  const subjData = dayData?.[subject]
  if (!subjData) return []

  const all = []
  for (const s of subjData.sessions) {
    let results
    try {
      results = typeof s.results === 'string' ? JSON.parse(s.results) : (s.results || [])
    } catch { results = [] }
    const errors = extractErrorsFromResults(results)
    all.push(...errors)
  }
  // 按 wordId 去重
  const seen = new Set()
  return all.filter((e) => {
    const key = e.wordId || e.questionText
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
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
