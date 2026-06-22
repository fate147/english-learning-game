// 数学题库索引 — AI 生成内容，无需手动维护

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

// 获取指定年级的所有题目，打乱后返回 count 道
// 默认只出下学期（semester 2），后面可通过第二个参数调回
export function pickMathQuestions(grade = 3, count = 8, semester = 2) {
  const semesters = COURSES[grade]
  if (!semesters) return []
  const all = []
  const target = semesters[semester]
  if (target) {
    target.forEach((unit) => {
      unit.forEach((q) => {
        all.push({ ...q, type: 'math_choice' })
      })
    })
  }
  // Fisher-Yates 洗牌
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[all[i], all[j]] = [all[j], all[i]]
  }
  return all.slice(0, count)
}
