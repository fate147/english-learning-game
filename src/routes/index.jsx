import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/guards/ProtectedRoute.jsx'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'

const Login = lazy(() => import('./Login.jsx'))
const SelectChild = lazy(() => import('./SelectChild.jsx'))
const Game = lazy(() => import('./Game.jsx'))
const WordMemory = lazy(() => import('./WordMemory.jsx'))
const Home = lazy(() => import('./Home.jsx'))
const DialoguePractice = lazy(() => import('./DialoguePractice.jsx'))
const ParentDashboard = lazy(() => import('./ParentDashboard.jsx'))

export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/select-child" element={<ProtectedRoute><SelectChild /></ProtectedRoute>} />
        <Route path="/game" element={<ProtectedRoute><Game /></ProtectedRoute>} />
        <Route path="/memory" element={<ProtectedRoute><WordMemory /></ProtectedRoute>} />
        <Route path="/dialogue" element={<ProtectedRoute><DialoguePractice /></ProtectedRoute>} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/parent/*" element={<ProtectedRoute><ParentDashboard /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/select-child" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  )
}
