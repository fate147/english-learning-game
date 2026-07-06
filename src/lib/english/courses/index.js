// 英语对话题库索引 — AI 生成内容，无需手动维护
// 每次新加年级/单元只需在此 import

import g3s1u1 from './dialogue_g3s1_u1.json'
import g3s1u2 from './dialogue_g3s1_u2.json'
import g3s1u3 from './dialogue_g3s1_u3.json'
import g3s1u4 from './dialogue_g3s1_u4.json'
import g3s1u5 from './dialogue_g3s1_u5.json'
import g3s1u6 from './dialogue_g3s1_u6.json'
import g3s2u1 from './dialogue_g3s2_u1.json'
import g3s2u2 from './dialogue_g3s2_u2.json'
import g3s2u3 from './dialogue_g3s2_u3.json'
import g3s2u4 from './dialogue_g3s2_u4.json'
import g3s2u5 from './dialogue_g3s2_u5.json'
import g3s2u6 from './dialogue_g3s2_u6.json'

// 所有对话数据按单元索引
const DIALOGUE_MAP = {
  1: g3s1u1,
  2: g3s1u2,
  3: g3s1u3,
  4: g3s1u4,
  5: g3s1u5,
  6: g3s1u6,
  7: g3s2u1,
  8: g3s2u2,
  9: g3s2u3,
  10: g3s2u4,
  11: g3s2u5,
  12: g3s2u6,
}

// 每个单元 8 轮对话，单元编号：1-6 上册，7-12 下册
function getDialoguesForUnits(unitIds) {
  const all = []
  unitIds.forEach((uid) => {
    const unit = DIALOGUE_MAP[uid]
    if (unit) {
      unit.dialogues.forEach((d) => {
        all.push({
          id: d.id,
          unit: uid,
          npc: d.npc,
          cn: d.cn,
          choices: d.choices,
        })
      })
    }
  })
  return all
}

// 从指定单元中随机选 8 轮
export function pickRandomRounds(unitIds, count = 8) {
  const pool = getDialoguesForUnits(unitIds)
  // Fisher-Yates 洗牌
  const shuffled = [...pool]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, count)
}
