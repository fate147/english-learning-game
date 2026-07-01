import { useState, useMemo, useEffect, useRef } from 'react'
import { getWordById, getWordsByUnit } from '../../lib/words.js'
import { generateChoices } from '../../engines/questionEngine.js'
import { vibrate } from '../../lib/haptics.js'

export default function ImageChoice({ question, onAnswer, unit, disabled }) {
  const [selectedId, setSelectedId] = useState(null)
  const [audioFailed, setAudioFailed] = useState(false)
  const [audioPlayed, setAudioPlayed] = useState(false)
  const [answerState, setAnswerState] = useState(null)
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

      <button
        onClick={playAudio}
        disabled={disabled}
        type="button"
        aria-label="播放发音"
        className="w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-200 hover:scale-105 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #6aab8a 0%, #5a9a7a 100%)', color: 'white' }}
      >
        🔊
      </button>

      <div className="w-full max-w-4xl text-center">
        <div className="text-xs font-bold tracking-wider text-white/75 uppercase mb-2">
          听录音，选择正确的答案
        </div>
        <div className="text-lg font-bold text-white">
          哪个是 <strong className="text-yellow-400">"{question.meaning}"</strong> ？
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

          let cardStyle = 'bg-white/10 border-white/20'
          if (showResult && isSelected) {
            cardStyle = isCorrect
              ? 'bg-green-400/30 border-green-400 ring-2 ring-green-400/50 option-correct'
              : 'bg-red-400/30 border-red-400 ring-2 ring-red-400/50 option-wrong'
          } else if (showResult && isCorrect) {
            cardStyle = 'bg-green-400/20 border-green-400/50 option-reveal-correct'
          }

          return (
            <button
              key={choice.id}
              onClick={() => handleSelect(choice.id)}
              disabled={disabled || selectedId !== null}
              className={`glass-card p-6 flex flex-col items-center justify-center min-h-[120px] transition-all duration-150 cursor-pointer relative ${cardStyle} ${selectedId ? 'cursor-default' : 'hover:scale-[1.02] active:scale-[0.97]'}`}
            >
              <div className="text-2xl font-bold text-white mb-1">{choice.word}</div>
              <div className="text-sm text-white/75">{choice.phonetic}</div>
              {showResult && isCorrect && (
                <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-green-500 text-white
                                flex items-center justify-center text-sm font-bold option-correct">
                  ✓
                </div>
              )}
              {showResult && isSelected && !isCorrect && (
                <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white
                                flex items-center justify-center text-sm font-bold option-wrong">
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
