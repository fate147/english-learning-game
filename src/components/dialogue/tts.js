/**
 * 朗读英文文本
 * 优先使用阿里云 TTS（统一音质，所有设备一致），
 * 网络失败时降级到 Web Speech API 本地语音。
 *
 * 生产环境配置 VITE_VERCEL_TTS_URL 指向阿里云 FC 地址。
 * 开发环境走同源 /api/tts（由 Vite 中间件代理到阿里云 TTS）。
 */

// 缓存已获取的音频，避免重复请求
const audioCache = new Map()

// ====== 云端 Edge TTS ======

async function speakCloud(text) {
  // 命中缓存直接播放
  if (audioCache.has(text)) {
    return playBlob(audioCache.get(text))
  }

  // 解析 TTS 地址：VITE_VERCEL_TTS_URL → 阿里云 FC 地址
  // 不配置时开发环境走同源 /api/tts（Vite 中间件代理）
  const url = import.meta.env.VITE_VERCEL_TTS_URL || '/api/tts'

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })

  if (!resp.ok) throw new Error(`TTS ${resp.status}`)

  const blob = await resp.blob()
  audioCache.set(text, blob)
  return playBlob(blob)
}

function playBlob(blob) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob)
    const audio = new Audio(url)
    audio.onended = () => { URL.revokeObjectURL(url); resolve(true) }
    audio.onerror = () => { URL.revokeObjectURL(url); resolve(false) }
    audio.play().catch(() => resolve(false))
  })
}

// ====== 本地 Web Speech API 降级 ======

let voicesReady = false

function waitVoices() {
  return new Promise((resolve) => {
    if (voicesReady) { resolve(); return }
    const voices = window.speechSynthesis?.getVoices()
    if (voices?.length > 0) { voicesReady = true; resolve(); return }
    window.speechSynthesis.onvoiceschanged = () => {
      voicesReady = true
      window.speechSynthesis.onvoiceschanged = null
      resolve()
    }
    setTimeout(() => { voicesReady = true; resolve() }, 1500)
  })
}

function pickVoice(voices) {
  if (!voices?.length) return null
  const preferred = ['Samantha', 'Microsoft Zira', 'Microsoft David', 'Google US English', 'Google UK English Female']
  for (const name of preferred) {
    const found = voices.find(v => v.name.includes(name))
    if (found) return found
  }
  return voices.find(v => v.lang.startsWith('en')) || null
}

async function speakLocal(text) {
  if (!window.speechSynthesis) return false
  await waitVoices()
  window.speechSynthesis.cancel()

  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0

    const voices = window.speechSynthesis.getVoices()
    const voice = pickVoice(voices)
    if (voice) utterance.voice = voice

    utterance.onend = () => resolve(true)
    utterance.onerror = () => resolve(false)
    try { window.speechSynthesis.speak(utterance) }
    catch { resolve(false) }
  })
}

// ====== 统一入口：云端优先，失败降级本地 ======

export async function speakText(text) {
  if (!text) return false
  try {
    return await speakCloud(text)
  } catch {
    return speakLocal(text)
  }
}
