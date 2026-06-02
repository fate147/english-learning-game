import { getWordsByUnit } from '../lib/words.js'

// 题型
export const TYPE_IMAGE_CHOICE = 'image_choice'
export const TYPE_LETTER_FILL = 'letter_fill'

// Fisher-Yates 洗牌（均匀随机）
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * 获取一局游戏的题目集合（8题，交替出题）
 *
 * 优先级：newWords → dueWords → fillWords → masteredWords
 * 交替：1/3/5/7 听音选图，2/4/6/8 字母填空
 * 约束：新词+复习词 ≤ 5，每词每局只出现一次
 */
export function getQuestionSet({
  unit,
  wordProgressMap,
  unlockedWords,
  learnedWords,
}) {
  const unitWords = getWordsByUnit(unit)

  const newWords = unitWords.filter(
    (w) => unlockedWords.includes(w.id) && !wordProgressMap[w.id]
  )
  const fillWords = unitWords.filter((w) => {
    const wp = wordProgressMap[w.id]
    return wp && (wp.level === 2)
  })
  const dueWords = unitWords.filter((w) => {
    const wp = wordProgressMap[w.id]
    return wp && wp.level >= 3 && (!wp.next_review || new Date(wp.next_review) <= new Date())
  })
  const masteredWords = unitWords.filter(
    (w) => learnedWords.includes(w.id) && !dueWords.find((rw) => rw.id === w.id)
  )

  // 按优先级排列：newWords → dueWords → fillWords → masteredWords
  const priorityPool = shuffle([...newWords, ...dueWords, ...fillWords, ...masteredWords])

  // 选8题，新词+复习词不超过5
  const newDue = priorityPool.filter((w) => newWords.includes(w) || dueWords.includes(w)).slice(0, 5)
  const others = priorityPool.filter((w) => !newDue.find((s) => s.id === w.id)).slice(0, 8 - newDue.length)
  let selected = shuffle([...newDue, ...others]).slice(0, 8)

  // 还不到8题补位
  if (selected.length < 8) {
    const extra = shuffle(unitWords.filter((w) => !selected.find((s) => s.id === w.id)))
    selected.push(...extra.slice(0, 8 - selected.length))
  }

  // 交替题型：奇数位 ImageChoice，偶数位 LetterFill
  return selected.map((wordObj, index) => {
    const wp = wordProgressMap[wordObj.id]
    const stage = wp ? wp.level : 0
    // 第1/3/5/7题 → ImageChoice，第2/4/6/8题 → LetterFill
    const questionType = index % 2 === 0 ? TYPE_IMAGE_CHOICE : TYPE_LETTER_FILL

    return {
      wordId: wordObj.id,
      word: wordObj.word,
      meaning: wordObj.meaning,
      type: questionType,
      stage,
    }
  })
}

/**
 * 生成 ImageChoice 的干扰选项
 * 返回 [correctId, distractor1Id, distractor2Id, distractor3Id]
 */
export function generateChoices(correctId, unit, allUnitWords, exceptIds = []) {
  const pool = allUnitWords.filter(
    (w) => w.id !== correctId && !exceptIds.includes(w.id)
  )
  const shuffled = shuffle(pool)
  const distractors = shuffled.slice(0, 3).map((w) => w.id)

  // 混洗正确选项位置
  const choices = shuffle([correctId, ...distractors])
  return choices
}

/**
 * 生成 LetterFill 的空格
 * 默认隐藏 2-4 个字母（至少隐藏30%的字母）
 */
export function generateBlanks(word) {
  const letters = word.split('')
  const len = letters.length

  // 计算要隐藏的字母数（至少30%，至少2个，最多4个）
  const hideCount = Math.max(2, Math.min(4, Math.ceil(len * 0.4)))

  // 优先隐藏辅音，不隐藏首字母
  const vowels = 'aeiou'
  const indices = []
  for (let i = 1; i < len; i++) {
    if (!vowels.includes(letters[i].toLowerCase())) {
      indices.push(i)
    }
  }
  // 如果辅音不够，补元音
  for (let i = 1; i < len && indices.length < hideCount; i++) {
    if (!indices.includes(i)) {
      indices.push(i)
    }
  }

  const selected = shuffle(indices).slice(0, hideCount)
  selected.sort((a, b) => a - b)

  // 构建空槽
  const blanks = selected.map((index) => ({
    index,
    correctLetter: letters[index],
    filled: null,
  }))

  // 构建候选字母 Multiset
  const candidates = {}
  selected.forEach((index) => {
    const letter = letters[index].toLowerCase()
    candidates[letter] = (candidates[letter] || 0) + 1
  })
  // 加 2-3 个干扰字母
  const allLetters = 'abcdefghijklmnopqrstuvwxyz'
  const extraCount = Math.max(1, 3 - Object.keys(candidates).length)
  for (let i = 0; i < extraCount; i++) {
    const randLetter = allLetters[Math.floor(Math.random() * 26)]
    if (!candidates[randLetter]) {
      candidates[randLetter] = 1
    }
  }

  return { blanks, candidates }
}
