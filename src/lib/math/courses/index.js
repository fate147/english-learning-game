// 数学题库索引 — AI 生成内容，无需手动维护
// 出题规则：先下学期，轮过5次后加入上学期内容

import g3s1u1 from './g3_s1_u1.json'
import g3s1u2 from './g3_s1_u2.json'
import g3s1u3 from './g3_s1_u3.json'
import g3s1u4 from './g3_s1_u4.json'
import g3s1u5 from './g3_s1_u5.json'
import g3s1u6 from './g3_s1_u6.json'
import g3s1u7 from './g3_s1_u7.json'
import g3s1u8 from './g3_s1_u8.json'
import g3s1u9 from './g3_s1_u9.json'
import g3s2u1 from './g3_s2_u1.json'
import g3s2u2 from './g3_s2_u2.json'
import g3s2u3 from './g3_s2_u3.json'
import g3s2u4 from './g3_s2_u4.json'
import g3s2u5 from './g3_s2_u5.json'
import g3s2u6 from './g3_s2_u6.json'
import g3s2u7 from './g3_s2_u7.json'
import g3s2u8 from './g3_s2_u8.json'

const COURSES = {
  3: {
    1: [g3s1u1, g3s1u2, g3s1u3, g3s1u4, g3s1u5, g3s1u6, g3s1u7, g3s1u8, g3s1u9],
    2: [g3s2u1, g3s2u2, g3s2u3, g3s2u4, g3s2u5, g3s2u6, g3s2u7, g3s2u8],
  },
}

// 记录游戏轮次（用于判断是否轮过5次后加入上学期）
let gameRound = 0
const ROUNDS_BEFORE_SEMESTER1 = 5 // 轮过5次后加入上学期

// Fisher-Yates 洗牌
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// 获取指定年级的所有题目，打乱后返回 count 道
// 先下学期，轮过5次后加入上学期内容
export function pickMathQuestions(grade = 3, count = 8, semester = 2) {
  gameRound++

  const semesters = COURSES[grade]
  if (!semesters) return []

  let all = []

  // 下学期题目
  const semester2 = semesters[2]
  if (semester2) {
    semester2.forEach((unit) => {
      unit.forEach((q) => {
        all.push({ ...q, type: 'math_choice' })
      })
    })
  }

  // 轮过5次后加入上学期题目
  if (gameRound > ROUNDS_BEFORE_SEMESTER1) {
    const semester1 = semesters[1]
    if (semester1) {
      semester1.forEach((unit) => {
        unit.forEach((q) => {
          all.push({ ...q, type: 'math_choice' })
        })
      })
    }
  }

  return shuffle(all).slice(0, count)
}
