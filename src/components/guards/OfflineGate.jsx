import { useState, useEffect } from 'react'
import Button from '../ui/Button.jsx'

const CACHE_KEY = 'app_data'

export default function OfflineGate({ children }) {
  const [checking, setChecking] = useState(true)
  const [showOffline, setShowOffline] = useState(false)

  useEffect(() => {
    checkConnection()
  }, [])

  function checkConnection() {
    const isOnline = navigator.onLine
    const hasCache = localStorage.getItem(CACHE_KEY) !== null

    if (!isOnline && !hasCache) {
      setShowOffline(true)
    } else {
      setShowOffline(false)
    }
    setChecking(false)
  }

  useEffect(() => {
    const handleOnline = () => {
      if (showOffline) {
        const hasCache = localStorage.getItem(CACHE_KEY) !== null
        if (!hasCache) {
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
      <div className="min-h-screen flex items-center justify-center bg-[var(--c-bg-secondary)] px-4">
        <div className="text-center max-w-sm page-enter card">
          <div className="card-content">
            <div className="text-5xl mb-4 font-bold text-[var(--c-warning)]">!</div>
            <h1 className="text-xl font-bold text-[var(--c-text)] mb-2">
              首次使用需要联网
            </h1>
            <p className="text-[var(--c-text-secondary)] text-sm mb-6">
              检查网络连接后
            </p>
            <Button variant="primary" onClick={handleRetry}>
              重试连接
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return children
}
