import { useContext } from 'react'
import { ChildContext } from '../context/ChildContext.jsx'

export function useChild() {
  const ctx = useContext(ChildContext)
  if (!ctx) throw new Error('useChild 必须在 ChildProvider 内使用')
  return ctx
}
