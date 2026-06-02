# 英语学习游戏项目

## 项目简介
这是一个基于 React + Vite 的英语学习游戏，集成了 Supabase 后端服务，支持在线学习进度同步。

## 环境要求
- Node.js 18.0 或更高版本
- npm 或 yarn 包管理器

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
复制 `.env.example` 文件为 `.env`：
```bash
cp .env.example .env
```

### 3. 启动开发服务器
```bash
npm run dev
```
访问：http://localhost:5173/english-learning-game/

### 4. 构建生产版本
```bash
npm run build
```

### 5. 预览生产版本
```bash
npm run preview
```

## 项目结构
```
english-learning-game/
├── src/
│   ├── components/      # React 组件
│   ├── config/         # 配置文件
│   ├── context/        # React Context
│   ├── engines/        # 游戏引擎
│   ├── hooks/          # 自定义 Hooks
│   ├── lib/            # 工具库和 Supabase 配置
│   └── routes/         # React Router 路由
├── public/
│   ├── audio/          # 音频文件
│   ├── images/         # 图片资源
│   └── words/          # 单词图片
├── supabase/           # Supabase 相关文件
└── dist/              # 构建输出目录
```

## 部署到 GitHub Pages

### 1. 推送代码到 GitHub
确保您的代码已推送到 GitHub 仓库。

### 2. 部署命令
```bash
npm run deploy
```
此命令会自动将构建后的文件部署到 GitHub Pages。

### 3. 部署配置
- `vite.config.js` 已配置 `base: '/english-learning-game/'`，适用于 GitHub Pages
- `package.json` 中已配置 `gh-pages` 部署脚本

### 4. GitHub Pages 设置
在您的 GitHub 仓库中：
1. 进入 Settings → Pages
2. Source 选择 "Deploy from a branch"
3. Branch 选择 "gh-pages"

## 技术栈
- React 19
- Vite 8
- React Router 6
- Tailwind CSS
- Supabase
- ESLint

## 开发说明
- 所有音频文件位于 `public/audio/`
- 所有图片资源位于 `public/images/`
- 单词图片位于 `public/images/words/`

## 常见问题

### 1. 音频文件无法播放
检查音频文件格式是否为 MP3，且文件路径正确。

### 2. 图片资源未加载
确保图片文件已放在 `public/images/` 目录下。

### 3. Supabase 连接失败
检查 `.env` 文件中的环境变量是否正确设置。

## 联系方式
如有问题，请提交 Issue 或 Pull Request。