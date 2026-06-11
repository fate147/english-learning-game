import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './Login.jsx'
import SelectChild from './SelectChild.jsx'
import Game from './Game.jsx'
import WordMemory from './WordMemory.jsx'
import DialoguePractice from './DialoguePractice.jsx'
import ParentDashboard from './ParentDashboard.jsx'
import ProtectedRoute from '../components/guards/ProtectedRoute.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/select-child" element={<ProtectedRoute><SelectChild /></ProtectedRoute>} />
      <Route path="/game" element={<ProtectedRoute><Game /></ProtectedRoute>} />
      <Route path="/memory" element={<ProtectedRoute><WordMemory /></ProtectedRoute>} />
      <Route path="/dialogue" element={<ProtectedRoute><DialoguePractice /></ProtectedRoute>} />
      <Route path="/parent/*" element={<ProtectedRoute><ParentDashboard /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/select-child" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
