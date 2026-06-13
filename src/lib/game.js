import { supabase } from './supabase.js'

// 生成唯一 clientSessionId
export function generateClientSessionId() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      })
}

export async function saveGameSession(session) {
  const clientSessionId = session.client_session_id || generateClientSessionId()
  const { error } = await supabase
    .from('game_sessions')
    .upsert(
      {
        user_id: session.user_id,
        child_id: session.child_id,
        subject: session.subject || 'english',
        grade: session.grade || 3,
        client_session_id: clientSessionId,
        played_on: session.played_on,
        character: session.character || 'default',
        correct_count: session.correct_count,
        wrong_count: session.wrong_count,
        results: Array.isArray(session.results) ? session.results : [],
      },
      {
        onConflict: 'client_session_id',
        ignoreDuplicates: false,
      }
    )
  if (error) {
    console.warn('saveGameSession 失败:', error.code, error.message, error.details)
  }
  return { data: null, error }
}

export async function getGameSessions(userId, childId, limit = 50, subject, grade) {
  let query = supabase
    .from('game_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('child_id', childId)
  if (subject) query = query.eq('subject', subject)
  if (grade) query = query.eq('grade', grade)
  const { data, error } = await query
    .order('played_on', { ascending: false })
    .limit(limit)
  return { data, error }
}

export async function getTodaySessions(userId, childId, subject, grade) {
  const today = new Date().toISOString().split('T')[0]
  let query = supabase
    .from('game_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('child_id', childId)
    .eq('played_on', today)
  if (subject) query = query.eq('subject', subject)
  if (grade) query = query.eq('grade', grade)
  const { data, error } = await query
  return { data, error }
}

// 学习状态（learning_app_state 表）
export async function getLearningState(userId, childId, subject = 'english', grade = 3) {
  const { data, error } = await supabase
    .from('learning_app_state')
    .select('*')
    .eq('user_id', userId)
    .eq('child_id', childId)
    .eq('subject', subject)
    .eq('grade', grade)
    .maybeSingle()
  return { data, error }
}

// 单词/题目进度（word_progress 表）
export async function getWordProgress(userId, childId, subject = 'english', grade = 3) {
  const { data, error } = await supabase
    .from('word_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('child_id', childId)
    .eq('subject', subject)
    .eq('grade', grade)
  return { data, error }
}

export async function upsertWordProgress(userId, childId, wordId, updates, subject = 'english', grade = 3) {
  const { data, error } = await supabase
    .from('word_progress')
    .upsert(
      {
        user_id: userId,
        child_id: childId,
        subject,
        grade,
        word_id: wordId,
        ...updates,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id, child_id, subject, grade, word_id' }
    )
    .select()
    .single()
  return { data, error }
}

export async function upsertLearningState(userId, childId, updates, subject = 'english', grade = 3) {
  const { data, error } = await supabase
    .from('learning_app_state')
    .upsert(
      {
        user_id: userId,
        child_id: childId,
        subject,
        grade,
        ...updates,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id, child_id, subject, grade' }
    )
    .select()
    .single()
  return { data, error }
}
