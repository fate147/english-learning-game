/**
 * 朗读英文文本
 * 阿里云 TTS 优先，失败降级 Web Speech API
 */

const audioCache = new Map()

// ====== 云端 TTS ======

async function speakCloud(text) {
  if (audioCache.has(text)) {
    return playBlob(audioCache.get(text))
  }

  const url = import.meta.env.VITE_VERCEL_TTS_URL || '/api/tts'
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (!resp.ok) throw new Error(`TTS ${resp.status}`)

    const data = await resp.json()

    // FC 返回 base64 编码的音频
    if (data.isBase64Encoded && data.body) {
      const binary = atob(data.body)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
      }
      const blob = new Blob([bytes], { type: 'audio/mpeg' })
      audioCache.set(text, blob)
      return playBlob(blob)
    }

    // 直接返回 blob 的情况
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
    const audio = new Audio(url)
    audio.onended = () => { URL.revokeObjectURL(url); resolve(true) }
    audio.onerror = () => { URL.revokeObjectURL(url); resolve(false) }
    audio.play().then(() => true).catch(() => resolve(false))
  })
}

// ====== 本地 Web Speech API ======

async function speakLocal(text) {
  if (!window.speechSynthesis) return false
  window.speechSynthesis.cancel()

  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 1.0

    const voices = window.speechSynthesis.getVoices()
    if (voices.length > 0) {
      const enVoice = voices.find(v => v.lang?.startsWith('en'))
      if (enVoice) utterance.voice = enVoice
    }

    utterance.onend = () => resolve(true)
    utterance.onerror = () => resolve(false)

    try {
      window.speechSynthesis.speak(utterance)
      setTimeout(() => window.speechSynthesis?.resume(), 100)
    } catch {
      resolve(false)
    }
  })
}

// ====== 统一入口 ======

export async function speakText(text) {
  if (!text) return false
  try {
    return await speakCloud(text)
  } catch {
    return speakLocal(text)
  }
}
