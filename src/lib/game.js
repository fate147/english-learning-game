import { supabase } from './supabase.js'
import { gameLastDateKey, streakKey, learningStateKey, wordProgressKey } from './cache.js'

// 获取本地日期 YYYY-MM-DD（解决 UTC 日期与本地日期不一致的问题）
// offsetDays：偏移天数，如 -1 为昨天
export function getLocalDateString(offsetDays = 0) {
  const d = new Date()
  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60000)
  if (offsetDays) local.setDate(local.getDate() + offsetDays)
  return local.toISOString().split('T')[0]
}

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
  const { data, error } = await supabase
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

/**
 * 更新单词进度 — 每局游戏结束后调用
 * 对每个英语单词的答题结果，累加 correct_count / wrong_count
 */
export async function updateWordProgress(userId, childId, subject, grade, results) {
  if (!results || !Array.isArray(results) || results.length === 0) return { data: null, error: null }
  if (subject !== 'english') return { data: null, error: null }

  // 按 wordId 聚合 correct/wrong 计数
  const counts = {}
  for (const r of results) {
    if (!r.wordId) continue
    if (!counts[r.wordId]) counts[r.wordId] = { correct: 0, wrong: 0 }
    if (r.correct) counts[r.wordId].correct += 1
    else counts[r.wordId].wrong += 1
  }

  const errors = []
  for (const [wordId, c] of Object.entries(counts)) {
    // 获取当前进度
    const { data: existing } = await supabase
      .from('word_progress')
      .select('correct_count, wrong_count, level, word_id')
      .eq('user_id', userId)
      .eq('child_id', childId)
      .eq('subject', subject)
      .eq('grade', grade)
      .eq('word_id', wordId)
      .maybeSingle()

    const oldCorrect = existing?.correct_count || 0
    const oldWrong = existing?.wrong_count || 0
    const newCorrect = oldCorrect + c.correct
    const newWrong = oldWrong + c.wrong
    // level = 答对次数/5，最高3级
    const newLevel = Math.min(Math.floor(newCorrect / 5), 3)
    // 复习时间：level提升时延后 (level * 24) 小时
    const nextReview = newLevel > (existing?.level || 0)
      ? new Date(Date.now() + newLevel * 24 * 60 * 60 * 1000).toISOString()
      : existing?.next_review

    const { error } = await supabase
      .from('word_progress')
      .upsert({
        user_id: userId,
        child_id: childId,
        subject,
        grade,
        word_id: wordId,
        correct_count: newCorrect,
        wrong_count: newWrong,
        level: newLevel,
        next_review: nextReview,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id, child_id, subject, grade, word_id' })

    if (error) errors.push(error)
  }

  // 同步到本地缓存
  if (errors.length === 0) {
    try { mergeWordProgressToCache(childId, subject, grade, results) } catch {}
  }

  return { data: null, error: errors.length > 0 ? errors[0] : null }
}

/**
 * 构建游戏会话数据对象（闯关模式）
 * @param {Object} params
 * @returns {Object} sessionData
 */
export function buildGameSessionData({ activeChild, subject, grade, results, character }) {
  return {
    user_id: activeChild.user_id,
    child_id: activeChild.child_id,
    subject,
    grade,
    client_session_id: results.sessionId,
    played_on: getLocalDateString(),
    character: character || 'dino',
    correct_count: results.correctCount,
    wrong_count: results.wrongCount,
    results: results.answers,
  }
}

/**
 * 计算并保存连续天数（localStorage）
 * @param {Object} params
 * @returns {{ isFirstToday: boolean, isStreak7Days: boolean, streakDays: number }}
 */
export function calcAndSaveStreak({ subject, grade, childId }) {
  const todayKey = gameLastDateKey(subject, grade, childId)
  const lastDate = localStorage.getItem(todayKey)
  const today = getLocalDateString()
  const isFirstToday = lastDate !== today

  const streakKeyStr = streakKey(subject, grade, childId)
  let streakDays = parseInt(localStorage.getItem(streakKeyStr) || '0')
  if (isFirstToday) {
    const yesterdayStr = getLocalDateString(-1)
    if (lastDate === yesterdayStr) streakDays += 1
    else streakDays = 1
    localStorage.setItem(streakKeyStr, String(streakDays))
    localStorage.setItem(todayKey, today)
  }
  const isStreak7Days = streakDays >= 7

  return { isFirstToday, isStreak7Days, streakDays }
}

/**
 * 从 localStorage 读取已解锁单词（缓存优先）
 * @param {string} childId
 * @returns {{ fromCache: boolean, unlockedIds: string[] }}
 */
export function loadUnlockedWordsWithCache(childId) {
  const cacheKey = learningStateKey('english', 3, childId)
  try {
    const raw = localStorage.getItem(cacheKey)
    if (raw) {
      const cached = JSON.parse(raw)
      if (cached?.unlockedWords?.length) return { fromCache: true, unlockedIds: cached.unlockedWords }
    }
  } catch {}
  return { fromCache: false, unlockedIds: [] }
}

/**
 * 将已解锁单词写入 localStorage 缓存
 * @param {string} childId
 * @param {string[]} unlockedIds
 */
export function saveUnlockedWordsToCache(childId, unlockedIds) {
  try {
    localStorage.setItem(learningStateKey('english', 3, childId), JSON.stringify({ unlockedWords: unlockedIds }))
  } catch {}
}

/**
 * 从 localStorage 读取单词进度（缓存优先）
 * @param {string} childId
 * @param {string} subject
 * @param {number} grade
 * @returns {{ fromCache: boolean, progressMap: Object }}
 */
export function loadWordProgressWithCache(childId, subject = 'english', grade = 3) {
  const cacheKey = wordProgressKey(subject, grade, childId)
  try {
    const raw = localStorage.getItem(cacheKey)
    if (raw) {
      const progressMap = JSON.parse(raw)
      if (progressMap && Object.keys(progressMap).length > 0) {
        return { fromCache: true, progressMap }
      }
    }
  } catch {}
  return { fromCache: false, progressMap: {} }
}

/**
 * 将单词进度写入 localStorage 缓存
 * @param {string} childId
 * @param {string} subject
 * @param {number} grade
 * @param {Object} progressMap - { wordId: { correct_count, wrong_count, level, next_review }, ... }
 */
function saveWordProgressToCache(childId, subject, grade, progressMap) {
  try {
    localStorage.setItem(wordProgressKey(subject, grade, childId), JSON.stringify(progressMap))
  } catch {}
}

/**
 * 合并增量到本地缓存：在现有缓存基础上累加 correct/wrong 计数
 * @param {string} childId
 * @param {string} subject
 * @param {number} grade
 * @param {Array} results - [{ wordId, correct }, ...]
 * @returns {Object} 更新后的 progressMap
 */
export function mergeWordProgressToCache(childId, subject, grade, results) {
  const { progressMap } = loadWordProgressWithCache(childId, subject, grade)
  for (const r of results) {
    if (!r.wordId) continue
    if (!progressMap[r.wordId]) {
      progressMap[r.wordId] = { correct_count: 0, wrong_count: 0, level: 0 }
    }
    if (r.correct) {
      progressMap[r.wordId].correct_count = (progressMap[r.wordId].correct_count || 0) + 1
    } else {
      progressMap[r.wordId].wrong_count = (progressMap[r.wordId].wrong_count || 0) + 1
    }
    progressMap[r.wordId].level = Math.min(Math.floor(progressMap[r.wordId].correct_count / 5), 3)
  }
  saveWordProgressToCache(childId, subject, grade, progressMap)
  return progressMap
}
