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
        onTypingDone?.()
      }
    }, 40)
    return () => clearInterval(timer)
  }, [text, onTypingDone])

  useEffect(() => {
    if (!isTyping && autoSpeak && !spokenRef.current && text) {
      spokenRef.current = true
      setIsSpeaking(true)
      speakText(text).then(() => setIsSpeaking(false))
    }
  }, [isTyping, autoSpeak, text])

  return (
    <div className="max-w-lg mx-auto">
      {/* 对话场景容器 */}
      <div className="relative bg-white/8 backdrop-blur-sm rounded-3xl p-4 sm:p-5 border border-white/10">
        {/* 角色信息 + 头像 */}
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/25 bg-white/10 shrink-0
                           flex items-center justify-center dialogue-avatar-frame ${isSpeaking ? 'dialogue-speaking' : ''}`}>
            <img
              src={`images/${char.image}_normal.png`}
              alt={char.name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
            {imgError && <span className="text-2xl">{char.emoji}</span>}
          </div>
          <div>
            <div className="text-sm font-black text-white/90">{char.name}</div>
            <div className="text-[10px] text-white/40">{isSpeaking ? '正在说话...' : isTyping ? '正在输入...' : ''}</div>
          </div>
          {/* 语音波形指示器 */}
          {isSpeaking && (
            <div className="ml-auto flex items-end gap-0.5 h-4">
              {[0, 1, 2, 3].map(i => (
                <span key={i} className="w-1 bg-green-400 rounded-full dialogue-wave"
                  style={{ animationDelay: `${i * 100}ms` }} />
              ))}
            </div>
          )}
        </div>

        {/* 对话气泡 */}
        <div className="relative bg-white/20 backdrop-blur-sm rounded-2xl rounded-tl-sm px-5 py-4 border border-white/15 shadow-lg">
          <p className="text-white text-lg font-bold leading-relaxed drop-shadow-sm">
            "{displayed}"
            {isTyping && <span className="inline-block w-0.5 h-5 bg-yellow-300 ml-0.5 animate-pulse" />}
          </p>
          {showCn && cn && (
            <p className="text-white/65 text-sm mt-2 border-t border-white/15 pt-2">
              {cn}
            </p>
          )}
          <div className="absolute -left-1.5 top-4 w-3 h-3 bg-white/20 border-l border-b border-white/15 transform rotate-45" />
        </div>
      </div>
    </div>
  )
}
