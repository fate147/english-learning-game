# 英语学习游戏

基于 React + Vite 的三科（英语/语文/数学）儿童学习游戏，集成 Supabase 后端，支持多孩子、星星奖励、家长管理。

## 快速开始

```bash
npm install
cp .env.example .env    # 配置 Supabase 环境变量
npm run dev              # 访问 http://localhost:5173
```

## 项目结构

```
src/
├── components/          # UI 组件（child/dialogue/game/guards/parent/question/stats/ui）
├── config/              # 配置（subjects/characters/avatars/strings/rewards）
├── context/             # React Context（Auth/Child/Game/Star）
├── engines/             # 游戏引擎（questionEngine/scoring）
├── hooks/               # 自定义 Hooks（useAuth/useChild/useGameSession/useStars）
├── lib/                 # 数据层
│   ├── english/courses/ # 英语对话 JSON（12 单元）
│   ├── chinese/courses/ # 语文题目 JSON（16 单元 128 题）
│   └── math/courses/    # 数学题目 JSON（17 单元 136 题）
└── routes/              # 页面路由（8 个页面）
public/
├── audio/               # 英语单词音频（210 个 MP3）
├── images/              # 角色图片 + 单词配图
└── words/               # 单词图片（webp）
supabase/                # 数据库迁移脚本
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
- **家长面板**：单词解锁、奖励管理、学习统计
- **离线支持**：localStorage 缓存 + 离线队列重传
- **双管道架构**：英语旧链路（210 词 + MP3）+ 新管道（AI 生成 JSON）

## 奖励系统

计分规则：答对 +1、连击≥3 额外 +1、连击≥5 额外 +2、全对 +3、每日首次 +2、连续7天 +5。

| 奖励 | 星星 | 需要天数（全对满连击） |
|------|------|----------------------|
| 多看动画片15分钟 | 300 | ~2 天 |
| 零食奖励 | 500 | ~3.3 天 |
| 去公园玩 | 700 | ~4.7 天 |
| 小玩具 | 800 | ~5.3 天 |

## 数据库迁移

新增 `subject` 和 `grade` 列到 `game_sessions`、`word_progress`、`learning_app_state` 三张表：

```sql
-- Supabase SQL Editor 中执行
-- 见 supabase/fix_add_grade_column.sql
```

## 首次部署检查清单

- [ ] 创建 Supabase 项目，执行 `supabase/full_schema.sql` 建表
- [ ] 执行 `supabase/fix_add_grade_column.sql` 添加 subject/grade 列
- [ ] 执行 `supabase/fix_rls_policies.sql` 配置 RLS 策略
- [ ] 执行 `supabase/rpc_atomic_stars.sql` 创建原子星星 RPC
- [ ] 复制 `.env.example` 为 `.env`，填入 Supabase URL 和 Anon Key
- [ ] `npm install` 安装依赖
- [ ] `npm run dev` 本地验证
- [ ] GitHub 仓库 Settings → Pages → Source 选 `gh-pages` 分支
- [ ] `npm run build && npm run deploy` 部署线上

## 部署到 GitHub Pages

```bash
npm run build     # 构建到 docs/
npm run deploy    # 部署到 gh-pages 分支
```

GitHub 仓库 Settings → Pages → Source 选 `master` 分支。

## 路线图

### 阶段一：英语版本 ✅
闯关、记忆、对话三大模式，角色系统，星星奖励，家长管理，学习统计，离线支持。

### 阶段二：英语对话模式 ✅
DialogueBubble + ChoicePanel 组件，Web Speech API 语音，中英双语，鸿蒙兼容。

### 阶段三：语文 + 数学 ✅
三科统一架构，ChineseReadingChoice（5 阶）+ MathChoice（CPA 四阶），128 + 136 题已生成。

### 阶段四：新管道迁移 ✅
双管道：英语旧链路不动，语文/数学/英语对话走 AI 生成 JSON。

### 阶段五：UI 全面打磨 ✅
P0 基础体验（字体/登录/Home/SelectChild）→ P1 游戏体验（微交互/反馈/连击/结算）→ P2 页面改进（WordMemory/DialoguePractice）→ P3 系统级（动画/移动端）。

### 阶段六：家长面板重写 ✅
深色主题 + 翡翠绿强调色，横向孩子选择，胶囊 Tab 栏。

### 阶段七：逻辑修复 ✅
- WordMemory 保存游戏记录到 Supabase
- DialoguePractice 补充 subject/grade，复用 calcScore 奖励
- 学习统计支持 grade 过滤，修复离线缓存 key 不一致
- 修复 OverviewCards 标签和数据（总场次/总答对/星星总数）
- 修复 refreshStars 竞态问题
- RPC 加鉴权校验，离线队列加最大重试
- 常错题目显示题目文字而非 ID
- 奖励模板价格按实际计分规则调整

### 待做
- [ ] 四五六年级内容
- [ ] 深色模式
- [ ] 无障碍
