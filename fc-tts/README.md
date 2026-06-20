# 阿里云函数计算 TTS 代理部署指南

本目录 `fc-tts/` 包含一个独立的阿里云函数计算 (FC) 函数，
用于为 english-learning-game 提供国内可用的 TTS 语音合成。

---

## 架构

```
华为/小米/iPhone → Vercel 前端 → 阿里云 FC (TTS 代理) → 阿里云 TTS
                              ↓
                       Supabase (游戏数据)
```

- **前端**仍部署在 Vercel（或其他静态托管平台）
- **TTS 代理**部署在阿里云函数计算，国内网络直连，延迟低
- 前端通过 `VITE_VERCEL_TTS_URL` 环境变量指向 FC 地址

---

## 前提条件

1. 阿里云账号
2. 已开通 [智能语音交互](https://nls.console.aliyun.com/) 服务
3. 已创建 RAM 用户并授予 `AliyunNLSSpeechSynthesisAccess` 权限

---

## 第一步：获取配置参数

### 1.1 RAM 用户 AccessKey

1. 访问 [RAM 控制台](https://ram.console.aliyun.com/users)
2. 创建用户（或使用已有用户）
3. 勾选 **OpenAPI 调用访问** → 获取 `AccessKey ID` 和 `AccessKey Secret`
4. 授予权限：`AliyunNLSSpeechSynthesisAccess`

### 1.2 NLS AppKey

1. 访问 [智能语音交互控制台](https://nls.console.aliyun.com/)
2. 左侧菜单 → **语音合成** → **创建App**
3. 填写名称，选择地域（建议 **上海**）
4. 创建完成后在列表页获取 **AppKey**

### 1.3 可选：测试可用音色

在控制台「语音合成」页面可以用内置播放器测试不同音色。
推荐的美式英语女声音色：

| 音色名称 | 说明 |
|---------|------|
| `aitong` | **爱童（默认，推荐）** — 儿童友好音色，温暖亲切 |
| `luna` | 英语女声，轻柔自然 |
| `emily` | 英语女声，清新活泼 |
| `clara` | 英语女声，标准清晰 |
| `harry` | 英语男声 |
| `william` | 英语男声 |

你可以在控制台测试后选一个最合适的。

---

## 第二步：部署函数计算

### 方式一：使用阿里云 CLI（推荐，最快）

```bash
# 1. 安装并配置阿里云 CLI
# https://help.aliyun.com/document_detail/110341.html
aliyun configure

# 2. 创建服务（如已有可跳过）
aliyun fc3 create-service --service-name english-learning-tts

# 3. 创建函数
cd fc-tts

# 压缩代码
zip -r function.zip index.js package.json

# 创建函数（Node.js 18 + HTTP 触发器）
aliyun fc3 create-function \
  --service-name english-learning-tts \
  --function-name tts-proxy \
  --runtime nodejs18 \
  --handler index.handler \
  --memory-size 256 \
  --timeout 30 \
  --code ./function.zip

# 4. 为函数创建 HTTP 触发器
aliyun fc3 create-trigger \
  --service-name english-learning-tts \
  --function-name tts-proxy \
  --trigger-name http \
  --trigger-type http \
  --qualifier LATEST \
  --trigger-config '{"methods":["POST","OPTIONS"],"authType":"anonymous"}'

# 5. 配置环境变量（请替换为你的实际值）
aliyun fc3 update-function \
  --service-name english-learning-tts \
  --function-name tts-proxy \
  --environment-variables '{
    "ALIBABA_AK":"your_access_key_id",
    "ALIBABA_SK":"your_access_key_secret",
    "ALIBABA_APPKEY":"your_appkey",
    "ALIBABA_TTS_VOICE":"aitong",
    "ALIBABA_REGION":"cn-shanghai"
  }'

# 6. 获取函数 URL
aliyun fc3 get-function \
  --service-name english-learning-tts \
  --function-name tts-proxy \
  --output json | grep url
```

### 方式二：阿里云控制台（可视化管理）

1. 访问 [函数计算控制台](https://fc.console.aliyun.com/)
2. 创建服务（如 `english-learning-tts`）
3. 创建函数：
   - **运行环境**：Node.js 18
   - **代码上传**：上传 `fc-tts/` 目录（或压缩为 zip）
   - **处理程序**：`index.handler`
4. 创建 HTTP 触发器：
   - **认证方式**：匿名
   - **请求方法**：POST, OPTIONS
5. 配置环境变量（见上方的 5 个变量）

---

## 第三步：配置前端

### 3.1 获取 FC 访问地址

部署成功后，你会得到一个 URL，格式如：
```
https://tts-proxy-xxxxx.cn-shanghai.fc.aliyuncs.com/tts
```

### 3.2 配置 VITE_VERCEL_TTS_URL

在 Vercel 项目环境变量中，或在 `.env` 文件中添加：

```env
VITE_VERCEL_TTS_URL=https://tts-proxy-xxxxx.cn-shanghai.fc.aliyuncs.com/tts
```

### 3.3 本地开发

在项目的 `.env` 文件中配置（Vite 自动加载）：

```env
ALIBABA_AK=your_access_key_id
ALIBABA_SK=your_access_key_secret
ALIBABA_APPKEY=your_appkey
ALIBABA_TTS_VOICE=aitong
ALIBABA_REGION=cn-shanghai
```

然后 `npm run dev` 即可在本地使用阿里云 TTS。

---

## 验证

### 测试 FC 函数

```bash
curl -X POST https://your-fc-url/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello, welcome to English learning game!"}' \
  -o test.mp3
```

成功后会生成 `test.mp3` 文件，可以用播放器打开试听。

### 在游戏中验证

1. 打开游戏 → 进入英语对话
2. 角色对话气泡出现后，应自动朗读英文
3. 选择回复后，所选回复也应被朗读

---

## 费用

阿里云函数计算按量计费，TTS 代理场景极低消耗：

| 项目 | 费用 |
|------|------|
| FC 调用次数 | 免费额度 100万次/月 |
| FC 执行时间 | 免费额度 10000 GB-秒/月 |
| 阿里云 TTS | 有免费额度，超出后约 2元/万次 |

对于个人学习项目，每月费用通常为 **0 元**。

---

## 常见问题

### Q: FC 返回 502 错误

检查环境变量是否正确配置，尤其是 `ALIBABA_AK` / `ALIBABA_SK` / `ALIBABA_APPKEY`。

### Q: 声音播放不出来

1. 检查浏览器控制台是否有 CORS 报错
2. 确认 `VITE_VERCEL_TTS_URL` 已正确配置
3. 用 curl 单独测试 FC 函数

### Q: 想换其他音色

修改 `ALIBABA_TTS_VOICE` 环境变量。阿里云 TTS 支持的音色列表可在控制台查看。
