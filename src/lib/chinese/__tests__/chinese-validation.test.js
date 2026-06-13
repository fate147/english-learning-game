import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const COURSES_DIR = path.resolve(__dirname, '..', 'courses')

const VALID_STAGES = [1, 2, 3, 4, 5]

function loadAllQuestions() {
  const files = fs.readdirSync(COURSES_DIR).filter(
    f => f.endsWith('.json') && f !== 'index.js',
  )
  const all = []
  for (const file of files.sort()) {
    const data = JSON.parse(
      fs.readFileSync(path.join(COURSES_DIR, file), 'utf-8'),
    )
    all.push({ file, questions: data })
  }
  return all
}

describe('🈶 语文试题 — 结构校验', () => {
  const all = loadAllQuestions()
  const totalQuestions = all.reduce((s, f) => s + f.questions.length, 0)

  it('每个文件是数组，含 6~10 题', () => {
    for (const { file, questions } of all) {
      expect(
        Array.isArray(questions),
        `${file}: 期望数组`,
      ).toBe(true)
      expect(
        questions.length,
        `${file}: 题数 ${questions.length}，期望 6~10`,
      ).toBeGreaterThanOrEqual(6)
      expect(
        questions.length,
        `${file}: 题数 ${questions.length}，期望 ≤10`,
      ).toBeLessThanOrEqual(10)
    }
  })

  it('每题有完整字段（id / stage / passage / question / options）', () => {
    for (const { file, questions } of all) {
      for (const q of questions) {
        expect(q.id, `${file}/${q.id}: 缺 id`).toBeTruthy()
        expect(q.stage, `${file}/${q.id}: 缺 stage`).toBeTruthy()
        expect(q.passage, `${file}/${q.id}: 缺 passage`).toBeTruthy()
        expect(q.question, `${file}/${q.id}: 缺 question`).toBeTruthy()
        expect(
          Array.isArray(q.options) && q.options.length >= 2,
          `${file}/${q.id}: options 需 ≥2`,
        ).toBe(true)
        expect(
          q.options.filter(o => o.correct).length,
          `${file}/${q.id}: 应恰好 1 个正确答案`,
        ).toBe(1)
      }
    }
  })

  it('ID 格式正确且不重复', () => {
    const ids = new Set()
    for (const { file, questions } of all) {
      for (const q of questions) {
        expect(
          q.id,
          `${file}/${q.id}: ID 格式不正确（期望 ch_g3s1uN_NN）`,
        ).toMatch(/^ch_g3s[12]u\d+_\d{2}$/)
        expect(ids.has(q.id), `${file}/${q.id}: ID 重复`).toBe(false)
        ids.add(q.id)
      }
    }
  })

  it('stage 值为 1~5 整数', () => {
    for (const { file, questions } of all) {
      for (const q of questions) {
        expect(
          VALID_STAGES.includes(q.stage),
          `${file}/${q.id}: stage "${q.stage}" 非法，期望 1~5`,
        ).toBe(true)
      }
    }
  })

  it('每单元 stage 覆盖 ≥4 种', () => {
    for (const { file, questions } of all) {
      const stages = new Set(questions.map(q => q.stage))
      expect(
        stages.size,
        `${file}: 仅覆盖 ${stages.size} 种 stage（${[...stages].sort().join(',')}），期望 ≥4`,
      ).toBeGreaterThanOrEqual(4)
    }
  })

  it('stage 5（综合）题有跨段落 passage', () => {
    for (const { file, questions } of all) {
      for (const q of questions) {
        if (q.stage === 5) {
          expect(
            q.passage.length,
            `${file}/${q.id}: stage 5 应有较长 passage`,
          ).toBeGreaterThan(50)
        }
      }
    }
  })
})
