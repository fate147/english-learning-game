import { useContext } from 'react'
import { GameContext } from '../context/GameContext.jsx'

export function useGameSession() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGameSession 必须在 GameProvider 内使用')
  return ctx
}
