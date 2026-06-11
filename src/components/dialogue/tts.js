/**
 * 朗读英文文本（Web Speech API）
 * 按平台优选语音：iOS → Samantha，Windows → Zira/David，Android → Google
 * 兼容鸿蒙等无英文语音数据的设备：用系统默认引擎朗读，不卡流程
 */

let voicesReady = false

function waitVoices() {
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
    window.speechSynthesis.onvoiceschanged = () => {
      voicesReady = true
      window.speechSynthesis.onvoiceschanged = null
      resolve()
    }
    setTimeout(() => {
      voicesReady = true
      resolve()
    }, 1500)
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
  if (!window.speechSynthesis) return false

  await waitVoices()
  window.speechSynthesis.cancel()

  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.85
    utterance.pitch = 1.0
    utterance.volume = 1.0

    // 有英文语音就优选，没有就交给系统默认引擎
    const voices = window.speechSynthesis.getVoices()
    const voice = pickVoice(voices)
    if (voice) utterance.voice = voice

    utterance.onend = () => resolve(true)
    utterance.onerror = () => resolve(false)
    try {
      window.speechSynthesis.speak(utterance)
    } catch {
      resolve(false)
    }
  })
}
