import { useState, useCallback, useRef } from 'react'
import { speakText } from './tts.js'
import { vibrate } from '../../lib/haptics.js'

export default function ChoicePanel({ choices, onComplete, disabled }) {
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [showCn, setShowCn] = useState(false)
  const busyRef = useRef(false)

  const handleSelect = useCallback(async (index) => {
    if (disabled || selectedIndex !== null || busyRef.current) return
    busyRef.current = true
    setSelectedIndex(index)

    const isCorrect = choices[index].correct
    if (!isCorrect) vibrate([80, 40, 80])

    await speakText(choices[index].text)

    // 显示中文翻译，停留后再进入下一题
    setShowCn(true)
    setTimeout(() => {
      setSelectedIndex(null)
      setShowCn(false)
      busyRef.current = false
      onComplete(isCorrect)
    }, 1800)
  }, [disabled, selectedIndex, choices, onComplete])

  const getButtonStyle = (index) => {
    const base = 'w-full px-4 py-3.5 rounded-xl font-bold text-left transition-all duration-150 border-2 '
    if (selectedIndex === null) {
      return base + 'bg-white/10 border-white/30 text-white hover:bg-white/15 hover:border-white/50 active:scale-[0.97]'
    }
    if (index === selectedIndex) {
      if (choices[index].correct) {
        return base + 'bg-green-400/30 border-green-400 text-green-200 ring-2 ring-green-400/50'
      }
      return base + 'bg-red-400/30 border-red-400 text-red-200'
    }
    if (choices[index].correct && selectedIndex !== null && !choices[selectedIndex].correct) {
      return base + 'bg-green-400/20 border-green-400/50 text-green-200'
    }
    return base + 'bg-white/5 border-white/20 text-white/50'
  }

  return (
    <div className="w-full max-w-lg mx-auto space-y-2">
      <div className="text-center text-white/75 text-xs font-bold mb-1">选择回复</div>
      {choices.map((choice, index) => (
        <button
          key={index}
          onClick={() => handleSelect(index)}
          disabled={selectedIndex !== null}
          className={getButtonStyle(index)}
        >
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              {String.fromCharCode(65 + index)}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm leading-snug font-bold">
                "{choice.text}"
              </div>
              {showCn && index === selectedIndex && choice.cn && (
                <div className="text-xs mt-1 text-white/75 animate-toast-in">{choice.cn}</div>
              )}
            </div>
            {selectedIndex !== null && (
              <span className="text-lg shrink-0">
                {index === selectedIndex
                  ? (choice.correct ? '✓' : '✗')
                  : (choice.correct ? '✓' : '')}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}
