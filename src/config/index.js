// 应用全局配置
export const APP_NAME = '英语游戏'
export const GAME_QUESTIONS_PER_ROUND = 8
export const RANK_UP_THRESHOLD = 10 // 每10星升1级
export const PARENT_SESSION_DURATION_MS = 24 * 60 * 60 * 1000 // 家长密码有效期24小时
export const OFFLINE_RETRY_INTERVAL_MS = 30 * 1000 // 离线重试间隔30秒
export const MAX_COMBO_BONUS = 5

export const COMBO_THRESHOLDS = [
  { minCombo: 3, bonusStars: 1 },
  { minCombo: 5, bonusStars: 2 },
]
