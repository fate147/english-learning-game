/**
 * 朗读英文文本（Web Speech API）
 * 按平台优选语音：iOS → Samantha，Windows → Zira/David，Android → Google
 */

let cachedVoices = null

function getBestEnglishVoice() {
  if (cachedVoices && cachedVoices.length > 0) return pickVoice(cachedVoices)
  const voices = window.speechSynthesis.getVoices()
  cachedVoices = voices
  return pickVoice(voices)
}

function pickVoice(voices) {
  if (!voices || voices.length === 0) return null

  // 优选名单（按音质排序）
  const preferred = ['Samantha', 'Microsoft Zira', 'Microsoft David', 'Google US English', 'Google UK English Female', 'Google UK English Male']

  for (const name of preferred) {
    const found = voices.find((v) => v.name.includes(name))
    if (found) return found
  }

  // 没有优选语音，随便找一个英文的
  return voices.find((v) => v.lang.startsWith('en')) || voices[0]
}

export function speakText(text) {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) {
      resolve()
      return
    }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.85
    utterance.pitch = 1.0
    utterance.volume = 1.0
    const voice = getBestEnglishVoice()
    if (voice) utterance.voice = voice
    utterance.onend = () => resolve()
    utterance.onerror = () => resolve()
    window.speechSynthesis.speak(utterance)
  })
}
