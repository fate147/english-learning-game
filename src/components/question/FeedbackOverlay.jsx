import { useEffect, useRef } from 'react'

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
      const notes = [523, 659, 784]
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.value = freq
        const t = ctx.currentTime + i * 0.1
        gain.gain.setValueAtTime(0, t)
        gain.gain.linearRampToValueAtTime(0.25, t + 0.03)
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(t)
        osc.stop(t + 0.3)
      })
    } else {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(330, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.2)
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.3)
    }
  } catch {}
}

export default function FeedbackOverlay({ isCorrect, word, onComplete, characterId, expression, dialogue, score }) {
  const playedRef = useRef(false)

  useEffect(() => {
    if (!playedRef.current) {
      playSound(isCorrect)
      playedRef.current = true
    }

    const delay = isCorrect ? 1000 : 1500
    const timer = setTimeout(() => {
      playedRef.current = false
      onComplete?.()
    }, delay)
    return () => clearTimeout(timer)
  }, [isCorrect, word, onComplete])

  return null
}
