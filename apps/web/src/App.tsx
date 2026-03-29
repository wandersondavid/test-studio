import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth/AuthProvider'
import { AppShell } from './components/layout/AppShell'
import { DashboardPage } from './pages/DashboardPage'
import { EnvironmentsPage } from './pages/EnvironmentsPage'
import { SuitesPage } from './pages/SuitesPage'
import { SuiteDetailPage } from './pages/SuiteDetailPage'
import { CaseBuilderPage } from './pages/CaseBuilderPage'
import { RunPage } from './pages/RunPage'
import { HistoryPage } from './pages/HistoryPage'
import { RunDetailPage } from './pages/RunDetailPage'
import { LoginPage } from './pages/LoginPage'
import { UsersPage } from './pages/UsersPage'

export default function App() {
  const { loading, user } = useAuth()

  if (loading) {
    return <div className="loading-state">Validando sessão...</div>
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route
        path="*"
        element={
          user ? (
            <AppShell>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/environments" element={<EnvironmentsPage />} />
                <Route path="/suites" element={<SuitesPage />} />
                <Route path="/suites/:id" element={<SuiteDetailPage />} />
                <Route path="/cases/:id" element={<CaseBuilderPage />} />
                <Route path="/run" element={<RunPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/history/:id" element={<RunDetailPage />} />
                <Route path="/users" element={<UsersPage />} />
              </Routes>
            </AppShell>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  )
}
