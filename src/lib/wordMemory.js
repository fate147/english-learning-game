import { getLocalDateString } from './game.js'

/**
 * 将单词数组按 unit 分组
 * @param {Array} words - WORDS 数组
 * @returns {Object} { unitNumber: [word, ...], ... }
 */
export function groupWordsByUnit(words) {
  const units = {}
  words.forEach(w => {
    if (!units[w.unit]) units[w.unit] = []
    units[w.unit].push(w)
  })
  return units
}

/**
 * 按搜索关键词过滤单词分组
 * @param {Object} unitWords - groupWordsByUnit 的返回值
 * @param {string} query - 搜索关键词
 * @returns {Object} 过滤后的分组
 */
export function filterWordUnits(unitWords, query) {
  if (!query?.trim()) return unitWords
  const q = query.toLowerCase()
  const filtered = {}
  Object.entries(unitWords).forEach(([unit, words]) => {
    const match = words.filter(w =>
      w.word.toLowerCase().includes(q) || w.meaning.includes(q)
    )
    if (match.length > 0) filtered[unit] = match
  })
  return filtered
}

/**
 * 计算单词记忆模式的统计数据
 * @param {Object} cardDone - { wordId: true/false }
 * @param {number} score - 答对数量
 * @param {Array} batchWords - 本次练习的单词数组
 * @returns {{ completedCount, totalBatch, accuracy }}
 */
export function getMemoryStats(cardDone, score, batchWords) {
  const completedCount = Object.keys(cardDone).length
  const totalBatch = batchWords.length
  const accuracy = completedCount > 0 ? Math.round((score / completedCount) * 100) : 0
  return { completedCount, totalBatch, accuracy }
}

/**
 * 构建记忆模式游戏会话数据
 * @param {Object} params
 * @returns {Object} sessionData
 */
export function buildMemorySessionData({ user, child, subject, grade, batchWords, cardDone, finalScore }) {
  return {
    user_id: user.id,
    child_id: child.child_id,
    subject,
    grade,
    client_session_id: `memory_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    played_on: getLocalDateString(),
    character: 'default',
    correct_count: finalScore,
    wrong_count: batchWords.length - finalScore,
    results: batchWords.map((w) => ({
      wordId: w.id,
      word: w.word,
      correct: cardDone[w.id] === true,
      type: 'letter_fill',
    })),
  }
}
