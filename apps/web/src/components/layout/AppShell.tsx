import type { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

interface AppShellProps {
  children: ReactNode
}

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', description: 'Visão operacional' },
  { to: '/environments', label: 'Ambientes', description: 'URLs, headers e variáveis' },
  { to: '/suites', label: 'Suítes', description: 'Organização dos cenários' },
  { to: '/run', label: 'Executar', description: 'Disparar testes E2E' },
  { to: '/history', label: 'Histórico', description: 'Runs, logs e falhas' },
]

const PAGE_LABELS = new Map<string, string>([
  ['/', 'Dashboard'],
  ['/environments', 'Ambientes'],
  ['/suites', 'Suítes'],
  ['/run', 'Execução'],
  ['/history', 'Histórico'],
])

function resolveCurrentLabel(pathname: string): string {
  if (pathname.startsWith('/cases/')) return 'Builder'
  if (pathname.startsWith('/suites/')) return 'Detalhe da suíte'
  if (pathname.startsWith('/history/')) return 'Detalhe da execução'
  return PAGE_LABELS.get(pathname) ?? 'Workspace'
}

export function AppShell({ children }: AppShellProps) {
  const location = useLocation()
  const currentLabel = resolveCurrentLabel(location.pathname)

  return (
    <div className="app-shell">
      <aside className="app-sidebar" data-testid="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">TS</div>
          <div>
            <div className="sidebar-kicker">Workspace</div>
            <div className="sidebar-title">Test Studio</div>
          </div>
        </div>

        <div className="sidebar-workspace">
          <span className="meta-chip">Recorder</span>
          <span className="meta-chip">Playwright</span>
          <span className="meta-chip">Mongo</span>
        </div>

        <div className="sidebar-section-label">Navegação</div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <div className="sidebar-link-label">{item.label}</div>
              <div className="sidebar-link-description">{item.description}</div>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-section-label">Estado da stack</div>
          <div className="stack-summary">
            <div className="stack-summary-row">
              <span>Frontend</span>
              <strong>Builder visual</strong>
            </div>
            <div className="stack-summary-row">
              <span>Runner</span>
              <strong>Sessão real</strong>
            </div>
            <div className="stack-summary-row">
              <span>Artefatos</span>
              <strong>Screenshot + vídeo</strong>
            </div>
          </div>
        </div>
      </aside>

      <div className="app-stage">
        <header className="app-topbar">
          <div className="topbar-context">
            <div className="topbar-kicker">Painel interno</div>
            <strong>{currentLabel}</strong>
          </div>

          <label className="topbar-search" aria-label="Pesquisar workspace">
            <span className="topbar-search-icon">/</span>
            <input
              type="text"
              placeholder="Pesquisar cenários, execuções e ambientes"
              readOnly
              value=""
            />
          </label>

          <div className="topbar-actions">
            <span className="meta-chip accent">MVP ativo</span>
            <span className="meta-chip">Local-first</span>
          </div>
        </header>

        <main className="app-content">{children}</main>
      </div>
    </div>
  )
}
