/**
 * localStorage 缓存 key 管理
 * 统一所有缓存 key 的构造方式，避免硬编码重复
 */

const PREFIX = 'app_'

/** 学习状态缓存 key */
export function learningStateKey(subject, grade, childId) {
  return `${PREFIX}${subject}_g${grade}_learning_state_${childId}`
}

/** 游戏最后日期 key（用于每日首次判断） */
export function gameLastDateKey(subject, grade, childId) {
  return `${PREFIX}${subject}_g${grade}_game_last_date_${childId}`
}

/** 连续天数 key */
export function streakKey(subject, grade, childId) {
  return `${PREFIX}${subject}_g${grade}_game_streak_${childId}`
}

/** 单词进度缓存 key */
export function wordProgressKey(subject, grade, childId) {
  return `${PREFIX}${subject}_g${grade}_word_progress_${childId}`
}

/** 错词本缓存 key */
export function errorBookKey(childId, subject = 'english') {
  return `${PREFIX}error_book_${childId}_${subject}`
}
