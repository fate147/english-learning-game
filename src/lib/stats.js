import { supabase } from './supabase.js'

export async function getAggregatedStats(userId, childId, subject, grade) {
  // 获取所有游戏记录
  let query = supabase
    .from('game_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('child_id', childId)
  if (subject) query = query.eq('subject', subject)
  if (grade) query = query.eq('grade', grade)
  const { data: sessions, error: sessionsError } = await query
    .order('played_on', { ascending: false })

  if (sessionsError) return { data: null, error: sessionsError }

  // 获取 word_progress
  let wpQuery = supabase
    .from('word_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('child_id', childId)
  if (subject) wpQuery = wpQuery.eq('subject', subject)
  if (grade) wpQuery = wpQuery.eq('grade', grade)
  const { data: wordProgress, error: wordError } = await wpQuery

  if (wordError) return { data: null, error: wordError }

  // 获取星星信息
  const { data: stars } = await supabase
    .from('child_profiles')
    .select('total_earned_stars, available_stars')
    .eq('user_id', userId)
    .eq('child_id', childId)
    .maybeSingle()

  // 统计计算
  const totalSessions = sessions ? sessions.length : 0
  const totalCorrect = sessions
    ? sessions.reduce((sum, s) => sum + (s.correct_count || 0), 0)
    : 0
  const totalWrong = sessions
    ? sessions.reduce((sum, s) => sum + (s.wrong_count || 0), 0)
    : 0
  const totalAnswered = totalCorrect + totalWrong
  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0

  // 按日期聚合
  const dailyStats = {}
  if (sessions) {
    sessions.forEach((s) => {
      const day = s.played_on
      if (!dailyStats[day]) {
        dailyStats[day] = { correct: 0, wrong: 0, sessions: 0 }
      }
      dailyStats[day].correct += s.correct_count || 0
      dailyStats[day].wrong += s.wrong_count || 0
      dailyStats[day].sessions += 1
    })
  }

  // 错误单词排名
  const errorMap = {}
  if (sessions) {
    sessions.forEach((s) => {
      if (s.results) {
        const results =
          typeof s.results === 'string' ? JSON.parse(s.results) : s.results
        results.forEach((r) => {
          const errKey = r.wordId || r.questionId
          if (r && !r.correct && errKey) {
            errorMap[errKey] = (errorMap[errKey] || 0) + 1
          }
        })
      }
    })
  }

  // 单词进度
  const wordLevels = {}
  if (wordProgress) {
    wordProgress.forEach((wp) => {
      wordLevels[wp.word_id] = {
        level: wp.level,
        correct_count: wp.correct_count,
        wrong_count: wp.wrong_count,
        next_review: wp.next_review,
      }
    })
  }

  return {
    data: {
      totalSessions,
      totalCorrect,
      totalWrong,
      totalAnswered,
      accuracy,
      totalEarnedStars: stars?.total_earned_stars || 0,
      availableStars: stars?.available_stars || 0,
      dailyStats,
      errorRanking: Object.entries(errorMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
      wordProgress: wordLevels,
    },
    error: null,
  }
}
