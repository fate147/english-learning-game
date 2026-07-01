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
  console.log('[TTS] 请求:', url, text)

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    console.log('[TTS] 响应状态:', resp.status)
    
    if (!resp.ok) throw new Error(`TTS ${resp.status}`)

    const data = await resp.json()
    console.log('[TTS] 数据:', data.audio ? '有音频' : '无音频')

    if (data.audio) {
      const binary = atob(data.audio)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
      }
      const blob = new Blob([bytes], { type: 'audio/mpeg' })
      console.log('[TTS] 音频大小:', blob.size)
      audioCache.set(text, blob)
      return playBlob(blob)
    }

    throw new Error('Invalid response')
  } catch (e) {
    console.error('[TTS] 错误:', e)
    throw e
  }
}

function playBlob(blob) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob)
    const audio = new Audio(url)
    audio.preload = 'auto'

    audio.onended = () => { URL.revokeObjectURL(url); resolve(true) }
    audio.onerror = (e) => { console.error('[TTS] 播放错误:', e); URL.revokeObjectURL(url); resolve(false) }

    audio.play().then(() => {
      console.log('[TTS] 播放成功')
    }).catch((e) => {
      console.error('[TTS] 播放失败:', e)
      URL.revokeObjectURL(url)
      resolve(false)
    })
  })
}

// ====== 本地 Web Speech API ======

async function speakLocal(text) {
  console.log('[TTS] 降级本地语音')
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
  console.log('[TTS] 开始:', text)
  try {
    const result = await speakCloud(text)
    console.log('[TTS] 结果:', result)
    return result
  } catch (e) {
    console.error('[TTS] 云端失败:', e)
    return speakLocal(text)
  }
}
