import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import type { TestRun } from '@test-studio/shared-types'
import { PageHeader } from '../components/ui/PageHeader'
import { StatusBadge } from '../components/ui/StatusBadge'
import { formatDateTimeBR, shortId } from '../lib/format'

export function DashboardPage() {
  const [runs, setRuns] = useState<TestRun[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<TestRun[]>('/test-runs')
      .then(res => setRuns(res.data.slice(0, 5)))
      .finally(() => setLoading(false))
  }, [])

  const passedRuns = runs.filter(run => run.status === 'passed').length
  const failedRuns = runs.filter(run => run.status === 'failed' || run.status === 'error').length
  const activeRuns = runs.filter(run => run.status === 'running' || run.status === 'pending').length

  return (
    <div data-testid="dashboard-page" className="page-shell">
      <PageHeader
        eyebrow="Painel operacional"
        title="Visão geral do Test Studio"
        description="Acompanhe recorder, execução e histórico de runs em uma interface mais clara para o time inteiro."
        actions={
          <>
            <Link to="/run" className="button-link button-primary">Executar cenário</Link>
            <Link to="/suites" className="button-link button-secondary">Abrir suítes</Link>
          </>
        }
        meta={
          <>
            <span className="meta-chip accent">Recorder Playwright</span>
            <span className="meta-chip">Builder visual</span>
          </>
        }
      />

      <section className="stats-grid">
        <article className="stat-card">
          <span className="stat-label">Execuções recentes</span>
          <strong className="stat-value">{runs.length}</strong>
          <span className="stat-note">Últimos runs visíveis no dashboard</span>
        </article>
        <article className="stat-card">
          <span className="stat-label">Sucesso</span>
          <strong className="stat-value">{passedRuns}</strong>
          <span className="stat-note">Runs finalizados com status passed</span>
        </article>
        <article className="stat-card">
          <span className="stat-label">Falhas</span>
          <strong className="stat-value">{failedRuns}</strong>
          <span className="stat-note">Runs com falha ou erro</span>
        </article>
        <article className="stat-card">
          <span className="stat-label">Ativos</span>
          <strong className="stat-value">{activeRuns}</strong>
          <span className="stat-note">Execuções pendentes ou em andamento</span>
        </article>
      </section>

      <section className="surface">
        <div className="section-heading">
          <div>
            <h2>Últimas execuções</h2>
            <p>Use essa área para acompanhar rapidamente o que acabou de rodar.</p>
          </div>
        </div>

        {loading ? (
          <div className="loading-state" data-testid="loading">Carregando...</div>
        ) : runs.length === 0 ? (
          <div className="empty-state" data-testid="empty">
            <span>Nenhuma execução ainda.</span>
            <Link to="/run" className="button-link button-primary">Executar agora</Link>
          </div>
        ) : (
          <div className="table-shell">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {runs.map(run => (
                  <tr key={run._id} data-testid={`run-row-${run._id}`}>
                    <td className="table-id">{shortId(run._id)}</td>
                    <td>
                      <StatusBadge status={run.status} />
                    </td>
                    <td>{formatDateTimeBR(run.createdAt)}</td>
                    <td>
                      <Link to={`/history/${run._id}`} className="button-link button-secondary">Ver detalhes</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
