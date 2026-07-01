import { createContext, useState, useContext, useCallback, useEffect } from 'react'
import { THEMES, getSavedTheme, saveTheme } from '../config/themes.js'

const GameThemeContext = createContext(null)

export function GameThemeProvider({ children }) {
  const [gameTheme, setGameThemeState] = useState(getSavedTheme)

  const setGameTheme = useCallback((theme) => {
    setGameThemeState(theme)
    saveTheme(theme.id)
  }, [])

  const setGameThemeById = useCallback((themeId) => {
    const theme = THEMES.find(t => t.id === themeId)
    if (theme) setGameTheme(theme)
  }, [setGameTheme])

  // 应用主题到 CSS 变量
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--game-primary', gameTheme.colors.primary)
    root.style.setProperty('--game-primary-hover', gameTheme.colors.primaryHover)
    root.style.setProperty('--game-gradient', gameTheme.colors.gradient)
    root.style.setProperty('--game-gradient-hover', gameTheme.colors.gradientHover || gameTheme.colors.gradient)
  }, [gameTheme])

  return (
    <GameThemeContext.Provider value={{ gameTheme, setGameTheme, setGameThemeById }}>
      {children}
    </GameThemeContext.Provider>
  )
}

export function useGameTheme() {
  return useContext(GameThemeContext)
}
