import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const COURSES_DIR = path.resolve(__dirname, '..', 'courses')

function loadAllDialogues() {
  const files = fs.readdirSync(COURSES_DIR).filter(
    f => f.endsWith('.json') && f !== 'index.js',
  )
  const all = []
  for (const file of files.sort()) {
    const data = JSON.parse(
      fs.readFileSync(path.join(COURSES_DIR, file), 'utf-8'),
    )
    all.push({ file, dialogue: data })
  }
  return all
}

describe('💬 英语对话 — 结构校验', () => {
  const all = loadAllDialogues()

  it('每个文件有 unit / topic / topicCn / dialogues', () => {
    for (const { file, dialogue } of all) {
      expect(dialogue.unit, `${file}: 缺 unit`).toBeTruthy()
      expect(dialogue.topic, `${file}: 缺 topic`).toBeTruthy()
      expect(dialogue.topicCn, `${file}: 缺 topicCn`).toBeTruthy()
      expect(
        Array.isArray(dialogue.dialogues) && dialogue.dialogues.length >= 4,
        `${file}: dialogues 需 ≥4`,
      ).toBe(true)
    }
  })

  it('每轮对话有完整字段（id / npc / cn / choices）', () => {
    for (const { file, dialogue } of all) {
      for (const d of dialogue.dialogues) {
        expect(d.id, `${file}/${d.id}: 缺 id`).toBeTruthy()
        expect(d.npc, `${file}/${d.id}: 缺 npc`).toBeTruthy()
        expect(d.cn, `${file}/${d.id}: 缺 cn`).toBeTruthy()
        expect(
          Array.isArray(d.choices) && d.choices.length >= 2,
          `${file}/${d.id}: choices 需 ≥2`,
        ).toBe(true)
        expect(
          d.choices.filter(c => c.correct).length,
          `${file}/${d.id}: 应恰好 1 个正确答案`,
        ).toBe(1)
      }
    }
  })

  it('choices 每项有 text / cn / correct', () => {
    for (const { file, dialogue } of all) {
      for (const d of dialogue.dialogues) {
        for (const c of d.choices) {
          expect(c.text, `${file}/${d.id}: choice 缺 text`).toBeTruthy()
          expect(c.cn, `${file}/${d.id}: choice 缺 cn`).toBeTruthy()
          expect(
            typeof c.correct,
            `${file}/${d.id}: choice.correct 应为 boolean`,
          ).toBe('boolean')
        }
      }
    }
  })

  it('ID 格式正确且不重复', () => {
    const ids = new Set()
    for (const { file, dialogue } of all) {
      expect(dialogue.dialogues.length).toBeGreaterThanOrEqual(4)
      for (const d of dialogue.dialogues) {
        expect(
          d.id,
          `${file}/${d.id}: ID 格式不正确（期望 dial_g3s1uN_NN）`,
        ).toMatch(/^dial_g3s[12]u\d+_\d{2}$/)
        expect(ids.has(d.id), `${file}/${d.id}: ID 重复`).toBe(false)
        ids.add(d.id)
      }
    }
  })
})
