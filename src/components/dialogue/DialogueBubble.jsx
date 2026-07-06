import { useState, useEffect, useRef } from 'react'
import { CHARACTERS } from '../../config/characters.js'
import { speakText } from './tts.js'

export default function DialogueBubble({ characterId, text, cn, onTypingDone, autoSpeak }) {
  const [displayed, setDisplayed] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [showCn, setShowCn] = useState(false)
  const [imgError, setImgError] = useState(false)
  const char = CHARACTERS.find((c) => c.id === characterId) || CHARACTERS[0]
  const textRef = useRef(text)
  const spokenRef = useRef(false)

  useEffect(() => {
    textRef.current = text
    spokenRef.current = false
    setDisplayed('')
    setIsTyping(true)
    setIsSpeaking(false)
    setShowCn(false)
    let i = 0
    const timer = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(timer)
        setIsTyping(false)
        setShowCn(true)
      }
    }, 40)
    return () => clearInterval(timer)
  }, [text, onTypingDone])

  useEffect(() => {
    if (!isTyping && autoSpeak && !spokenRef.current && text) {
      spokenRef.current = true
      setIsSpeaking(true)
      speakText(text).then(() => {
        setIsSpeaking(false)
        onTypingDone?.()
      })
    }
    if (!isTyping && !autoSpeak) {
      onTypingDone?.()
    }
  }, [isTyping, autoSpeak, text, onTypingDone])

  return (
    <div className="max-w-lg mx-auto">
      <div className="relative rounded-2xl p-4 sm:p-5 bg-white/10 border border-white/20 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-12 h-12 rounded-xl overflow-hidden border border-white/20 shrink-0
                           flex items-center justify-center ${isSpeaking ? 'ring-2 ring-green-400/50' : ''}`}>
            <img
              src={`images/${char.image}_normal.png`}
              alt={char.name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
            {imgError && <span className="text-lg font-bold text-white/50">?</span>}
          </div>
          <div>
            <div className="text-sm font-bold text-white">{char.name}</div>
            <div className="text-[10px] text-white/75">{isSpeaking ? '正在说话...' : isTyping ? '正在输入...' : ''}</div>
          </div>
          {isSpeaking && (
            <div className="ml-auto flex items-end gap-0.5 h-3">
              {[0, 1, 2, 3].map(i => (
                <span key={i} className="w-0.5 bg-green-400 rounded-full dialogue-wave"
                  style={{ animationDelay: `${i * 100}ms` }} />
              ))}
            </div>
          )}
        </div>

        <div className="relative bg-white/10 rounded-xl rounded-tl-sm px-4 py-3 border border-white/20">
          <p className="text-white text-base font-bold leading-relaxed">
            "{displayed}"
            {isTyping && <span className="inline-block w-0.5 h-4 bg-white ml-0.5 animate-pulse" />}
          </p>
          {showCn && cn && (
            <p className="text-white/75 text-sm mt-2 border-t border-white/20 pt-2">
              {cn}
            </p>
          )}
          <div className="absolute -left-1.5 top-4 w-3 h-3 bg-white/10 border-l border-b border-white/20 transform rotate-45" />
        </div>
      </div>
    </div>
  )
}
