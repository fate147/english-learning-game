import { useState, useMemo, useEffect, useRef } from 'react'
import { getWordById, getWordsByUnit } from '../../lib/words.js'
import { generateChoices } from '../../engines/questionEngine.js'
import { STRINGS } from '../../config/strings.js'

function vibrate(pattern) {
  try { navigator.vibrate?.(pattern) } catch {}
}

export default function ImageChoice({ question, onAnswer, unit, disabled }) {
  const [selectedId, setSelectedId] = useState(null)
  const [audioFailed, setAudioFailed] = useState(false)
  const [audioPlayed, setAudioPlayed] = useState(false)
  const [answerState, setAnswerState] = useState(null) // { id, correct }
  const audioRef = useRef(null)

  const choices = useMemo(() => {
    const unitWords = getWordsByUnit(unit)
    const ids = generateChoices(question.wordId, unit, unitWords)
    return ids.map((id) => getWordById(id)).filter(Boolean)
  }, [question.wordId, unit])

  useEffect(() => {
    setSelectedId(null)
    setAudioFailed(false)
    setAudioPlayed(false)
    setAnswerState(null)
  }, [question.wordId])

  const playAudio = () => {
    setAudioPlayed(true)
    setAudioFailed(false)
    const el = audioRef.current
    if (!el) return
    el.load()
    el.play().catch(() => setAudioFailed(true))
  }

  const handleSelect = (wordId) => {
    if (disabled || selectedId) return
    setSelectedId(wordId)
    const isCorrect = wordId === question.wordId
    setAnswerState({ id: wordId, correct: isCorrect })
    if (!isCorrect) vibrate([80, 40, 80])
    setTimeout(() => {
      onAnswer(isCorrect)
    }, 500)
  }

  return (
    <div className="page-enter flex flex-col items-center gap-4">
      <audio ref={audioRef} preload="none">
        <source src={`audio/${question.wordId}.mp3`} type="audio/mpeg" />
      </audio>

      <button onClick={playAudio} disabled={disabled} className="play-btn-pulse" type="button">
        🔊
      </button>

      <div className="q-card-glass w-full max-w-4xl">
        <div className="text-xs font-bold tracking-wider text-white/70 uppercase mb-2">
          🎧 {STRINGS.imageChoice.hint}
        </div>
        <div className="text-lg font-extrabold text-white" style={{textShadow: '0 1px 4px rgba(0,0,0,0.2)'}}>
          哪个是 <strong className="text-[#fef3c7]">"{question.meaning}"</strong> ？
        </div>
        {audioFailed && (
          <div className="text-xs text-red-300 mt-2">播放失败，点击重试</div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 w-full max-w-4xl">
        {choices.map((choice) => {
          const isSelected = selectedId === choice.id
          const isCorrect = choice.id === question.wordId
          const showResult = selectedId !== null

          let extraClass = ''
          if (showResult && isSelected) {
            extraClass = isCorrect
              ? 'ring-4 ring-green-400 bg-green-500/20 option-correct'
              : 'ring-4 ring-red-400 bg-red-500/20 option-wrong'
          } else if (showResult && isCorrect) {
            extraClass = 'ring-4 ring-green-300 bg-green-500/10 option-reveal-correct'
          }

          return (
            <button
              key={choice.id}
              onClick={() => handleSelect(choice.id)}
              disabled={disabled || selectedId !== null}
              className={`glass-option flex flex-col items-center gap-1.5 p-4 relative ${extraClass} ${selectedId ? 'cursor-default' : ''}`}
            >
              <div className="w-full aspect-square rounded-2xl overflow-hidden bg-white/10 flex items-center justify-center p-3">
                <img
                  src={`images/words/${choice.id}.webp`}
                  alt={choice.word}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.parentElement.textContent = '📷'
                  }}
                />
              </div>
              <div className="text-sm font-bold text-white">{choice.word}</div>
              <div className="text-xs text-white/70">{choice.phonetic}</div>
              {showResult && isCorrect && (
                <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-green-500 text-white
                                flex items-center justify-center text-lg font-bold option-correct">
                  ✓
                </div>
              )}
              {showResult && isSelected && !isCorrect && (
                <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white
                                flex items-center justify-center text-lg font-bold option-wrong">
                  ✗
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
