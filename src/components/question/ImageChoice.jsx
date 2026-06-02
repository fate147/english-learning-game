import { useState, useMemo, useEffect, useRef } from 'react'
import { getWordById, getWordsByUnit } from '../../lib/words.js'
import { generateChoices } from '../../engines/questionEngine.js'
import { STRINGS } from '../../config/strings.js'

export default function ImageChoice({ question, onAnswer, unit, disabled }) {
  const [selectedId, setSelectedId] = useState(null)
  const [audioFailed, setAudioFailed] = useState(false)
  const [audioPlayed, setAudioPlayed] = useState(false)
  const audioRef = useRef(null)

  const choices = useMemo(() => {
    const unitWords = getWordsByUnit(unit)
    const ids = generateChoices(question.wordId, unit, unitWords)
    return ids.map((id) => getWordById(id)).filter(Boolean)
  }, [question.wordId, unit])

  // 每新一题：更新 audio 标签的 src
  useEffect(() => {
    setSelectedId(null)
    setAudioFailed(false)
    setAudioPlayed(false)
  }, [question.wordId])

  const playAudio = () => {
    setAudioPlayed(true)
    setAudioFailed(false)
    const el = audioRef.current
    if (!el) return
    el.load()
    el.play().catch(() => {
      setAudioFailed(true)
    })
  }

  const handleSelect = (wordId) => {
    if (disabled || selectedId) return
    setSelectedId(wordId)
    const isCorrect = wordId === question.wordId
    setTimeout(() => {
      onAnswer(isCorrect)
    }, 400)
  }

  return (
    <div className="page-enter">
      {/* 隐藏 audio 元素 */}
      <audio ref={audioRef} preload="none">
        <source src={`audio/${question.wordId}.mp3`} type="audio/mpeg" />
      </audio>

      {/* 题目提示 + 播放按钮 */}
      <div className="text-center mb-4">
        <p className="text-sm text-gray-500 mb-1">{STRINGS.imageChoice.hint}</p>
        <p className="text-base font-medium text-gray-700 mb-3">
          &ldquo;{question.meaning}&rdquo;
        </p>
        <button
          onClick={playAudio}
          disabled={disabled}
          className={`play-btn-large bg-green-500 text-white text-lg font-bold
                     hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed
                     ${!audioPlayed ? 'animate-pulse' : ''}`}
        >
          <span className="flex flex-col items-center gap-0.5">
            <span className="text-xl font-bold">听</span>
            <span className="text-xs">{audioFailed ? '重试' : (audioPlayed ? '再听一次' : '点击播放')}</span>
          </span>
        </button>
      </div>

      {/* 图片选择网格 */}
      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        {choices.map((choice) => {
          const isSelected = selectedId === choice.id
          const isCorrect = choice.id === question.wordId
          const showResult = selectedId !== null

          let borderColor = 'border-gray-200'
          if (showResult && isSelected) {
            borderColor = isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
          } else if (showResult && isCorrect) {
            borderColor = 'border-green-300 bg-green-50'
          }

          return (
            <button
              key={choice.id}
              onClick={() => handleSelect(choice.id)}
              disabled={disabled || selectedId !== null}
              className={`flex flex-col relative rounded-2xl border-2 ${borderColor} overflow-hidden
                         transition-all duration-200 hover:border-green-400
                         ${selectedId ? 'cursor-default' : 'cursor-pointer hover:shadow-md'}`}
            >
              <div className="aspect-square w-full overflow-hidden bg-gray-100 flex items-center justify-center p-2">
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
              <div className="text-center py-1.5 px-1 bg-white border-t border-gray-100">
                <div className="text-sm font-bold text-gray-700">{choice.word}</div>
                <div className="text-xs text-gray-400">{choice.meaning}</div>
              </div>
              {showResult && isCorrect && (
                <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-green-500 text-white
                                flex items-center justify-center text-lg feedback-icon-appear">
                  ✓
                </div>
              )}
              {showResult && isSelected && !isCorrect && (
                <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white
                                flex items-center justify-center text-lg feedback-icon-appear">
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
