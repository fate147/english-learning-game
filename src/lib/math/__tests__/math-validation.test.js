import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const COURSES_DIR = path.resolve(__dirname, '..', 'courses')

const VALID_STAGES = ['concrete', 'pictorial', 'abstract', 'synthesis']

// ─── 辅助：解析并验证算式 ───

/**
 * 从文本中提取「最后一个 = 数字」等式，验证算术。
 * 跳过分数（右端含 `/`）、时间（含 `:`）、估算（含 `≈`）。
 *
 * 对正确选项中的算式做断言，错误选项仅收集报告。
 */
function verifyOptionArithmetic(text, isCorrect) {
  // 跳过分数答案（如 5/8、2/6）
  if (/=\s*\d+\s*\/\s*\d+/.test(text)) return { skip: true }

  // 跳过时间算式（如 8:00 + 40分 = 8:40）
  if (/\d+:\d+/.test(text)) return { skip: true }

  // 跳过 ≈
  if (text.includes('≈')) return { skip: true }

  // 多步算式处理：找到最后一个 = 数字 作为最终答案，
  // 取整个文本中最后一个 = 左侧的算式整体
  const lastEqIdx = text.lastIndexOf('=')
  if (lastEqIdx === -1) return { skip: true }

  const rightPart = text.slice(lastEqIdx + 1).trim()
  const statedMatch = rightPart.match(/^(\d+(?:\.\d+)?)/)
  if (!statedMatch) return { skip: true }
  const stated = parseFloat(statedMatch[1])

  // 从左侧提取最终表达式：取最后一个含运算符的片段
  const leftPart = text.slice(0, lastEqIdx)

  // 从左侧提取可评估的表达式：从最后一个数字+运算符开始
  // 策略：取左侧文本中的最后一个完整数学表达式（含运算符号）
  const exprMatch = leftPart.match(/([\d\s+\-×÷*/().]+\d)\s*$/)
  if (!exprMatch) return { skip: true }
  let expr = exprMatch[1].trim()

  // 如果表达式不含运算符但不是纯数字（如单位换算），跳过
  if (!/[+\-×÷*]/.test(expr) && /\D/.test(expr)) return { skip: true }
  // 纯数字但不是运算符，可能只是文本数字
  if (!/[+\-×÷*]/.test(expr)) return { skip: true }

  const actual = evaluateExpr(expr)
  if (actual === null || isNaN(actual)) return { skip: true }

  const pass = Math.abs(actual - stated) < 0.01

  if (pass) return { skip: false, pass: true }

  if (!isCorrect) {
    return { skip: false, pass: false, severity: 'info', message: `(干扰项) ${expr} = ${stated}，实际应为 ${actual.toFixed(2)}` }
  }

  return { skip: false, pass: false, severity: 'error', message: `${expr} = ${stated}，实际应为 ${actual.toFixed(2)}` }
}

function evaluateExpr(expr) {
  try {
    let e = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/\s+/g, '')
    if (!/^[\d+\-*/().]+$/.test(e)) return null
    return Function(`"use strict"; return (${e})`)()
  } catch {
    return null
  }
}

// ─── 收集所有题目 ───

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

// ─── 测试 ───

describe('🧮 数学试题 — 结构校验 (Layer 1)', () => {
  const all = loadAllQuestions()

  it('每个文件是数组，含 6~10 题', () => {
    for (const { file, questions } of all) {
      expect(
        Array.isArray(questions),
        `${file}: 期望数组，实际 ${typeof questions}`,
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

  it('每题有完整字段', () => {
    for (const { file, questions } of all) {
      for (const q of questions) {
        expect(q.id, `${file}/${q.id}: 缺 id`).toBeTruthy()
        expect(q.stage, `${file}/${q.id}: 缺 stage`).toBeTruthy()
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
          `${file}/${q.id}: ID 格式不正确（期望 m_g3s1uN_NN）`,
        ).toMatch(/^m_g3s[12]u\d+_\d{2}$/)
        expect(ids.has(q.id), `${file}/${q.id}: ID 重复`).toBe(false)
        ids.add(q.id)
      }
    }
  })
})

describe('🧮 数学试题 — 算术自动验算 (Layer 2)', () => {
  const all = loadAllQuestions()

  it('正确选项中的算式应算数正确', () => {
    const errors = []
    let verifiedCount = 0

    for (const { file, questions } of all) {
      for (const q of questions) {
        for (const opt of q.options) {
          if (!opt.correct) continue
          const result = verifyOptionArithmetic(opt.text, true)
          if (!result.skip) {
            verifiedCount++
            if (!result.pass) {
              errors.push(`${file}/${q.id} 正确项 "${opt.text}": ${result.message}`)
            }
          }
        }
      }
    }

    if (errors.length > 0) {
      throw new Error(
        `正确选项中有 ${errors.length} 处算术错误（已验算 ${verifiedCount} 条）：\n` +
          errors.join('\n'),
      )
    }

    // 至少验算了若干条
    expect(verifiedCount).toBeGreaterThanOrEqual(20)
  })

  it('错误选项中的算式错误已标记留待人工复核', () => {
    const warnings = []

    for (const { file, questions } of all) {
      for (const q of questions) {
        for (const opt of q.options) {
          if (opt.correct) continue
          const result = verifyOptionArithmetic(opt.text, false)
          if (result.severity === 'info') {
            warnings.push(`${file}/${q.id}: ${result.message}`)
          }
        }
      }
    }

    if (warnings.length > 0) {
      console.warn(
        `\n⚠️  干扰项算式异常 ${warnings.length} 处（供人工复核）：\n` +
          warnings.map(w => `  ${w}`).join('\n'),
      )
    }
  })
})

describe('🧮 数学试题 — CPA 框架校验 (Layer 3)', () => {
  const all = loadAllQuestions()

  it('stage 值合法', () => {
    for (const { file, questions } of all) {
      for (const q of questions) {
        expect(
          VALID_STAGES.includes(q.stage),
          `${file}/${q.id}: stage "${q.stage}" 非法，期望 ${VALID_STAGES.join('|')}`,
        ).toBe(true)
      }
    }
  })

  it('concrete/pictorial 阶应有 visual 字段', () => {
    for (const { file, questions } of all) {
      for (const q of questions) {
        if (q.stage === 'concrete' || q.stage === 'pictorial') {
          expect(
            q.visual,
            `${file}/${q.id}: ${q.stage} 应有 visual 字段`,
          ).toBeTruthy()
        }
      }
    }
  })

  it('abstract/synthesis 阶不要求 visual（为 null 或 undefined 均可）', () => {
    for (const { file, questions } of all) {
      for (const q of questions) {
        if (q.stage === 'abstract' || q.stage === 'synthesis') {
          // visual 可以是 null 或 undefined，但不能是非 null 字符串
          if (q.visual != null) {
            expect(
              q.visual,
              `${file}/${q.id}: ${q.stage} 的 visual 不应有值`,
            ).toBeUndefined()
          }
        }
      }
    }
  })

  it('每单元覆盖 ≥3 种 stage', () => {
    for (const { file, questions } of all) {
      const stages = new Set(questions.map(q => q.stage))
      expect(
        stages.size,
        `${file}: 仅覆盖 ${stages.size} 种 stage（${[...stages].join(',')}），期望 ≥3`,
      ).toBeGreaterThanOrEqual(3)
    }
  })
})
