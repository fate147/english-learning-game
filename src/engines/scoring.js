// 计分规则
//
// 答对 1 题      → total +1, available +1
// 连续 3 题      → 额外 +1
// 连续 5 题      → 额外 +2
// 一局全对       → 额外 +3
// 每日第一次打开  → +2
// 连续 7 天都玩  → +5
// 答错 → 不倒扣，断连击

export function calcScore(correctCount, maxCombo, isPerfectRound, isFirstToday, isStreak7Days) {
  // 答对每题 +1
  let totalAdd = correctCount
  let availableAdd = correctCount
  const bonuses = []

  // 连击奖励（按本局最高连击）
  if (maxCombo >= 5) {
    totalAdd += 2
    availableAdd += 2
    bonuses.push({ reason: 'combo', combo: maxCombo, extra: 2 })
  } else if (maxCombo >= 3) {
    totalAdd += 1
    availableAdd += 1
    bonuses.push({ reason: 'combo', combo: maxCombo, extra: 1 })
  }

  // 一局全对
  if (isPerfectRound) {
    totalAdd += 3
    availableAdd += 3
    bonuses.push({ reason: 'perfect', extra: 3 })
  }

  // 每日第一次
  if (isFirstToday) {
    totalAdd += 2
    availableAdd += 2
    bonuses.push({ reason: 'first_today', extra: 2 })
  }

  // 连续7天
  if (isStreak7Days) {
    totalAdd += 5
    availableAdd += 5
    bonuses.push({ reason: 'streak_7', extra: 5 })
  }

  return { totalAdd, availableAdd, bonuses }
}

