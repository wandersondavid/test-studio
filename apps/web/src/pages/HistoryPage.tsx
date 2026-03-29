import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import type { TestRun } from '@test-studio/shared-types'

export function HistoryPage() {
  const [runs, setRuns] = useState<TestRun[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<TestRun[]>('/test-runs')
      .then(res => setRuns(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p data-testid="loading">Carregando...</p>

  return (
    <div data-testid="history-page">
      <h1>Histórico de execuções</h1>
      {runs.length === 0 ? (
        <p data-testid="empty">Nenhuma execução ainda.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8 }}>
          <thead>
            <tr style={{ background: '#f0f0f0' }}>
              <th style={{ padding: 12, textAlign: 'left' }}>ID</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Status</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Duração</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Data</th>
              <th style={{ padding: 12 }}></th>
            </tr>
          </thead>
          <tbody>
            {runs.map(run => (
              <tr key={run._id} data-testid={`run-row-${run._id}`}>
                <td style={{ padding: 12, fontFamily: 'monospace' }}>{run._id.slice(-8)}</td>
                <td style={{ padding: 12 }}>{run.status}</td>
                <td style={{ padding: 12 }}>{run.durationMs ? `${(run.durationMs / 1000).toFixed(1)}s` : '-'}</td>
                <td style={{ padding: 12 }}>{new Date(run.createdAt).toLocaleString('pt-BR')}</td>
                <td style={{ padding: 12 }}><Link to={`/history/${run._id}`}>Detalhes</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
