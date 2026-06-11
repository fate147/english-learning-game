/**
 * 英语对话模式 — 对话题库
 *
 * 每个场景包含：
 *   - id: 唯一标识
 *   - unit: 对应单元（1-6）
 *   - scenario: 中文场景描述
 *   - lines: 对话轮次数组（每轮 NPC 说一句，孩子从 choices 选回复）
 *
 * 句子保持简短，每轮只用一个简单句型，适合 8 岁孩子。
 * 每条 NPC 句子和选项配中文翻译（cn 字段）。
 */

export const DIALOGUES = [
  // ============ Unit 1: 感觉（feeling）============
  {
    id: "feeling_greeting",
    unit: 1,
    scenario: "打招呼",
    lines: [
      {
        npc: "Hello! How are you?",
        cn: "你好！你怎么样？",
        choices: [
          { text: "I'm happy!", cn: "我很开心！", correct: true },
          { text: "I'm a cake.", cn: "我是一个蛋糕。", correct: false },
          { text: "Goodbye!", cn: "再见！", correct: false },
        ],
      },
      {
        npc: "I'm tired. Let's play!",
        cn: "我累了。我们一起玩吧！",
        choices: [
          { text: "Yes! I like games!", cn: "好的！我喜欢游戏！", correct: true },
          { text: "No, I'm sad.", cn: "不，我很难过。", correct: false },
          { text: "I'm scared.", cn: "我很害怕。", correct: false },
        ],
      },
    ],
  },

  {
    id: "feeling_sorry",
    unit: 1,
    scenario: "道歉",
    lines: [
      {
        npc: "Oh no! My doll is broken.",
        cn: "哦不！我的玩偶坏了。",
        choices: [
          { text: "I'm sorry!", cn: "对不起！", correct: true },
          { text: "It's new.", cn: "它是新的。", correct: false },
          { text: "I'm happy.", cn: "我很开心。", correct: false },
        ],
      },
      {
        npc: "I'm sad. I like my doll.",
        cn: "我很难过。我喜欢我的玩偶。",
        choices: [
          { text: "Don't be sad.", cn: "别难过。", correct: true },
          { text: "I want to sleep.", cn: "我想睡觉。", correct: false },
          { text: "The doll is big.", cn: "玩偶很大。", correct: false },
        ],
      },
    ],
  },

  // ============ Unit 2: 身体（body）============
  {
    id: "body_song",
    unit: 2,
    scenario: "身体歌",
    lines: [
      {
        npc: "Let's sing! Touch your head!",
        cn: "我们一起唱歌！摸摸你的头！",
        choices: [
          { text: "OK! Here is my head!", cn: "好的！这是我的头！", correct: true },
          { text: "I like cats.", cn: "我喜欢猫。", correct: false },
          { text: "My foot is small.", cn: "我的脚很小。", correct: false },
        ],
      },
      {
        npc: "Now touch your nose!",
        cn: "现在摸摸你的鼻子！",
        choices: [
          { text: "Here is my nose!", cn: "这是我的鼻子！", correct: true },
          { text: "I want to eat.", cn: "我想吃东西。", correct: false },
          { text: "My ear is big.", cn: "我的耳朵很大。", correct: false },
        ],
      },
    ],
  },

  {
    id: "body_race",
    unit: 2,
    scenario: "赛跑",
    lines: [
      {
        npc: "Let's run! I like to race!",
        cn: "我们跑吧！我喜欢赛跑！",
        choices: [
          { text: "Yes! I love to run!", cn: "好的！我喜欢跑步！", correct: true },
          { text: "I want a prize.", cn: "我想要奖品。", correct: false },
          { text: "My leg hurts.", cn: "我的腿疼。", correct: false },
        ],
      },
      {
        npc: "You are fast! Here is a prize!",
        cn: "你跑得真快！给你奖品！",
        choices: [
          { text: "Thank you!", cn: "谢谢你！", correct: true },
          { text: "I don't like it.", cn: "我不喜欢。", correct: false },
          { text: "The bike is cool.", cn: "自行车很酷。", correct: false },
        ],
      },
    ],
  },

  // ============ Unit 3: 衣服（clothes）============
  {
    id: "clothes_shopping",
    unit: 3,
    scenario: "买衣服",
    lines: [
      {
        npc: "Look! A pretty dress!",
        cn: "看！一条漂亮的裙子！",
        choices: [
          { text: "Yes! It's so nice!", cn: "是的！真好看！", correct: true },
          { text: "I want a robot.", cn: "我想要机器人。", correct: false },
          { text: "The hat is big.", cn: "帽子很大。", correct: false },
        ],
      },
      {
        npc: "Try this shirt. It's cool!",
        cn: "试试这件衬衫。很酷！",
        choices: [
          { text: "Cool! I like it!", cn: "酷！我喜欢！", correct: true },
          { text: "I don't like shirts.", cn: "我不喜欢衬衫。", correct: false },
          { text: "The shoe is small.", cn: "鞋子很小。", correct: false },
        ],
      },
    ],
  },

  {
    id: "clothes_magic",
    unit: 3,
    scenario: "变魔术",
    lines: [
      {
        npc: "I'm a magician! Look at my hat!",
        cn: "我是魔术师！看我的帽子！",
        choices: [
          { text: "Wow! Make a shirt!", cn: "哇！变一件衬衫！", correct: true },
          { text: "I don't like magic.", cn: "我不喜欢魔术。", correct: false },
          { text: "The hat is ugly.", cn: "帽子好丑。", correct: false },
        ],
      },
      {
        npc: "Abracadabra! A new dress!",
        cn: "阿布拉卡达布拉！一条新裙子！",
        choices: [
          { text: "Amazing! Thank you!", cn: "太神奇了！谢谢你！", correct: true },
          { text: "I want to eat.", cn: "我想吃东西。", correct: false },
          { text: "I want trousers.", cn: "我想要裤子。", correct: false },
        ],
      },
    ],
  },

  // ============ Unit 4: 天气（weather）============
  {
    id: "weather_park",
    unit: 4,
    scenario: "去公园",
    lines: [
      {
        npc: "It's sunny! Let's go to the park!",
        cn: "天晴了！我们去公园吧！",
        choices: [
          { text: "Good idea! I love the park!", cn: "好主意！我喜欢公园！", correct: true },
          { text: "I like rainy days.", cn: "我喜欢下雨天。", correct: false },
          { text: "I want to swim.", cn: "我想游泳。", correct: false },
        ],
      },
      {
        npc: "Look! I can fly my kite!",
        cn: "看！我可以放风筝！",
        choices: [
          { text: "Cool! Let's fly!", cn: "酷！我们一起放！", correct: true },
          { text: "I don't have a kite.", cn: "我没有风筝。", correct: false },
          { text: "It's too cold.", cn: "太冷了。", correct: false },
        ],
      },
    ],
  },

  {
    id: "weather_seasons",
    unit: 4,
    scenario: "季节",
    lines: [
      {
        npc: "I like spring. It's warm.",
        cn: "我喜欢春天。很暖和。",
        choices: [
          { text: "I like summer. I can swim!", cn: "我喜欢夏天。我可以游泳！", correct: true },
          { text: "I don't like seasons.", cn: "我不喜欢季节。", correct: false },
          { text: "Spring is not fun.", cn: "春天不好玩。", correct: false },
        ],
      },
      {
        npc: "In winter, I throw snowballs!",
        cn: "冬天里，我扔雪球！",
        choices: [
          { text: "Yes! Winter is fun!", cn: "是的！冬天很好玩！", correct: true },
          { text: "I don't like cold.", cn: "我不喜欢冷。", correct: false },
          { text: "Let's go to the shop.", cn: "我们去商店吧。", correct: false },
        ],
      },
    ],
  },

  // ============ Unit 5: 日常（daily）============
  {
    id: "daily_week",
    unit: 5,
    scenario: "星期几",
    lines: [
      {
        npc: "Today is Monday! A new week!",
        cn: "今天是星期一！新的一周！",
        choices: [
          { text: "Yes! Let's have fun!", cn: "是的！我们一起开心玩！", correct: true },
          { text: "It's a cat.", cn: "它是一只猫。", correct: false },
          { text: "I don't know.", cn: "我不知道。", correct: false },
        ],
      },
      {
        npc: "On Saturday I play basketball.",
        cn: "星期六我打篮球。",
        choices: [
          { text: "Cool! I like basketball!", cn: "酷！我喜欢篮球！", correct: true },
          { text: "I like cooking.", cn: "我喜欢做饭。", correct: false },
          { text: "I play chess.", cn: "我下国际象棋。", correct: false },
        ],
      },
    ],
  },

  {
    id: "daily_dinner",
    unit: 5,
    scenario: "晚饭",
    lines: [
      {
        npc: "I'm cooking dinner!",
        cn: "我在做晚饭！",
        choices: [
          { text: "Yummy! I love food!", cn: "好吃！我喜欢美食！", correct: true },
          { text: "I don't like dinner.", cn: "我不喜欢晚饭。", correct: false },
          { text: "The room is small.", cn: "房间很小。", correct: false },
        ],
      },
      {
        npc: "I can cook Chinese food.",
        cn: "我会做中国菜。",
        choices: [
          { text: "Great! Chinese food is good!", cn: "太好了！中国菜很好吃！", correct: true },
          { text: "I like fish food.", cn: "我喜欢鱼食。", correct: false },
          { text: "I want to play.", cn: "我想玩。", correct: false },
        ],
      },
    ],
  },

  // ============ Unit 6: 食物（food）============
  {
    id: "food_picnic",
    unit: 6,
    scenario: "野餐",
    lines: [
      {
        npc: "Let's have a picnic!",
        cn: "我们去野餐吧！",
        choices: [
          { text: "Yes! I love picnics!", cn: "好的！我喜欢野餐！", correct: true },
          { text: "I don't like food.", cn: "我不喜欢食物。", correct: false },
          { text: "Let's play a game.", cn: "我们玩游戏吧。", correct: false },
        ],
      },
      {
        npc: "I have apples and milk.",
        cn: "我有苹果和牛奶。",
        choices: [
          { text: "I have juice and bread!", cn: "我有果汁和面包！", correct: true },
          { text: "I have a robot.", cn: "我有一个机器人。", correct: false },
          { text: "I have nothing.", cn: "我什么都没有。", correct: false },
        ],
      },
    ],
  },

  {
    id: "food_cooking",
    unit: 6,
    scenario: "帮妈妈做饭",
    lines: [
      {
        npc: "Help me cook dinner!",
        cn: "帮我做晚饭吧！",
        choices: [
          { text: "Sure! I can help!", cn: "当然！我可以帮忙！", correct: true },
          { text: "No, I'm tired.", cn: "不，我累了。", correct: false },
          { text: "I don't like soup.", cn: "我不喜欢汤。", correct: false },
        ],
      },
      {
        npc: "Wash the tomatoes. Peel the potatoes.",
        cn: "洗西红柿。削土豆皮。",
        choices: [
          { text: "OK! I can do that!", cn: "好的！我能做！", correct: true },
          { text: "I only like chicken.", cn: "我只喜欢鸡肉。", correct: false },
          { text: "The box is heavy.", cn: "箱子很重。", correct: false },
        ],
      },
    ],
  },

  // ============ 跨单元综合场景 ============
  {
    id: "mixed_birthday",
    unit: 1,
    scenario: "生日派对",
    lines: [
      {
        npc: "It's my birthday! I'm happy!",
        cn: "今天是我的生日！我很开心！",
        choices: [
          { text: "Happy birthday!", cn: "生日快乐！", correct: true },
          { text: "I'm tired.", cn: "我累了。", correct: false },
          { text: "I don't like cake.", cn: "我不喜欢蛋糕。", correct: false },
        ],
      },
      {
        npc: "Look at the cake! Big and yummy!",
        cn: "看这个蛋糕！又大又好吃！",
        choices: [
          { text: "I want some cake!", cn: "我想要一些蛋糕！", correct: true },
          { text: "I like eggs.", cn: "我喜欢鸡蛋。", correct: false },
          { text: "The cake is small.", cn: "蛋糕很小。", correct: false },
        ],
      },
    ],
  },

  {
    id: "mixed_animal",
    unit: 2,
    scenario: "动物园",
    lines: [
      {
        npc: "Let's go to the zoo!",
        cn: "我们去动物园吧！",
        choices: [
          { text: "Great! I like animals!", cn: "太好了！我喜欢动物！", correct: true },
          { text: "I want to see a dragon.", cn: "我想看龙。", correct: false },
          { text: "The zoo is far.", cn: "动物园很远。", correct: false },
        ],
      },
      {
        npc: "Look at the monkey! It's funny!",
        cn: "看那只猴子！真好笑！",
        choices: [
          { text: "Yes! I like monkeys!", cn: "是的！我喜欢猴子！", correct: true },
          { text: "I'm scared of it.", cn: "我害怕它。", correct: false },
          { text: "Let's play football.", cn: "我们踢足球吧。", correct: false },
        ],
      },
    ],
  },

  {
    id: "mixed_goodbye",
    unit: 1,
    scenario: "告别",
    lines: [
      {
        npc: "It's late. I need to go home.",
        cn: "很晚了。我得回家了。",
        choices: [
          { text: "OK! See you tomorrow!", cn: "好的！明天见！", correct: true },
          { text: "Go away!", cn: "走开！", correct: false },
          { text: "I'm angry.", cn: "我生气了。", correct: false },
        ],
      },
      {
        npc: "Thank you for playing with me!",
        cn: "谢谢你和我一起玩！",
        choices: [
          { text: "It was fun! Bye!", cn: "很好玩！再见！", correct: true },
          { text: "I don't like playing.", cn: "我不喜欢玩。", correct: false },
          { text: "Goodnight! Sleep well!", cn: "晚安！睡个好觉！", correct: false },
        ],
      },
    ],
  },
]

export function getDialoguesByUnit(unit) {
  return DIALOGUES.filter((d) => d.unit === unit)
}

export function getAvailableDialogues(unlockedUnitIds) {
  return DIALOGUES.filter((d) => unlockedUnitIds.includes(d.unit))
}

export function getRandomDialogue(unlockedUnitIds) {
  const available = getAvailableDialogues(unlockedUnitIds)
  if (available.length === 0) return DIALOGUES[0]
  return available[Math.floor(Math.random() * available.length)]
}
