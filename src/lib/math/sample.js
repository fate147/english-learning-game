// 数学「CPA 题目侦探」样题 — 8 题一局
export const SAMPLE_QUESTIONS = [
  // 第一阶：Concrete 看图识意（第1-2题）
  {
    id: 'm_01',
    stage: 'concrete',
    visual: '🍎 🍎 🍎 🍎 🍎\n🍎 🍎 🍎 🍎 🍎\n🍎 🍎 🍎 🍎 🍎',
    question: '上面这些苹果，用哪个算式表示？',
    options: [
      { text: '2 + 5 = 7', correct: false },
      { text: '3 × 5 = 15', correct: true },
      { text: '3 + 5 = 8', correct: false },
    ],
  },
  {
    id: 'm_02',
    stage: 'concrete',
    visual: '🐟 🐟 🐟 🐟\n🐟 🐟 🐟 🐟\n🐟 🐟 🐟 🐟\n🐟 🐟 🐟 🐟',
    question: '一共有多少条鱼？选正确的算式。',
    options: [
      { text: '4 + 4 + 4 = 12', correct: false },
      { text: '4 × 4 = 16', correct: true },
      { text: '4 + 4 = 8', correct: false },
    ],
  },
  // 第二阶：Pictorial 看图选故事（第3-4题）
  {
    id: 'm_03',
    stage: 'pictorial',
    visual: '┌─────────────┐\n│      ?      │\n├──────┬──────┤\n│  24  │  24  │\n└──────┴──────┘',
    question: '上面的图形条，表示下面哪个故事？',
    options: [
      { text: '小明有24颗糖，分给2个朋友，每人几颗？', correct: false },
      { text: '小红有2盒饼干，每盒24块，一共多少块？', correct: true },
      { text: '小明有24本书，又买了2本，一共几本？', correct: false },
    ],
  },
  {
    id: 'm_04',
    stage: 'pictorial',
    visual: '┌────┐\n│ 15 │\n├────┤\n│ 15 │\n├────┤\n│ 15 │\n└────┘',
    question: '下面的图表示"3个15"，哪个故事符合？',
    options: [
      { text: '小明有15元钱，花了3元，还剩多少？', correct: false },
      { text: '停车场有3排停车位，每排15个，一共几个？', correct: true },
      { text: '小红有3本书，小明有15本，谁多？', correct: false },
    ],
  },
  // 第三阶：Abstract 读懂题目（第5-6题）
  {
    id: 'm_05',
    stage: 'abstract',
    visual: null,
    question: '小明每分钟走 65 米，从家到学校走了 12 分钟，他家离学校有多远？',
    questionLabel: '这道题要我们算什么？',
    options: [
      { text: '65 和 12 哪个大', correct: false },
      { text: '65 个 12 加起来是多少', correct: true },
      { text: '65 减去 12 是多少', correct: false },
    ],
  },
  {
    id: 'm_06',
    stage: 'abstract',
    visual: null,
    question: '妈妈买了 3 种水果，苹果 12 个，梨 8 个，橘子 15 个。全家每天吃 5 个水果，够吃几天？',
    questionLabel: '要解决这个问题，需要用到哪几个数？',
    options: [
      { text: '12 + 8 = 20，20 - 5 = 15', correct: false },
      { text: '12 + 8 + 15 = 35，35 ÷ 5 = 7', correct: true },
      { text: '15 - 12 = 3，3 + 8 = 11', correct: false },
    ],
  },
  // 第四阶：综合 选同类模型（第7-8题）
  {
    id: 'm_07',
    stage: 'synthesis',
    visual: null,
    question: '妈妈买回 3 箱苹果，每箱 12 个，一共买了多少个？',
    questionLabel: '下面哪个故事跟这道题是"同一种算法"？',
    options: [
      { text: '小明有 5 个文具盒，每个里面放 8 支笔，一共多少支笔？', correct: true },
      { text: '小明有 5 个苹果，吃了 2 个，还剩几个？', correct: false },
      { text: '小明有 8 颗糖，分给 4 个朋友，每人几颗？', correct: false },
    ],
  },
  {
    id: 'm_08',
    stage: 'synthesis',
    visual: null,
    question: '学校有 45 棵树，每排种 5 棵，种了几排？',
    questionLabel: '下面哪个故事跟这道题的算法是一样的？',
    options: [
      { text: '有 36 本书，平均分给 4 个班，每班几本？', correct: true },
      { text: '小明有 45 颗糖，吃了 5 颗，还剩多少？', correct: false },
      { text: '每排种 6 棵，种了 5 排，一共多少棵？', correct: false },
    ],
  },
]
