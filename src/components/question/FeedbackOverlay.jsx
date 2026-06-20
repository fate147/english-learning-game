import { useEffect, useState, useRef } from 'react'
import { STRINGS } from '../../config/strings.js'
import CharacterPortrait from '../game/CharacterPortrait.jsx'

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
      // 正确：三音阶上行 C5→E5→G5（叮咚叮）
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
      // 错误：柔和下行音（不刺耳）
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

const CORRECT_TEXTS = ['太棒了！', 'Excellent!', '真厉害！', '答对了！', 'Perfect!']
const WRONG_TEXTS = ['再想想哦', '没关系~', '加油！', '下次一定行！']

function StarParticle({ index }) {
  const angle = (index / 6) * 360
  const distance = 60 + Math.random() * 40
  const size = 14 + Math.random() * 10
  const delay = index * 0.06
  const tx = Math.cos(angle * Math.PI / 180) * distance
  const ty = Math.sin(angle * Math.PI / 180) * distance - 30
  return (
    <span
      className="star-particle"
      style={{ fontSize: size + 'px', animationDelay: delay + 's', '--tx': tx + 'px', '--ty': ty + 'px' }}
    >
      ⭐
    </span>
  )
}

export default function FeedbackOverlay({ isCorrect, word, onComplete, characterId, expression, dialogue, score }) {
  const [visible, setVisible] = useState(true)
  const [closing, setClosing] = useState(false)
  const playedRef = useRef(false)
  const [feedbackText] = useState(() =>
    isCorrect
      ? CORRECT_TEXTS[Math.floor(Math.random() * CORRECT_TEXTS.length)]
      : WRONG_TEXTS[Math.floor(Math.random() * WRONG_TEXTS.length)]
  )

  useEffect(() => {
    if (!playedRef.current) {
      playSound(isCorrect)
      playedRef.current = true
    }

    setVisible(true)
    setClosing(false)
    const delay = isCorrect ? 1400 : 2800
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
      role="status"
      aria-live="assertive"
      aria-label={isCorrect ? '回答正确' : '回答错误'}
    >
      <div
        className={`
          relative px-6 py-5 rounded-2xl shadow-2xl flex flex-col items-center gap-2 min-w-[220px] backdrop-blur-md
          ${isCorrect
            ? 'bg-green-500/90 text-white feedback-correct-pulse'
            : 'bg-slate-700/90 text-white'
          }
        `}
      >
        {/* 星星飞出效果（仅答对） */}
        {isCorrect && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {Array.from({ length: 6 }, (_, i) => (
              <StarParticle key={i} index={i} />
            ))}
          </div>
        )}

        {/* 角色形象 */}
        {characterId && (
          <div className={`mb-1 ${isCorrect ? 'feedback-char-celebrate' : 'feedback-char-encourage'}`}>
            <CharacterPortrait
              characterId={characterId}
              expression={expression || (isCorrect ? 'correct' : 'wrong')}
              dialogue={dialogue || ''}
            />
          </div>
        )}

        {/* 主文字 */}
        <div className={`feedback-icon-appear ${isCorrect ? 'text-5xl' : 'text-4xl'}`}>
          {isCorrect ? '✓' : '✗'}
        </div>
        <div className={`${isCorrect ? 'text-lg font-extrabold' : 'text-base font-bold'}`}>
          {feedbackText}
        </div>

        {/* 单词释义（答对时） */}
        {word && isCorrect && (
          <div className="text-xs opacity-90 mt-0.5">
            {word.word} — {word.meaning}
          </div>
        )}

        {/* 星星数（答对时） */}
        {isCorrect && score !== undefined && (
          <div className="mt-1 text-sm font-bold opacity-90">
            ⭐ {score}
          </div>
        )}

        {/* 正确答案卡片（答错时） */}
        {word && !isCorrect && (
          <div className="mt-2 bg-white/15 backdrop-blur rounded-xl px-4 py-2.5 text-center border border-white/20">
            <div className="text-xl font-black">{word.word}</div>
            <div className="text-xs opacity-70 mt-0.5">{word.meaning}</div>
          </div>
        )}

        {/* 角色鼓励文字 */}
        {dialogue && (
          <div className={`mt-1 text-xs font-medium ${isCorrect ? 'opacity-80' : 'opacity-60'}`}>
            「{dialogue}」
          </div>
        )}
      </div>
    </div>
  )
}
