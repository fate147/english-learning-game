import { useEffect, useState, useRef } from 'react'
import { STRINGS } from '../../config/strings.js'
import CharacterPortrait from '../game/CharacterPortrait.jsx'

// 模块级单例 AudioContext，避免泄漏（浏览器限制约 6 个并发）
let audioCtx = null
function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

function playSound(isCorrect) {
  try {
    const ctx = getAudioCtx()

    if (isCorrect) {
      // 正确：两个上升音阶 C5 → E5（欢快）
      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      osc1.type = 'sine'
      osc1.frequency.value = 523
      gain1.gain.setValueAtTime(0.3, ctx.currentTime)
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
      osc1.connect(gain1)
      gain1.connect(ctx.destination)
      osc1.start(ctx.currentTime)
      osc1.stop(ctx.currentTime + 0.3)

      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.type = 'sine'
      osc2.frequency.value = 659
      gain2.gain.setValueAtTime(0.01, ctx.currentTime)
      gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.12)
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.start(ctx.currentTime + 0.12)
      osc2.stop(ctx.currentTime + 0.4)
    } else {
      // 错误：短促低音 A3（柔和提示）
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.value = 220
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.25)
    }
  } catch {
    // 音效失败不影响功能
  }
}

export default function FeedbackOverlay({ isCorrect, word, onComplete, characterId, expression, dialogue, score }) {
  const [visible, setVisible] = useState(true)
  const [closing, setClosing] = useState(false)
  const playedRef = useRef(false)

  useEffect(() => {
    // 每次新反馈只播一次
    if (!playedRef.current) {
      playSound(isCorrect)
      playedRef.current = true
    }

    setVisible(true)
    setClosing(false)
    const delay = isCorrect ? 800 : 3000
    const timer = setTimeout(() => {
      setClosing(true)
      setTimeout(() => {
        setVisible(false)
        playedRef.current = false
        onComplete?.()
      }, isCorrect ? 200 : 300)
    }, delay)
    return () => clearTimeout(timer)
  }, [isCorrect, word, onComplete])

  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-40 flex items-center justify-center pointer-events-none
        ${closing ? 'feedback-pop-out' : 'feedback-pop-in'}`}
    >
      <div
        className={`
          px-6 py-5 rounded-2xl shadow-2xl flex flex-col items-center gap-2 min-w-[200px] backdrop-blur-md
          ${isCorrect
            ? 'bg-green-500/90 text-white feedback-correct-pulse'
            : 'bg-red-500/90 text-white feedback-error-shake'
          }
        `}
      >
        {characterId && (
          <div className="mb-1">
            <CharacterPortrait
              characterId={characterId}
              expression={expression || (isCorrect ? 'correct' : 'wrong')}
              dialogue={dialogue || ''}
            />
          </div>
        )}
        <div className={`feedback-icon-appear ${isCorrect ? 'text-5xl' : 'text-4xl'}`}>
          {isCorrect ? '✓' : '✗'}
        </div>
        <div className={`${isCorrect ? 'text-lg font-extrabold' : 'text-base font-bold'}`}>
          {isCorrect ? STRINGS.feedback.correct : STRINGS.feedback.wrong}
        </div>
        {word && isCorrect && (
          <div className="text-xs opacity-90">
            {word.word} — {word.meaning}
          </div>
        )}
        {isCorrect && score !== undefined && (
          <div className="mt-1 text-sm font-bold opacity-90">
            ⭐ {score}
          </div>
        )}
        {word && !isCorrect && (
          <div className="mt-1 bg-white/90 backdrop-blur rounded-lg px-4 py-2 text-center border-2 border-red-300">
            <div className="text-xl font-black text-red-600">{word.word}</div>
            <div className="text-xs font-medium text-red-400">{word.meaning}</div>
          </div>
        )}
      </div>
    </div>
  )
}
