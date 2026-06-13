// 三科配置
// 新加科目只需在此添加条目
export const SUBJECTS = {
  english: {
    id: 'english',
    name: '英语',
    icon: '🔤',
    modes: ['game', 'memory', 'dialogue'],
    defaultMode: 'game',
    stringsKey: 'english',
    // 当前仅三年级有内容，扩展后修改范围
    grades: { min: 3, max: 3 },
  },
  chinese: {
    id: 'chinese',
    name: '语文',
    icon: '🀄',
    modes: ['game'],
    defaultMode: 'game',
    stringsKey: 'chinese',
    grades: { min: 3, max: 3 },
  },
  math: {
    id: 'math',
    name: '数学',
    icon: '🔢',
    modes: ['game'],
    defaultMode: 'game',
    stringsKey: 'math',
    grades: { min: 3, max: 3 },
  },
}

// 默认科目
export const DEFAULT_SUBJECT = 'english'
// 默认年级（三年级）
export const DEFAULT_GRADE = 3

// 获取科目配置
export function getSubject(id) {
  return SUBJECTS[id] || SUBJECTS[DEFAULT_SUBJECT]
}

// 获取科目列表
export function getSubjectList() {
  return Object.values(SUBJECTS)
}

// 生成年级列表（如 [1,2,3,4,5,6]）
export function getGradeList(subjectId) {
  const subject = getSubject(subjectId)
  const { min, max } = subject.grades
  const grades = []
  for (let i = min; i <= max; i++) grades.push(i)
  return grades
}
