import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import type { TestRun } from '@test-studio/shared-types'
import { PageHeader } from '../components/ui/PageHeader'
import { StatusBadge } from '../components/ui/StatusBadge'
import { formatDateTimeBR, formatDuration, shortId } from '../lib/format'

export function HistoryPage() {
  const [runs, setRuns] = useState<TestRun[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<TestRun[]>('/test-runs')
      .then(res => setRuns(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-state" data-testid="loading">Carregando...</div>

  return (
    <div data-testid="history-page" className="page-shell">
      <PageHeader
        eyebrow="Observabilidade"
        title="Histórico de execuções"
        description="Veja a linha do tempo dos runs, acompanhe duração, status e entre nos detalhes de cada falha."
        meta={
          <>
            <span className="meta-chip">{runs.length} registros</span>
            <span className="meta-chip accent">Logs por step</span>
          </>
        }
      />

      {runs.length === 0 ? (
        <div className="empty-state" data-testid="empty">Nenhuma execução ainda.</div>
      ) : (
        <section className="surface">
          <div className="table-shell">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Status</th>
                  <th>Duração</th>
                  <th>Data</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {runs.map(run => (
                  <tr key={run._id} data-testid={`run-row-${run._id}`}>
                    <td className="table-id">{shortId(run._id)}</td>
                    <td><StatusBadge status={run.status} /></td>
                    <td>{formatDuration(run.durationMs)}</td>
                    <td>{formatDateTimeBR(run.createdAt)}</td>
                    <td><Link to={`/history/${run._id}`} className="button-link button-secondary">Detalhes</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
