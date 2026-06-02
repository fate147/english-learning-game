import { useContext } from 'react'
import { StarContext } from '../context/StarContext.jsx'

export function useStars() {
  const ctx = useContext(StarContext)
  if (!ctx) throw new Error('useStars 必须在 StarProvider 内使用')
  return ctx
}
