import { Routes, Route } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { DashboardPage } from './pages/DashboardPage'
import { EnvironmentsPage } from './pages/EnvironmentsPage'
import { SuitesPage } from './pages/SuitesPage'
import { SuiteDetailPage } from './pages/SuiteDetailPage'
import { CaseBuilderPage } from './pages/CaseBuilderPage'
import { RunPage } from './pages/RunPage'
import { HistoryPage } from './pages/HistoryPage'
import { RunDetailPage } from './pages/RunDetailPage'

export default function App() {
  return (
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
      </Routes>
    </AppShell>
  )
}
