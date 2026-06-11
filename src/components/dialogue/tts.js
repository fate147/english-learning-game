/**
 * 朗读英文文本（Web Speech API）
 * 按平台优选语音：iOS → Samantha，Windows → Zira/David，Android → Google
 * 兼容华为等国产平板（需已安装英文语音数据）
 */

let voicesReady = false
let voiceQueue = []

// 等待语音列表加载完成（某些浏览器需要异步加载）
function ensureVoicesLoaded() {
  return new Promise((resolve) => {
    if (voicesReady) {
      resolve()
      return
    }
    const voices = window.speechSynthesis.getVoices()
    if (voices && voices.length > 0) {
      voicesReady = true
      resolve()
      return
    }
    // 等待 onvoiceschanged 事件
    window.speechSynthesis.onvoiceschanged = () => {
      voicesReady = true
      window.speechSynthesis.onvoiceschanged = null
      resolve()
    }
    // 兜底：1 秒后不管有没有都继续
    setTimeout(() => {
      voicesReady = true
      resolve()
    }, 1000)
  })
}

function pickVoice(voices) {
  if (!voices || voices.length === 0) return null
  const preferred = ['Samantha', 'Microsoft Zira', 'Microsoft David', 'Google US English', 'Google UK English Female', 'Google UK English Male']
  for (const name of preferred) {
    const found = voices.find((v) => v.name.includes(name))
    if (found) return found
  }
  return voices.find((v) => v.lang.startsWith('en')) || null
}

export async function speakText(text) {
  if (!window.speechSynthesis) return

  await ensureVoicesLoaded()
  window.speechSynthesis.cancel()

  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.85
    utterance.pitch = 1.0
    utterance.volume = 1.0

    const voices = window.speechSynthesis.getVoices()
    const voice = pickVoice(voices)
    if (voice) utterance.voice = voice

    utterance.onend = () => resolve()
    utterance.onerror = () => {
      // 无声卡或语音数据缺失时静默跳过，不影响流程
      resolve()
    }
    window.speechSynthesis.speak(utterance)
  })
}
