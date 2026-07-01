/**
 * 朗读英文文本
 * 优先使用阿里云 TTS（统一音质，所有设备一致），
 * 网络失败时降级到 Web Speech API 本地语音。
 *
 * 优化：老设备响应慢的问题
 */

// 缓存已获取的音频，避免重复请求
const audioCache = new Map()

// 预创建 Audio 对象复用，减少内存分配
let sharedAudio = null

// ====== 云端 TTS ======

async function speakCloud(text) {
  // 命中缓存直接播放
  if (audioCache.has(text)) {
    return playBlob(audioCache.get(text))
  }

  const url = import.meta.env.VITE_VERCEL_TTS_URL || '/api/tts'

  // 添加超时：3秒内没响应就降级到本地
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 3000)

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!resp.ok) throw new Error(`TTS ${resp.status}`)

    const blob = await resp.blob()
    audioCache.set(text, blob)
    return playBlob(blob)
  } catch (e) {
    clearTimeout(timeout)
    throw e
  }
}

function playBlob(blob) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob)

    // 复用 Audio 对象，老设备更快
    if (!sharedAudio) {
      sharedAudio = new Audio()
    }

    sharedAudio.src = url
    sharedAudio.onended = () => { URL.revokeObjectURL(url); resolve(true) }
    sharedAudio.onerror = () => { URL.revokeObjectURL(url); resolve(false) }

    // 老设备可能需要预加载
    sharedAudio.load()
    sharedAudio.play().catch(() => resolve(false))
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
    // 老设备语音加载可能更慢，给更多时间
    setTimeout(() => { voicesReady = true; resolve() }, 2000)
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

// ====== 统一入口 ======

export async function speakText(text) {
  if (!text) return false
  try {
    return await speakCloud(text)
  } catch {
    // 云端失败（超时或网络错误），降级本地
    return speakLocal(text)
  }
}
