import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../services/api'
import type { TestRun, StepResult } from '@test-studio/shared-types'

export function RunDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [run, setRun] = useState<TestRun | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    function poll() {
      api.get<TestRun>(`/test-runs/${id}`).then(res => {
        setRun(res.data)
        setLoading(false)
        if (res.data.status === 'running' || res.data.status === 'pending') {
          setTimeout(poll, 2000)
        }
      })
    }
    poll()
  }, [id])

  if (loading) return <p data-testid="loading">Carregando...</p>
  if (!run) return <p data-testid="not-found">Execução não encontrada</p>

  return (
    <div data-testid="run-detail-page">
      <h1>Execução <code>{run._id.slice(-8)}</code></h1>
      <p>Status: <strong>{run.status}</strong></p>
      {run.durationMs && <p>Duração total: {(run.durationMs / 1000).toFixed(2)}s</p>}
      {run.error && <p style={{ color: 'red' }} data-testid="run-error">{run.error}</p>}

      <h2>Steps</h2>
      {run.stepResults.length === 0 ? (
        <p data-testid="no-steps">
          {run.status === 'running' || run.status === 'pending'
            ? 'Aguardando execução...'
            : 'Nenhum step executado.'}
        </p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8 }}>
          <thead>
            <tr style={{ background: '#f0f0f0' }}>
              <th style={{ padding: 12, textAlign: 'left' }}>#</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Tipo</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Status</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Duração</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Erro</th>
            </tr>
          </thead>
          <tbody>
            {run.stepResults.map((step: StepResult, i: number) => (
              <tr key={step.stepId} data-testid={`step-result-${step.stepId}`} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 12 }}>{i + 1}</td>
                <td style={{ padding: 12 }}>{step.type}</td>
                <td style={{ padding: 12, color: step.status === 'passed' ? 'green' : 'red' }}>
                  {step.status}
                </td>
                <td style={{ padding: 12 }}>{step.durationMs}ms</td>
                <td style={{ padding: 12, color: 'red', fontSize: 12 }}>{step.error ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
