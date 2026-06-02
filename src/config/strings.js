// 所有 UI 文字标签集中配置，不硬编码
// 多学科扩展：后续通过 subject 参数切换语言
export const STRINGS = {
  app: {
    name: '英语游戏',
    loading: '加载中...',
    retry: '重试',
    back: '返回',
    confirm: '确认',
    cancel: '取消',
  },

  auth: {
    login: '登录',
    register: '注册',
    email: '邮箱',
    password: '密码',
    emailPlaceholder: 'your@email.com',
    passwordPlaceholder: '输入密码',
    switchToRegister: '没有账号？注册',
    switchToLogin: '已有账号？登录',
    submitting: '处理中...',
    loginTitle: '登录后开始学习',
  },

  selectChild: {
    title: '选择孩子',
    subtitle: '选择后开始游戏',
    addChild: '+ 添加孩子',
    noChildren: '还没有添加孩子，点击下方添加',
    parentAccess: '🔒 家长管理',
    logout: '退出登录',
  },

  childForm: {
    title: '添加孩子',
    nameLabel: '孩子名字',
    namePlaceholder: '输入名字',
    submit: '添加孩子',
    creating: '创建中...',
    chooseAvatar: '选择头像',
  },

  game: {
    startTitle: '英语游戏',
    selectCharacter: '选择角色',
    selectUnit: '选择单元',
    startButton: '开始游戏',
    progress: '进度',
    perfect: '全部正确！太棒了！',
    finished: '游戏结束',
    correct: '正确',
    wrong: '错误',
    accuracy: '正确率',
    maxCombo: '🔥 最高连击',
    starsEarned: '获得星星',
    playAgain: '再来一局',
    goHome: '返回首页',
    unitLabel: '单元 {n}',
    levelLabel: '等级 {n}',
    starLabel: '★ {n} 星',
  },

  imageChoice: {
    hint: '听录音，选择正确的图片',
    listen: '听录音',
    retry: '播放失败，重试',
  },

  letterFill: {
    hint: '根据发音和释义，填入正确的字母',
  },

  feedback: {
    correct: '回答正确！',
    wrong: '再想想哦',
  },

  wordMemory: {
    title: '单词记忆',
    subtitle: '选择要练习的单元',
    completed: '练习完成！',
    exit: '退出',
    practiceAgain: '再练一次',
  },

  parent: {
    title: '👨‍👩‍👧 家长管理',
    tabUnlock: '📖 单词解锁',
    tabRewards: '🎁 奖励管理',
    unlockHint: '点击已解锁的单词可以切换锁定/解锁状态',
    passwordTitle: '家长管理',
    passwordSubtitle: '请输入家长密码',
    passwordPlaceholder: '输入家长密码',
    passwordError: '密码错误，请重试',
    verifying: '验证中...',
    redeem: '兑换奖励',
    noData: '暂无数据',
    defaultRewards: '默认奖励',
    customRewards: '自定义奖励',
    addReward: '添加',
    rewardName: '奖励名称',
  },

  stats: {
    title: '📊 学习统计',
    totalSessions: '总游戏次数',
    correctRate: '正确率',
    totalCorrect: '总正确',
    totalStars: '总星星',
    dailyCorrect: '每日正确数',
    errorRanking: '易错单词排名',
    unitProgress: '单元进度',
    noData: '暂无统计数据',
    noDataHint: '开始游戏后数据会在这里显示',
    noErrors: '暂无错误记录',
    noChartData: '暂无数据',
  },

  offline: {
    title: '⚠️ 首次使用需要联网',
    description: '检查网络连接后',
    retryButton: '🔄 重试连接',
  },

  error: {
    title: '出错了',
    description: '页面遇到了一个意外错误，请刷新页面重试。',
    refresh: '刷新页面',
    unknown: '未知错误',
  },
}
