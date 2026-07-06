import { errorBookKey } from './cache.js'

/**
 * 读取错词本
 * @param {string} childId
 * @param {string} subject
 * @returns {Object} { <wordId>: { wordId, word, meaning, totalErrors, lastErrorAt, errorTypes } }
 */
export function getErrorBook(childId, subject = 'english') {
  try {
    const raw = localStorage.getItem(errorBookKey(childId, subject))
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

/**
 * 记录错误单词。合并到现有记录，累加 totalErrors。
 * @param {string} childId
 * @param {string} subject
 * @param {Array} errors — [{ wordId, word, meaning?, type }, ...]
 */
export function recordErrors(childId, subject = 'english', errors = []) {
  if (!errors.length) return
  const book = getErrorBook(childId, subject)
  const now = Date.now()

  for (const e of errors) {
    if (!e.wordId) continue
    if (!book[e.wordId]) {
      book[e.wordId] = {
        wordId: e.wordId,
        word: e.word || e.wordId,
        meaning: e.meaning || '',
        totalErrors: 0,
        lastErrorAt: 0,
        errorTypes: {},
      }
    }
    const entry = book[e.wordId]
    entry.totalErrors += 1
    entry.lastErrorAt = now
    if (e.meaning) entry.meaning = e.meaning
    if (e.type) {
      entry.errorTypes[e.type] = (entry.errorTypes[e.type] || 0) + 1
    }
  }

  try {
    localStorage.setItem(errorBookKey(childId, subject), JSON.stringify(book))
  } catch {}
}

/**
 * 从错词本移除单个单词
 * @param {string} childId
 * @param {string} subject
 * @param {string} wordId
 */
export function removeWordError(childId, subject = 'english', wordId) {
  const book = getErrorBook(childId, subject)
  delete book[wordId]
  try {
    localStorage.setItem(errorBookKey(childId, subject), JSON.stringify(book))
  } catch {}
}

/**
 * 清空错词本
 * @param {string} childId
 * @param {string} subject
 */
export function clearErrorBook(childId, subject = 'english') {
  try {
    localStorage.removeItem(errorBookKey(childId, subject))
  } catch {}
}
