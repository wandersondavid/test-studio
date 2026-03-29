import { Routes, Route, Link } from 'react-router-dom'
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
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <nav data-testid="sidebar" style={{ width: 220, background: '#1a1a2e', color: '#fff', padding: 24 }}>
        <h2 style={{ margin: '0 0 24px', fontSize: 18 }}>Test Studio</h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <li><Link to="/" style={{ color: '#ccc', textDecoration: 'none' }}>Dashboard</Link></li>
          <li><Link to="/environments" style={{ color: '#ccc', textDecoration: 'none' }}>Ambientes</Link></li>
          <li><Link to="/suites" style={{ color: '#ccc', textDecoration: 'none' }}>Suítes</Link></li>
          <li><Link to="/run" style={{ color: '#ccc', textDecoration: 'none' }}>Executar</Link></li>
          <li><Link to="/history" style={{ color: '#ccc', textDecoration: 'none' }}>Histórico</Link></li>
        </ul>
      </nav>
      <main style={{ flex: 1, padding: 32, background: '#f5f5f5' }}>
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
      </main>
    </div>
  )
}
