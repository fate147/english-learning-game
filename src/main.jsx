import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './animations/character.css'
import './animations/feedback.css'
import './animations/transitions.css'
import App from './App.jsx'
import { startSync } from './lib/offline.js'
import { saveGameSession, updateWordProgress } from './lib/game.js'
import { addEarnedStars } from './lib/stars.js'
import { ToastProvider } from './components/ui/Toast.jsx'

// 离线队列重传：按类型分发
startSync(async (payload) => {
  if (payload?.type === 'add_stars') {
    return addEarnedStars(payload.userId, payload.childId, payload.totalAdd, payload.availAdd)
  }
  // 默认走游戏记录保存
  const result = await saveGameSession(payload)
  // 同时更新单词进度（离线期间积累的答题结果）
  if (payload?.results && Array.isArray(payload.results) && payload.results.length > 0) {
    const uid = payload.user_id
    const cid = payload.child_id
    const subj = payload.subject || 'english'
    const grd = payload.grade || 3
    if (uid && cid) {
      updateWordProgress(uid, cid, subj, grd, payload.results).catch(() => {})
    }
  }
  return result
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
)
