import { HashRouter } from 'react-router-dom'
const routerFuture = { v7_startTransition: true, v7_relativeSplatPath: true }
import ErrorBoundary from './components/guards/ErrorBoundary.jsx'
import OfflineGate from './components/guards/OfflineGate.jsx'
import DataPrefetch from './components/guards/DataPrefetch.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ChildProvider } from './context/ChildContext.jsx'
import { StarProvider } from './context/StarContext.jsx'
import { GameProvider } from './context/GameContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import AppRoutes from './routes/index.jsx'

export default function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <OfflineGate>
          <HashRouter future={routerFuture}>
            <AuthProvider>
              <ChildProvider>
                <StarProvider>
                  <GameProvider>
                    <DataPrefetch>
                      <a href="#main-content" className="skip-link">跳转到主内容</a>
                      <AppRoutes />
                    </DataPrefetch>
                  </GameProvider>
                </StarProvider>
              </ChildProvider>
            </AuthProvider>
          </HashRouter>
        </OfflineGate>
      </ErrorBoundary>
    </ThemeProvider>
  )
}
