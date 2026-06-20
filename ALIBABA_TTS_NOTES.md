# 阿里云 TTS 接入笔记

## 背景

英语学习游戏 `english-learning-game` 的对话功能需要朗读英文文本。
最初方案是 **Vercel Edge Function + 微软 Edge TTS（Bing WebSocket）**，
但这套方案在国内有两个致命问题：

| 问题 | 表现 | 根因 |
|------|------|------|
| **华为/安卓设备无声** | Web Speech API 降级后兼容性差 | 浏览器 TTS 在各设备上表现不一 |
| **云端 TTS 超时/不可达** | Vercel 在美国，阿里云在上海，跨海请求失败 | Vercel 域名被墙 + 网络延迟 |

最终方案改为 **阿里云函数计算（FC）+ 阿里云 TTS**：
国内网络直连，所有设备音质统一，儿童友好音色。

---

## 最终架构

```
平板/手机 → GitHub Pages（前端页面）
               ↓  VITE_VERCEL_TTS_URL 指定地址
          阿里云 FC（上海）→ 阿里云 TTS API
               ↓
          返回 MP3 音频 → 前端播放
```

- **前端**：GitHub Pages（国内可访问）
- **TTS 代理**：阿里云函数计算（FC），上海区域
- **TTS 引擎**：阿里云智能语音交互（NLS）
- **音色**：`aitong`（爱童，儿童友好音色）

---

## 涉及的服务与费用

| 服务 | 用途 | 费用 |
|------|------|------|
| **阿里云智能语音交互 (NLS)** | TTS 语音合成 | 有免费额度，超出约 2元/万次 |
| **阿里云函数计算 (FC)** | TTS 代理函数 | 免费额度 100万次/月 |
| **GitHub Pages** | 前端静态托管 | 免费 |
| **Supabase** | 游戏数据（不变） | 免费额度 |

对于个人学习项目，**每月费用为 0 元**。

---

## 关键代码文件

| 文件 | 作用 |
|------|------|
| `fc-tts/index.js` | **阿里云 FC 函数** — 接收 POST → 调用阿里云 TTS → 返回 MP3 |
| `fc-tts/README.md` | FC 部署步骤文档 |
| `api/_tts-core.js` | **本地/Vercel 复用** — 阿里云 TTS 核心逻辑 |
| `api/tts.js` | Vercel Edge Function（可选，海外场景） |
| `vite.config.js` | 开发中间件，`npm run dev` 时直连阿里云 TTS |
| `src/components/dialogue/tts.js` | 前端 TTS 调用入口 |

---

## Token 获取 — 踩坑记录

这是**最大的坑**，搞了三次才成功。

### ❌ 第一次尝试：Dataplus 签名（失败）

```js
// 错误方式：旧版 Dataplus API，已废弃
Authorization: `Dataplus ${AK}:${signature}`
// 返回: InvalidAction.NotFound
```

阿里云的 `nls-meta` Token 服务早已不支持 Dataplus 签名方案。

### ❌ 第二次尝试：阿里云 REST API 签名（Vite 版，成功）

```js
// 正确方式：阿里云标准 REST API 签名
const params = {
  Action: 'CreateToken',
  Version: '2019-02-28',
  Format: 'JSON',
  RegionId: 'cn-shanghai',
  AccessKeyId: AK,
  Timestamp: new Date().toISOString(),
  SignatureMethod: 'HMAC-SHA1',
  SignatureVersion: '1.0',
  SignatureNonce: crypto.randomUUID(),
};
// 按 key 排序 → 规范化 → HMAC-SHA1 签名
// POST 到 https://nls-meta.{region}.aliyuncs.com/
```

但注意：Vite dev server 需要 `loadEnv()` 注入环境变量，否则 `process.env.ALIBABA_AK` 读不到。

### ❌ 第三次尝试：Vercel Edge Function（跨海超时）

Edge Function 代码本地测试完全正常，但部署到 Vercel（美国）后调用阿里云 TTS（上海）**超时**。
证明：后端不能跨海调国内 API。

### ✅ 最终方案：阿里云 FC

部署到阿里云上海区域，国内调用畅通无阻。

---

## FC 函数踩坑记录

### 坑 1: 运行环境模式

| 写法 | 结果 |
|------|------|
| `import crypto from 'crypto'` + `export const handler` | ❌ FC 的 Node.js 18 识别为 ESM，但需在 ZIP 中加 `"type": "module"` |
| `require('crypto')` + `exports.handler` | ❌ `require is not defined in ES module scope` |
| `require('crypto')` + `exports.handler` + 无 `package.json` 或 `"type": "commonjs"` | ✅ **正确方式** |

**结论**：FC 函数的 ZIP 包中不要放 `package.json`，或者 `package.json` 中设 `"type": "commonjs"`，使用 `require` + `exports.handler`。

### 坑 2: 函数签名

| 方式 | 代码 | 结果 |
|------|------|------|
| `async (event) => ({ statusCode, body })` | 返回对象 | ❌ `Wrong response argument type` |
| `(req, resp, context) => { resp.send() }` | 回调方式 | ✅ **正确方式** |

**结论**：FC Node.js 18 运行时（HTTP 触发器）使用 `(req, resp, context)` 三参数回调模式，而不是 event 返回对象模式。设置响应头用 `resp.setHeader()`，发送响应用 `resp.send()`。

### 坑 3: 环境变量

环境变量需要在 **函数配置 → 环境变量** 中一个个添加，部署代码后不会自动加载 `.env` 文件。

需要的 5 个变量：
- `ALIBABA_AK` — AccessKey ID
- `ALIBABA_SK` — AccessKey Secret
- `ALIBABA_APPKEY` — NLS AppKey
- `ALIBABA_TTS_VOICE` — 音色名
- `ALIBABA_REGION` — 区域（如 `cn-shanghai`）

---

## 音色说明

| 音色名 | 类型 | 说明 |
|--------|------|------|
| **aitong** | 儿童音色 | ✅ **默认推荐**，温暖亲切，适合儿童 |
| luna | 英语女声 | 轻柔自然 |
| emily | 英语女声 | 清新活泼 |
| clara | 英语女声 | 标准清晰 |
| harry | 英语男声 | 友好男声 |
| william | 英语男声 | 稳重男声 |

> 注：之前尝试的 `en-US-JennyNeural` 是微软音色，阿里云不支持。

---

## 前端 TTS 调用流程

```
用户进入对话
    ↓
DialogueBubble 显示角色台词
    ↓
speakText(text) 被调用
    ↓
检查是否有 VITE_VERCEL_TTS_URL 环境变量
    ↓
有 → 直接 POST 到阿里云 FC 地址
    ↓
无 → POST 到同源 /api/tts（Vercel/本地开发）
    ↓
FC/Vercel → 阿里云 TTS → 返回 MP3 → 播放
    ↓
失败 → 降级到浏览器 Web Speech API
```

---

## 环境变量优先顺序

不同场景下配置来源不同：

| 场景 | `VITE_VERCEL_TTS_URL` 来源 | `ALIBABA_AK/SK/APPKEY` 来源 |
|------|---------------------------|---------------------------|
| **本地开发** `npm run dev` | 不配（走同源 `/api/tts`） | `.env` 文件 |
| **GitHub Pages 生产** | 构建时传入 `VITE_VERCEL_TTS_URL=xxx npm run build` | 不需要（不经过 Node 后端） |
| **Vercel 生产** | `VITE_VERCEL_TTS_URL` 环境变量 | Vercel Dashboard 环境变量 |

---

## 部署步骤总结

### 第一次部署

1. **阿里云 FC**：部署 `fc-tts/index.js`，配环境变量，获取 URL
2. **构建前端**：`VITE_VERCEL_TTS_URL=<FC_URL> npm run build`
3. **部署前端**：`npm run deploy`（推送到 GitHub Pages）
4. **GitHub 仓库**：Settings → Pages → 选 `gh-pages` 分支

### 后续更新

```bash
# 1. 更新代码
git pull

# 2. 构建（带上 FC 地址）
VITE_VERCEL_TTS_URL=https://tts-proxy-xxx.cn-shanghai.fcapp.run npm run build

# 3. 部署
npm run deploy
```

---

## 常见问题

### Q: 平板没声音
A: 确认打开的是 `https://fate147.github.io/english-learning-game/`，检查浏览器控制台是否有网络错误。

### Q: FC 返回错误
A: 检查 FC 函数的环境变量是否配齐（5 个）。用 curl 测试：`curl -X POST <FC_URL> -H "Content-Type: application/json" -d '{"text":"Hello"}'`

### Q: 想换音色
A: 修改 FC 的环境变量 `ALIBABA_TTS_VOICE`，然后重新部署 FC。
