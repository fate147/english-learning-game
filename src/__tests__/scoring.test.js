import { describe, it, expect } from 'vitest'
import { calcScore } from '../engines/scoring.js'

describe('calcScore', () => {
  it('答对 0 题得 0 星', () => {
    const result = calcScore(0, 0, false, false, false)
    expect(result.totalAdd).toBe(0)
    expect(result.availableAdd).toBe(0)
    expect(result.bonuses).toHaveLength(0)
  })

  it('答对 1 题得 1 星', () => {
    const result = calcScore(1, 1, false, false, false)
    expect(result.totalAdd).toBe(1)
    expect(result.availableAdd).toBe(1)
  })

  it('答对 8 题且连击 8 得 10 星', () => {
    const result = calcScore(8, 8, false, false, false)
    expect(result.totalAdd).toBe(10) // 8 + 2(combo≥5)
    expect(result.availableAdd).toBe(10)
  })

  it('连击 ≥3 额外 +1', () => {
    const result = calcScore(5, 3, false, false, false)
    expect(result.totalAdd).toBe(6) // 5 + 1
    expect(result.bonuses).toContainEqual({ reason: 'combo', combo: 3, extra: 1 })
  })

  it('连击 ≥5 额外 +2', () => {
    const result = calcScore(5, 5, false, false, false)
    expect(result.totalAdd).toBe(7) // 5 + 2
    expect(result.bonuses).toContainEqual({ reason: 'combo', combo: 5, extra: 2 })
  })

  it('连击 4 不触发 ≥5 奖励', () => {
    const result = calcScore(5, 4, false, false, false)
    expect(result.totalAdd).toBe(6) // 5 + 1 (only ≥3)
  })

  it('全对额外 +3', () => {
    const result = calcScore(8, 8, true, false, false)
    expect(result.totalAdd).toBe(13) // 8 + 2(combo≥5) + 3(perfect)
    expect(result.bonuses).toContainEqual({ reason: 'perfect', extra: 3 })
  })

  it('每日首次额外 +2', () => {
    const result = calcScore(3, 3, false, true, false)
    expect(result.totalAdd).toBe(6) // 3 + 1(combo) + 2(first)
    expect(result.bonuses).toContainEqual({ reason: 'first_today', extra: 2 })
  })

  it('连续 7 天额外 +5', () => {
    const result = calcScore(3, 3, false, false, true)
    expect(result.totalAdd).toBe(9) // 3 + 1(combo) + 5(streak)
    expect(result.bonuses).toContainEqual({ reason: 'streak_7', extra: 5 })
  })

  it('所有奖励叠加', () => {
    const result = calcScore(8, 8, true, true, true)
    // 8 + 2(combo≥5) + 3(perfect) + 2(first) + 5(streak) = 20
    expect(result.totalAdd).toBe(20)
    expect(result.availableAdd).toBe(20)
    expect(result.bonuses).toHaveLength(4)
  })

  it('totalAdd 和 availableAdd 始终相等', () => {
    const cases = [
      [0, 0, false, false, false],
      [5, 3, true, true, true],
      [8, 8, true, true, true],
    ]
    for (const args of cases) {
      const result = calcScore(...args)
      expect(result.totalAdd).toBe(result.availableAdd)
    }
  })
})
