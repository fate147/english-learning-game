import { useState, useEffect, useRef } from 'react'
import { CHARACTERS } from '../../config/characters.js'
import { speakText } from './tts.js'

/**
 * NPC 对话气泡组件
 *
 * 显示角色头像 + 角色名称 + 英语句子（打字机效果）
 * 打字完毕后显示中文翻译 + 自动朗读英语句子（Web Speech API）
 * 通过 key 变化触发重播
 */
export default function DialogueBubble({ characterId, text, cn, onTypingDone, autoSpeak }) {
  const [displayed, setDisplayed] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [showCn, setShowCn] = useState(false)
  const [imgError, setImgError] = useState(false)
  const char = CHARACTERS.find((c) => c.id === characterId) || CHARACTERS[0]
  const textRef = useRef(text)
  const spokenRef = useRef(false)

  // 打字机效果
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

  // 打字结束后自动朗读
  useEffect(() => {
    if (!isTyping && autoSpeak && !spokenRef.current && text) {
      spokenRef.current = true
      setIsSpeaking(true)
      speakText(text).then(() => setIsSpeaking(false))
    }
  }, [isTyping, autoSpeak, text])

  return (
    <div className="flex items-start gap-3 max-w-lg mx-auto">
      {/* 角色头像 */}
      <div className="w-16 h-16 rounded-full bg-white/20 shrink-0 flex items-center justify-center text-3xl overflow-hidden border-2 border-white/30">
        <img
          src={`images/${char.image}_normal.png`}
          alt={char.name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
        {imgError && <span className="text-2xl">{char.emoji}</span>}
      </div>

      {/* 对话气泡 */}
      <div className="flex-1">
        <div className="text-sm font-bold text-white/80 mb-1">{char.name}</div>
        <div className="relative bg-white/35 backdrop-blur-sm rounded-2xl rounded-tl-sm px-5 py-3.5 border border-white/20 shadow-lg">
          {/* 英文 */}
          <p className="text-white text-lg font-bold leading-relaxed drop-shadow-sm">
            {displayed}
            {isTyping && <span className="inline-block w-0.5 h-5 bg-yellow-300 ml-0.5 animate-pulse" />}
            {!isTyping && isSpeaking && (
              <span className="inline-flex gap-0.5 ml-2">
                <span className="w-1 h-3 bg-green-300 rounded-full animate-bounce" style={{animationDelay:'0ms'}} />
                <span className="w-1 h-4 bg-green-300 rounded-full animate-bounce" style={{animationDelay:'150ms'}} />
                <span className="w-1 h-2 bg-green-300 rounded-full animate-bounce" style={{animationDelay:'300ms'}} />
              </span>
            )}
          </p>
          {/* 中文翻译 — 打字结束后显示 */}
          {showCn && cn && (
            <p className="text-white/80 text-sm mt-1.5 border-t border-white/20 pt-1.5">
              {cn}
            </p>
          )}
          {/* 气泡三角 */}
          <div className="absolute -left-1.5 top-3 w-3 h-3 bg-white/35 backdrop-blur-sm border-l border-b border-white/20 transform rotate-45" />
        </div>
      </div>
    </div>
  )
}
