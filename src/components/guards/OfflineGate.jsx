import { useState, useEffect } from 'react'
import { STRINGS } from '../../config/strings.js'

const CACHE_KEY = 'app_data'

export default function OfflineGate({ children }) {
  const [checking, setChecking] = useState(true)
  const [showOffline, setShowOffline] = useState(false)

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = () => {
    const isOnline = navigator.onLine
    const hasCache = localStorage.getItem(CACHE_KEY) !== null

    if (!isOnline && !hasCache) {
      setShowOffline(true)
    } else {
      setShowOffline(false)
    }
    setChecking(false)
  }

  // 网络恢复监听
  useEffect(() => {
    const handleOnline = () => {
      if (showOffline) {
        const hasCache = localStorage.getItem(CACHE_KEY) !== null
        if (!hasCache) {
          // 即使网络恢复，首次仍需拉数据
          window.location.reload()
        }
      }
    }
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [showOffline])

  const handleRetry = () => {
    checkConnection()
    if (navigator.onLine) {
      window.location.reload()
    }
  }

  if (checking) return null

  if (showOffline) {
    return (
      <div className="min-h-screen flex items-center justify-center game-page-bg px-4">
        <div className="text-center max-w-sm page-enter glass-card p-8">
          <div className="text-6xl mb-6">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-3">
            {STRINGS.offline.title}
          </h1>
          <p className="text-white/60 mb-8">
            {STRINGS.offline.description}
          </p>
          <button
            onClick={handleRetry}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[var(--theme-color)] to-[var(--theme-color-light)] text-white font-bold text-lg
                       hover:brightness-110 transition-all shadow-lg btn-ripple"
          >
            {STRINGS.offline.retryButton}
          </button>
        </div>
      </div>
    )
  }

  return children
}
