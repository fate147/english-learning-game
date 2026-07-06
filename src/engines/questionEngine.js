import { WORDS } from '../lib/words.js'

// 题型
const TYPE_IMAGE_CHOICE = 'image_choice'
const TYPE_LETTER_FILL = 'letter_fill'

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
 * 从所有已解锁单词中选题，跨单元混合
 * 优先级：newWords → dueWords → fillWords → masteredWords
 * 学期顺序：先下册(semester:2)后上册(semester:1)
 * 交替：1/3/5/7 听音选图，2/4/6/8 字母填空
 * 约束：新词+复习词 ≤ 5，每词每局只出现一次
 */
export function getQuestionSet({
  wordProgressMap,
  unlockedWords,
  learnedWords,
}) {
  // 获取所有已解锁的单词（跨所有单元）
  const allUnlocked = WORDS.filter((w) => unlockedWords.includes(w.id))

  // 如果无已解锁单词，返回空
  if (allUnlocked.length === 0) return []

  const newWords = allUnlocked.filter(
    (w) => !wordProgressMap[w.id]
  )
  const fillWords = allUnlocked.filter((w) => {
    const wp = wordProgressMap[w.id]
    return wp && wp.level === 2
  })
  const dueWords = allUnlocked.filter((w) => {
    const wp = wordProgressMap[w.id]
    return wp && wp.level >= 3 && (!wp.next_review || new Date(wp.next_review) <= new Date())
  })
  const masteredWords = allUnlocked.filter(
    (w) => learnedWords.includes(w.id) && !dueWords.find((rw) => rw.id === w.id)
  )

  // 按优先级排列，先下册(semester:2)后上册(semester:1)
  const sortBySemester = (a, b) => {
    const sa = a.semester || 2
    const sb = b.semester || 2
    if (sa !== sb) return sb - sa // 下册优先
    return 0
  }
  const priorityPool = shuffle([...newWords, ...dueWords, ...fillWords, ...masteredWords].sort(sortBySemester))

  // 选8题，新词+复习词不超过5
  const newDue = priorityPool.filter((w) => newWords.includes(w) || dueWords.includes(w)).slice(0, 5)
  const others = priorityPool.filter((w) => !newDue.find((s) => s.id === w.id)).slice(0, 8 - newDue.length)
  let selected = shuffle([...newDue, ...others]).slice(0, 8)

  // 还不到8题，从所有已解锁词中补位
  if (selected.length < 8) {
    const extra = shuffle(allUnlocked.filter((w) => !selected.find((s) => s.id === w.id)))
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
      unit: wordObj.unit,
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

  // 单字母词：唯一字母作为填空位
  if (len === 1) {
    const letterPool = [letters[0].toLowerCase()]
    const allLetters = 'abcdefghijklmnopqrstuvwxyz'
    for (let i = 0; i < 3; i++) {
      let r
      do { r = allLetters[Math.floor(Math.random() * 26)] } while (r === letters[0].toLowerCase())
      letterPool.push(r)
    }
    const candidates = {}
    shuffle(letterPool).forEach(l => { candidates[l] = (candidates[l] || 0) + 1 })
    return { blanks: [{ index: 0, correctLetter: letters[0], filled: null }], candidates }
  }

  // 计算要隐藏的字母数（至少30%，至少2个，最多5个）
  const hideCount = Math.max(2, Math.min(5, Math.ceil(len * 0.45)))

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

  // 收集所有需要填的字母（正确字母 + 干扰字母）
  const letterPool = []
  selected.forEach((index) => {
    letterPool.push(letters[index].toLowerCase())
  })

  // 加 3-4 个干扰字母
  const allLetters = 'abcdefghijklmnopqrstuvwxyz'
  const extraCount = 3 + Math.floor(Math.random() * 2) // 3-4 个
  for (let i = 0; i < extraCount; i++) {
    let randLetter
    do {
      randLetter = allLetters[Math.floor(Math.random() * 26)]
    } while (letterPool.includes(randLetter))
    letterPool.push(randLetter)
  }

  // 打乱字母顺序
  const shuffledPool = shuffle(letterPool)

  // 转为 Multiset（保持打乱后的顺序）
  const candidates = {}
  shuffledPool.forEach((letter) => {
    candidates[letter] = (candidates[letter] || 0) + 1
  })

  return { blanks, candidates }
}
