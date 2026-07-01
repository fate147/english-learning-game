import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './animations/character.css'
import './animations/feedback.css'
import './animations/transitions.css'
import App from './App.jsx'
import { startSync } from './lib/offline.js'
import { saveGameSession } from './lib/game.js'
import { addEarnedStars } from './lib/stars.js'
import { ToastProvider } from './components/ui/Toast.jsx'

// 离线队列重传：按类型分发
startSync(async (payload) => {
  if (payload?.type === 'add_stars') {
    return addEarnedStars(payload.userId, payload.childId, payload.totalAdd, payload.availAdd)
  }
  // 默认走游戏记录保存
  return saveGameSession(payload)
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
)
