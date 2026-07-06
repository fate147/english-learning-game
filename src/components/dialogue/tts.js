/**
 * 朗读英文文本
 * 优先走本地 TTS 服务（Windows SAPI），失败时降级到浏览器 Web Speech API
 */

// TTS 服务器地址
// 本机访问用 localhost，其他设备改成你 Windows 电脑的局域网 IP
// 也可以在 .env 里设置 VITE_TTS_SERVER=http://192.168.x.x:9300
const TTS_SERVER = import.meta.env.VITE_TTS_SERVER || 'http://localhost:9300'

async function speakViaServer(text) {
  try {
    const url = `${TTS_SERVER}/tts?text=${encodeURIComponent(text)}`
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) return false
    const blob = await res.blob()
    const audio = new Audio(URL.createObjectURL(blob))
    await new Promise((resolve, reject) => {
      audio.onended = () => resolve()
      audio.onerror = () => reject()
      audio.play()
    })
    return true
  } catch {
    return false
  }
}

async function speakLocal(text) {
  if (!window.speechSynthesis) return false
  window.speechSynthesis.cancel()

  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 1.0
    utterance.volume = 1.0

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

export async function speakText(text) {
  if (!text) return false
  // 先试本地 TTS 服务，失败再降级到 Web Speech
  if (await speakViaServer(text)) return true
  return speakLocal(text)
}
