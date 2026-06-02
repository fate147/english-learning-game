// 四个角色配置 + 对话库
export const CHARACTERS = [
  {
    id: 'dragon',
    name: '小龙',
    emoji: '🐉',
    image: 'dragon',
    ext: 'png',
    correctDialogues: ['太棒了！', '你真厉害！', '继续加油！', '好聪明呀！', '真不错！', '你做到了！'],
    wrongDialogues: ['没关系，再来一次！', '你可以的！', '加油哦！', '再想想嘛~', '小龙相信你！'],
  },
  {
    id: 'dino',
    name: '霸王龙',
    emoji: '🦖',
    image: 'dino',
    ext: 'png',
    correctDialogues: ['吼！答对了！', '强啊！', '无敌！', '太猛了！', '霸王龙为你骄傲！', '帅！'],
    wrongDialogues: ['吼…再试试！', '别灰心！', '霸王龙陪你！', '再来一题！', '别急，慢慢来！'],
  },
  {
    id: 'wukong',
    name: '孙悟空',
    emoji: '🐵',
    image: 'wukong',
    ext: 'png',
    correctDialogues: ['俺老孙服了！', '厉害厉害！', '好！', '妙啊！', '这都难不倒你！', '有进步！'],
    wrongDialogues: ['不打紧，再战！', '俺老孙挺你！', '莫怕莫怕！', '下回一定行！', '老孙给你加油！'],
  },
  {
    id: 'tiger',
    name: '老虎',
    emoji: '🐯',
    image: 'tiger',
    ext: 'png',
    correctDialogues: ['好样的！', '真威风！', '漂亮！', '太厉害了！', '老虎给你点赞！', '真棒！'],
    wrongDialogues: ['别泄气！', '再冲一次！', '你可以的！', '再来！老虎陪着你！', '加油！'],
  },
]

export function getCharacter(id) {
  return CHARACTERS.find((c) => c.id === id) || CHARACTERS[0]
}

export function getRandomDialogue(characterId, isCorrect) {
  const char = getCharacter(characterId)
  const pool = isCorrect ? char.correctDialogues : char.wrongDialogues
  return pool[Math.floor(Math.random() * pool.length)]
}
