# 英语学习游戏

基于 React + Vite 的三科（英语/语文/数学）儿童学习游戏，支持多孩子、星星奖励、家长管理、离线使用。

## 快速开始

```bash
npm install
cp .env.example .env    # 配置 Supabase 环境变量
npm run start           # 启动 TTS 服务器 + Vite 开发服务器
```

## 技术栈

React 19 / Vite 8 / Tailwind CSS 3 / React Router 6 / Supabase / ESLint

## 功能概览

| 模式 | 英语 | 语文 | 数学 |
|------|------|------|------|
| 闯关 | 听音选图 + 字母填空 | 阅读短文选择 | CPA 应用题选择 |
| 记忆 | 单词背诵练习 | - | - |
| 对话 | 情景对话练习 | - | - |

- **多孩子支持**：独立进度 + 星星奖励
- **家长面板**：单词解锁、奖励管理、学习统计、错词本
- **离线支持**：localStorage 缓存 + 离线队列 30 秒轮询重传
- **TTS 语音**：阿里云 TTS（爱童音色），网络失败降级浏览器 Web Speech API

## 页面路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/login` | Login | 邮箱登录/注册 |
| `/select-child` | SelectChild | 选择或创建孩子 |
| `/home` | Home | 主界面，三科卡片 + 模式选择 |
| `/game` | Game | 闯关模式（英语/语文/数学） |
| `/memory` | WordMemory | 英语记忆练习 |
| `/dialogue` | DialoguePractice | 英语对话练习 |
| `/parent/*` | ParentDashboard | 家长面板（统计/解锁/错词/奖励） |

## 核心流程

### 英语闯关

```
家长解锁单词 → 孩子开始闯关
  → 从已解锁单词中选 8 题（优先新词 > 待复习 > 巩固）
  → 题型交替：看图选词 / 字母填空
  → 答对加分，连续答对有连击奖励
  → 结束后保存进度到 Supabase（离线时暂存队列）
```

### 记忆游戏

```
选择年级/学期 → 勾选单词 → 逐个字母填空练习
  → 答对累加 correct_count，达 10 次标记"已掌握"
  → 支持 TTS 自动播报，可调间隔和次数
  → 支持"只练错词"一键针对性练习
```

### 对话练习

```
选择角色 → 场景对话 → 选择正确回复
  → TTS 朗读角色语音
  → 答对/答错显示中文释义
```

### 家长面板

- **统计**：每日游戏次数、正确率、分科目趋势
- **解锁**：按年级/学期/单元管理单词解锁状态
- **错词**：错词排行、错误次数、题型分布，支持"已纠正"标记
- **奖励**：可用星星数、奖励模板管理、兑换记录

## 奖励系统

计分规则：答对 +1、连击≥3 额外 +1、连击≥5 额外 +2、全对 +3、每日首次 +2、连续7天 +5。

| 奖励 | 星星 | 约需天数 |
|------|------|---------|
| 多看动画片15分钟 | 300 | ~2 天 |
| 零食奖励 | 500 | ~3.3 天 |
| 去公园玩 | 700 | ~4.7 天 |
| 小玩具 | 800 | ~5.3 天 |

## 数据存储

三层架构：Supabase（云端）→ localStorage（本地缓存）→ React State（内存）

- 在线时直接读写 Supabase
- 离线时操作暂存队列，恢复网络后 30 秒轮询重传
- 首次使用必须联网，之后可完全离线

## 项目结构

```
src/
├── components/
│   ├── question/      # 题目组件（ImageChoice/LetterFill/ChineseReadingChoice/MathChoice）
│   ├── game/          # 游戏组件（StartScreen/ResultScreen/ComboIndicator）
│   ├── parent/        # 家长组件（UnlockPanel/StatsPanel/ErrorBookPanel/RewardsPanel）
│   ├── dialogue/      # 对话组件（DialogueBubble/ChoicePanel/tts.js）
│   ├── guards/        # 守卫（OfflineGate/ProtectedRoute/ErrorBoundary/DataPrefetch）
│   └── ui/            # 通用 UI（Button/Modal/Toast/GameHeader/StarRain 等）
├── config/            # 配置（subjects/characters/avatars/rewards/themes）
├── context/           # React Context（Auth/Child/Game/Star/GameTheme）
├── engines/           # 游戏引擎（questionEngine/scoring）
├── hooks/             # 自定义 Hooks
├── lib/               # 数据层（game/offline/words/stars/errorBook/supabase）
└── routes/            # 页面路由（8 个页面）
supabase/              # 数据库迁移脚本
```

## 部署

### 前端（GitHub Pages）

```bash
npm run build
npm run deploy
```

路由使用 HashRouter，刷新任意页面不会 404。

### TTS 语音代理（阿里云函数计算）

1. 创建阿里云函数计算服务（Node.js 18）
2. 上传 TTS 代理代码，配置环境变量
3. 创建 HTTP 触发器
4. 构建时传入 TTS 地址：`VITE_VERCEL_TTS_URL=https://your-fc-url npm run build`

## 首次部署检查清单

- [ ] 创建 Supabase 项目，执行 `supabase/full_schema.sql` 建表
- [ ] 执行 `supabase/fix_add_grade_column.sql`
- [ ] 执行 `supabase/fix_rls_policies.sql`
- [ ] 执行 `supabase/rpc_atomic_stars.sql`
- [ ] 复制 `.env.example` 为 `.env`，填入 Supabase 凭据
- [ ] `npm run dev` 本地验证

## 待做

- [ ] 四五六年级内容
- [ ] 深色模式
- [ ] 无障碍
