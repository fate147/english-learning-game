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
  // 确保 client_session_id 不为空
  const clientSessionId = session.client_session_id || generateClientSessionId()
  const { error } = await supabase
    .from('game_sessions')
    .upsert(
      {
        user_id: session.user_id,
        child_id: session.child_id,
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

export async function getGameSessions(userId, childId, limit = 50) {
  const { data, error } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('child_id', childId)
    .order('played_on', { ascending: false })
    .limit(limit)
  return { data, error }
}

export async function getTodaySessions(userId, childId) {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('child_id', childId)
    .eq('played_on', today)
  return { data, error }
}

// 学习状态（learning_app_state 表）
export async function getLearningState(userId, childId) {
  const { data, error } = await supabase
    .from('learning_app_state')
    .select('*')
    .eq('user_id', userId)
    .eq('child_id', childId)
    .maybeSingle()
  return { data, error }
}

// 单词进度（word_progress 表 CRUD）
export async function getWordProgress(userId, childId) {
  const { data, error } = await supabase
    .from('word_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('child_id', childId)
  return { data, error }
}

export async function upsertWordProgress(userId, childId, wordId, updates) {
  const { data, error } = await supabase
    .from('word_progress')
    .upsert(
      {
        user_id: userId,
        child_id: childId,
        word_id: wordId,
        ...updates,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id, child_id, word_id' }
    )
    .select()
    .single()
  return { data, error }
}

export async function upsertLearningState(userId, childId, updates) {
  const { data, error } = await supabase
    .from('learning_app_state')
    .upsert(
      {
        user_id: userId,
        child_id: childId,
        ...updates,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id, child_id' }
    )
    .select()
    .single()
  return { data, error }
}
