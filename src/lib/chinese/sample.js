// 语文「故事小侦探」样题 — 8 题一局（覆盖五阶）
// 数据格式后续可按需调整
export const SAMPLE_QUESTIONS = [
  // 第一阶：选标题（第1-2题）
  {
    id: 'ch_01',
    stage: 1,
    passage: '西沙群岛是南海上的一群岛屿。那里的海水五光十色，海底有各种各样的珊瑚，鱼多得数不清。海滩上有美丽的贝壳，岛上还有茂密的树林。',
    question: '这篇短文最合适的标题是什么？',
    options: [
      { text: '美丽的海岛', correct: false },
      { text: '富饶的西沙群岛', correct: true },
      { text: '海底世界', correct: false },
    ],
  },
  {
    id: 'ch_02',
    stage: 1,
    passage: '荷花已经开了不少了。荷叶挨挨挤挤的，像一个个碧绿的大圆盘。白荷花在这些大圆盘之间冒出来。有的才展开两三片花瓣儿。有的花瓣儿全都展开了，露出嫩黄色的小莲蓬。',
    question: '最适合上面这段话的标题是？',
    options: [
      { text: '美丽的荷花', correct: true },
      { text: '荷叶大圆盘', correct: false },
      { text: '莲蓬真可爱', correct: false },
    ],
  },
  // 第二阶：选段落大意（第3-4题）
  {
    id: 'ch_03',
    stage: 2,
    passage: '赵州桥非常雄伟。桥长五十多米，有九米多宽，中间行车马，两旁走人。这么长的桥，全部用石头砌成，下面没有桥墩，只有一个拱形的大桥洞，横跨在三十七米多宽的河面上。',
    question: '这段话主要讲了什么？',
    options: [
      { text: '赵州桥有多长多宽', correct: false },
      { text: '赵州桥的雄伟和结构特点', correct: true },
      { text: '桥下面没有桥墩', correct: false },
    ],
  },
  {
    id: 'ch_04',
    stage: 2,
    passage: '海底的岩石上长着各种各样的珊瑚，有的像绽开的花朵，有的像分枝的鹿角。海参到处都是，在海底懒洋洋地蠕动。大龙虾全身披甲，划过来划过去，样子挺威武。',
    question: '这段话主要描写了什么？',
    options: [
      { text: '海底的岩石很漂亮', correct: false },
      { text: '海底的各种生物', correct: true },
      { text: '大龙虾很威武', correct: false },
    ],
  },
  // 第三阶：推理理解（第5-6题）
  {
    id: 'ch_05',
    stage: 3,
    passage: '英子犹豫了一会儿，慢吞吞地站了起来，眼圈红红的。在全班同学的注视下，她终于一摇一晃地走上了讲台。',
    question: '英子为什么"眼圈红红的"？',
    options: [
      { text: '她生病了', correct: false },
      { text: '她紧张、害怕被嘲笑', correct: true },
      { text: '她刚才哭过', correct: false },
    ],
  },
  {
    id: 'ch_06',
    stage: 3,
    passage: '父亲说："你们要像花生，它虽然不好看，可是很有用。" 我说："那么，人要做有用的人，不要做只讲体面，而对别人没有好处的人。"',
    question: '父亲想通过花生告诉孩子们什么道理？',
    options: [
      { text: '花生很好吃', correct: false },
      { text: '人要有真本事，不要只图外表', correct: true },
      { text: '种花生很辛苦', correct: false },
    ],
  },
  // 第四阶：关键词填空（第7题）
  {
    id: 'ch_07',
    stage: 4,
    passage: '西沙群岛一带海水五光十色，瑰丽无比：有深蓝的，淡青的，浅绿的，杏黄的。海底有珊瑚、海参、大龙虾，还有各种各样的鱼。',
    question: '下面哪句话最能概括上面的内容？',
    options: [
      { text: '西沙群岛的海水颜色很多', correct: false },
      { text: '西沙群岛的海水美、海底生物多', correct: true },
      { text: '西沙群岛的鱼很多', correct: false },
    ],
  },
  // 第五阶：Bonus 概括（第8题 — 选择题形式简化）
  {
    id: 'ch_08',
    stage: 5,
    passage: '夏天，树木长得葱葱茏茏，密密层层的枝叶把森林封得严严实实的，挡住了人们的视线，遮住了蓝蓝的天空。早晨，雾从山谷里升起来，整个森林浸在乳白色的浓雾里。',
    question: '这段话描写的是什么时候的景色？',
    options: [
      { text: '春天的森林', correct: false },
      { text: '夏天的森林', correct: true },
      { text: '秋天的森林', correct: false },
    ],
  },
]
