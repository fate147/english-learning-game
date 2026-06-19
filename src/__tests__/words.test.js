import { describe, it, expect } from 'vitest'
import { getWordsByUnit, getWordById, WORDS } from '../lib/words.js'

describe('WORDS', () => {
  it('包含 210 个单词', () => {
    expect(WORDS.length).toBe(210)
  })

  it('每个单词有 id, word, meaning, phonetic, unit', () => {
    for (const w of WORDS) {
      expect(w).toHaveProperty('id')
      expect(w).toHaveProperty('word')
      expect(w).toHaveProperty('meaning')
      expect(w).toHaveProperty('phonetic')
      expect(w).toHaveProperty('unit')
    }
  })

  it('ID 不重复', () => {
    const ids = WORDS.map(w => w.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('unit 范围为 1-6', () => {
    const units = new Set(WORDS.map(w => w.unit))
    expect(Math.min(...units)).toBe(1)
    expect(Math.max(...units)).toBe(6)
  })
})

describe('getWordsByUnit', () => {
  it('Unit 1 有 27 个单词', () => {
    const words = getWordsByUnit(1)
    expect(words.length).toBe(27)
  })

  it('返回的都是该单元的单词', () => {
    const words = getWordsByUnit(3)
    for (const w of words) {
      expect(w.unit).toBe(3)
    }
  })

  it('不存在的单元返回空数组', () => {
    const words = getWordsByUnit(99)
    expect(words).toHaveLength(0)
  })
})

describe('getWordById', () => {
  it('能找到已存在的单词', () => {
    const word = getWordById('apple')
    expect(word).not.toBeNull()
    expect(word.word).toBe('apple')
    expect(word.meaning).toBe('苹果')
  })

  it('找不到的单词返回 null', () => {
    const word = getWordById('nonexistent')
    expect(word).toBeNull()
  })

  it('大小写敏感', () => {
    const word = getWordById('Apple')
    expect(word).toBeNull()
  })
})
