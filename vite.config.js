import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { synthesize } from './api/_tts-core.js'

// 本地开发中间件：把 /api/tts 转发到阿里云 TTS
// 这样 npm run dev 也能听到与生产一致的神经语音
// 需要 .env 中配置 ALIBABA_AK / ALIBABA_SK / ALIBABA_APPKEY
function ttsDevMiddleware() {
  return {
    name: 'tts-dev-middleware',
    configureServer(server) {
      server.middlewares.use('/api/tts', async (req, res) => {
        // CORS preflight
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

        if (req.method === 'OPTIONS') {
          res.statusCode = 200
          res.end('ok')
          return
        }
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        try {
          const body = await readBody(req)
          const { text } = JSON.parse(body || '{}')
          if (!text || typeof text !== 'string') {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'text is required' }))
            return
          }

          const audio = await synthesize(text)
          res.statusCode = 200
          res.setHeader('Content-Type', 'audio/mpeg')
          res.setHeader('Cache-Control', 'public, max-age=86400')
          res.end(audio)
        } catch (err) {
          console.error('[tts-dev]', err)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: String(err?.message || err) }))
        }
      })
    },
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => { data += chunk })
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })
}

export default defineConfig(({ mode }) => {
  // 显式加载 .env 文件中的所有变量到 process.env
  // 使 api/_tts-core.js 能读到 ALIBABA_AK / ALIBABA_SK / ALIBABA_APPKEY
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)

  return {
    plugins: [react(), ttsDevMiddleware()],
    base: './',
    build: {
      outDir: 'dist',
    },
  }
})
