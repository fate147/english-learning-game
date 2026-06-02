import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { useChild } from '../../hooks/useChild.js'
export default function ProtectedRoute({ children, requireParent = false }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[var(--theme-color)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}
