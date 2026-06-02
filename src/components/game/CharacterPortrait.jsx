import { getCharacter, getRandomDialogue } from '../../config/characters.js'

// 角色对应 happy/normal/sad 图片后缀
const EXPRESSION = { correct: 'happy', neutral: 'normal', wrong: 'sad' }

export default function CharacterPortrait({ characterId, expression, dialogue }) {
  const char = getCharacter(characterId)
  const imgKey = EXPRESSION[expression] || 'normal'

  const imgName = char.image || characterId
  const imgExt = char.ext || 'webp'
  const imgSrc = `images/${imgName}_${imgKey}.${imgExt}`

  return (
    <div className="flex flex-col items-center gap-0.5">
      <img
        src={imgSrc}
        alt={char.name}
        className="w-24 h-24 object-contain drop-shadow-sm"
        onError={(e) => { e.target.style.display = 'none' }}
      />

    </div>
  )
}
