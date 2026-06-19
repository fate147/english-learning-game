import { describe, it, expect } from 'vitest'
import { generateBlanks, generateChoices, getQuestionSet, TYPE_IMAGE_CHOICE, TYPE_LETTER_FILL } from '../engines/questionEngine.js'

describe('generateBlanks', () => {
  it('返回 blanks 和 candidates', () => {
    const result = generateBlanks('hello')
    expect(result).toHaveProperty('blanks')
    expect(result).toHaveProperty('candidates')
    expect(Array.isArray(result.blanks)).toBe(true)
    expect(typeof result.candidates).toBe('object')
  })

  it('隐藏 2-4 个字母', () => {
    const result = generateBlanks('beautiful')
    expect(result.blanks.length).toBeGreaterThanOrEqual(2)
    expect(result.blanks.length).toBeLessThanOrEqual(4)
  })

  it('不隐藏首字母', () => {
    const result = generateBlanks('apple')
    const indices = result.blanks.map(b => b.index)
    expect(indices).not.toContain(0)
  })

  it('每个 blank 有 correctLetter', () => {
    const result = generateBlanks('school')
    for (const blank of result.blanks) {
      expect(blank).toHaveProperty('correctLetter')
      expect(blank.correctLetter).toMatch(/^[a-zA-Z]$/)
    }
  })

  it('candidates 至少包含 3 个不同字母', () => {
    const result = generateBlanks('basketball')
    expect(Object.keys(result.candidates).length).toBeGreaterThanOrEqual(3)
  })

  it('短单词（3字母）也能正常处理', () => {
    const result = generateBlanks('cat')
    expect(result.blanks.length).toBeGreaterThanOrEqual(2)
  })
})

describe('generateChoices', () => {
  const allWords = [
    { id: 'apple', word: 'apple' },
    { id: 'banana', word: 'banana' },
    { id: 'cat', word: 'cat' },
    { id: 'dog', word: 'dog' },
    { id: 'egg', word: 'egg' },
  ]

  it('返回 4 个选项', () => {
    const choices = generateChoices('apple', 1, allWords)
    expect(choices).toHaveLength(4)
  })

  it('包含正确答案', () => {
    const choices = generateChoices('apple', 1, allWords)
    expect(choices).toContain('apple')
  })

  it('不包含排除的选项', () => {
    const choices = generateChoices('apple', 1, allWords, ['banana'])
    expect(choices).not.toContain('banana')
  })

  it('正确答案只出现一次', () => {
    const choices = generateChoices('apple', 1, allWords)
    expect(choices.filter(c => c === 'apple')).toHaveLength(1)
  })
})

describe('getQuestionSet', () => {
  const unlockedWords = ['apple', 'banana', 'cat', 'dog', 'egg', 'fish', 'grape', 'hat']

  it('返回 8 题', () => {
    const questions = getQuestionSet({
      unit: 1,
      wordProgressMap: {},
      unlockedWords,
      learnedWords: [],
    })
    expect(questions).toHaveLength(8)
  })

  it('题型交替：偶数位 ImageChoice，奇数位 LetterFill', () => {
    const questions = getQuestionSet({
      unit: 1,
      wordProgressMap: {},
      unlockedWords,
      learnedWords: [],
    })
    questions.forEach((q, i) => {
      if (i % 2 === 0) {
        expect(q.type).toBe(TYPE_IMAGE_CHOICE)
      } else {
        expect(q.type).toBe(TYPE_LETTER_FILL)
      }
    })
  })

  it('每题有 wordId, word, meaning, type, stage', () => {
    const questions = getQuestionSet({
      unit: 1,
      wordProgressMap: {},
      unlockedWords,
      learnedWords: [],
    })
    for (const q of questions) {
      expect(q).toHaveProperty('wordId')
      expect(q).toHaveProperty('word')
      expect(q).toHaveProperty('meaning')
      expect(q).toHaveProperty('type')
      expect(q).toHaveProperty('stage')
    }
  })

  it('新词的 stage 为 0', () => {
    const questions = getQuestionSet({
      unit: 1,
      wordProgressMap: {},
      unlockedWords,
      learnedWords: [],
    })
    for (const q of questions) {
      expect(q.stage).toBe(0)
    }
  })

  it('有进度的词 stage 取自 wordProgressMap', () => {
    const wordProgressMap = { apple: { level: 3 } }
    const questions = getQuestionSet({
      unit: 1,
      wordProgressMap,
      unlockedWords,
      learnedWords: [],
    })
    const appleQ = questions.find(q => q.wordId === 'apple')
    if (appleQ) expect(appleQ.stage).toBe(3)
  })

  it('解锁词不足 8 个时也能返回题目（补位）', () => {
    const questions = getQuestionSet({
      unit: 1,
      wordProgressMap: {},
      unlockedWords: ['apple', 'banana'],
      learnedWords: [],
    })
    expect(questions.length).toBeGreaterThan(0)
    expect(questions.length).toBeLessThanOrEqual(8)
  })
})
