import { useState, useCallback, useRef } from 'react'

/**
 * 朗读英文文本（Web Speech API）
 * 返回 Promise，朗读完成后 resolve
 */
function speakText(text) {
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
    const voices = window.speechSynthesis.getVoices()
    const enVoice = voices.find((v) => v.lang.startsWith('en'))
    if (enVoice) utterance.voice = enVoice
    utterance.onend = () => resolve()
    utterance.onerror = () => resolve()
    window.speechSynthesis.speak(utterance)
  })
}

/**
 * 选项面板组件
 *
 * 显示 3-4 个候选回复按钮（英中双语），点击后播放语音 + 反馈正确/错误
 * 语音播完才进入下一轮
 */
export default function ChoicePanel({ choices, onComplete, disabled }) {
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const busyRef = useRef(false)

  const handleSelect = useCallback(async (index) => {
    if (disabled || selectedIndex !== null || busyRef.current) return
    busyRef.current = true
    setSelectedIndex(index)
    setShowResult(true)

    const isCorrect = choices[index].correct

    // 播放语音，等待读完
    await speakText(choices[index].text)

    // 语音播完后 500ms 再进入下一轮（让视觉反馈停留一下）
    setTimeout(() => {
      setSelectedIndex(null)
      setShowResult(false)
      busyRef.current = false
      onComplete(isCorrect)
    }, 500)
  }, [disabled, selectedIndex, choices, onComplete])

  const getButtonStyle = (index) => {
    const base = 'w-full px-5 py-3.5 rounded-2xl font-bold text-left transition-all duration-300 border-2 shadow-md '
    if (selectedIndex === null) {
      return base + 'bg-white/40 backdrop-blur-sm border-white/30 text-white drop-shadow-sm hover:bg-white/55 hover:border-white/50 active:scale-[0.97]'
    }
    if (index === selectedIndex) {
      if (choices[index].correct) {
        return base + 'bg-green-500/50 border-green-400 text-white scale-[1.02]'
      }
      return base + 'bg-red-500/50 border-red-400 text-white'
    }
    if (choices[index].correct && selectedIndex !== null && !choices[selectedIndex].correct) {
      return base + 'bg-green-500/40 border-green-400/60 text-white'
    }
    return base + 'bg-white/10 border-white/10 text-white/40'
  }

  return (
    <div className="w-full max-w-lg mx-auto space-y-3">
      {choices.map((choice, index) => (
        <button
          key={index}
          onClick={() => handleSelect(index)}
          disabled={selectedIndex !== null}
          className={getButtonStyle(index)}
        >
          <div className="flex items-center justify-between">
            <span className="text-base leading-snug font-bold">{choice.text}</span>
            {showResult && index === selectedIndex && (
              <span className="ml-2 text-lg">{choice.correct ? '✅' : '❌'}</span>
            )}
          </div>
          {choice.cn && (
            <div className="text-xs mt-1 text-white/80">{choice.cn}</div>
          )}
        </button>
      ))}
    </div>
  )
}
