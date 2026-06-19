import { useState, useCallback, useRef } from 'react'
import { speakText } from './tts.js'

function vibrate(pattern) {
  try { navigator.vibrate?.(pattern) } catch {}
}

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
    if (!isCorrect) vibrate([80, 40, 80])

    await speakText(choices[index].text)

    setTimeout(() => {
      setSelectedIndex(null)
      setShowResult(false)
      busyRef.current = false
      onComplete(isCorrect)
    }, 500)
  }, [disabled, selectedIndex, choices, onComplete])

  const getButtonStyle = (index) => {
    const base = 'w-full px-5 py-4 rounded-2xl font-bold text-left transition-all duration-300 border-2 shadow-md '
    if (selectedIndex === null) {
      return base + 'bg-white/20 backdrop-blur-sm border-white/15 text-white hover:bg-white/30 hover:border-white/25 active:scale-[0.97]'
    }
    if (index === selectedIndex) {
      if (choices[index].correct) {
        return base + 'bg-green-500/40 border-green-400 text-white scale-[1.02] option-correct'
      }
      return base + 'bg-red-500/40 border-red-400 text-white option-wrong'
    }
    if (choices[index].correct && selectedIndex !== null && !choices[selectedIndex].correct) {
      return base + 'bg-green-500/25 border-green-400/50 text-white option-reveal-correct'
    }
    return base + 'bg-white/8 border-white/8 text-white/30'
  }

  return (
    <div className="w-full max-w-lg mx-auto space-y-3">
      <div className="text-center text-white/45 text-xs font-bold mb-1">选择回复</div>
      {choices.map((choice, index) => (
        <button
          key={index}
          onClick={() => handleSelect(index)}
          disabled={selectedIndex !== null}
          className={getButtonStyle(index)}
        >
          <div className="flex items-start gap-3">
            {/* 回复序号 */}
            <span className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              {String.fromCharCode(65 + index)}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-base leading-snug font-bold">
                "{choice.text}"
              </div>
              {choice.cn && (
                <div className="text-xs mt-1 text-white/55">{choice.cn}</div>
              )}
            </div>
            {showResult && index === selectedIndex && (
              <span className="text-lg shrink-0">{choice.correct ? '✅' : '❌'}</span>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}
