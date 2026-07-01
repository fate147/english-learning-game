// 游戏主题配置
export const THEMES = [
  {
    id: 'green',
    name: '森林绿',
    colors: {
      primary: '#6aab8a',
      primaryHover: '#5a9a7a',
      gradient: 'linear-gradient(135deg, #6aab8a 0%, #7ab0c0 100%)',
      gradientHover: 'linear-gradient(135deg, #5a9a7a 0%, #6aa0b0 100%)',
    },
    pattern: 'bg-green-pattern',
  },
  {
    id: 'candy',
    name: '糖果粉',
    colors: {
      primary: '#e0527a',
      primaryHover: '#d9436a',
      gradient: 'linear-gradient(135deg, #e0527a 0%, #d9734a 100%)',
      gradientHover: 'linear-gradient(135deg, #d9436a 0%, #c9633a 100%)',
    },
    pattern: 'bg-candy-pattern',
  },
  {
    id: 'purple',
    name: '梦幻紫',
    colors: {
      primary: '#9b6bb5',
      primaryHover: '#8a5aa5',
      gradient: 'linear-gradient(135deg, #9b6bb5 0%, #c47a9e 100%)',
      gradientHover: 'linear-gradient(135deg, #8a5aa5 0%, #b46a8e 100%)',
    },
    pattern: 'bg-purple-pattern',
  },
]

const STORAGE_KEY = 'game_theme'

export function getSavedTheme() {
  const saved = localStorage.getItem(STORAGE_KEY)
  return THEMES.find(t => t.id === saved) || THEMES[0]
}

export function saveTheme(themeId) {
  localStorage.setItem(STORAGE_KEY, themeId)
}
