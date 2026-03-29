import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import type { TestRun } from '@test-studio/shared-types'

export function DashboardPage() {
  const [runs, setRuns] = useState<TestRun[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<TestRun[]>('/test-runs')
      .then(res => setRuns(res.data.slice(0, 5)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div data-testid="dashboard-page">
      <h1>Dashboard</h1>
      <p>Últimas execuções</p>
      {loading ? (
        <p data-testid="loading">Carregando...</p>
      ) : runs.length === 0 ? (
        <p data-testid="empty">Nenhuma execução ainda. <Link to="/run">Executar agora</Link></p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#ddd' }}>
              <th style={{ padding: 8, textAlign: 'left' }}>ID</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Status</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Data</th>
              <th style={{ padding: 8 }}></th>
            </tr>
          </thead>
          <tbody>
            {runs.map(run => (
              <tr key={run._id} data-testid={`run-row-${run._id}`}>
                <td style={{ padding: 8 }}>{run._id.slice(-8)}</td>
                <td style={{ padding: 8 }}>
                  <StatusBadge status={run.status} />
                </td>
                <td style={{ padding: 8 }}>{new Date(run.createdAt).toLocaleString('pt-BR')}</td>
                <td style={{ padding: 8 }}>
                  <Link to={`/history/${run._id}`}>Ver</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    passed: '#22c55e',
    failed: '#ef4444',
    running: '#3b82f6',
    pending: '#f59e0b',
    error: '#8b5cf6',
  }
  return (
    <span style={{
      background: colors[status] ?? '#999',
      color: '#fff',
      padding: '2px 8px',
      borderRadius: 4,
      fontSize: 12,
    }}>
      {status}
    </span>
  )
}
