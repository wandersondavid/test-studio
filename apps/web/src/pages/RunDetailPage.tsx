import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../services/api'
import type { AuditEntry, TestRun, StepResult } from '@test-studio/shared-types'
import { PageHeader } from '../components/ui/PageHeader'
import { StatusBadge } from '../components/ui/StatusBadge'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { formatDuration, shortId } from '../lib/format'
import { isRetryableRun, retryTestRun } from '../services/testRuns'

export function RunDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [run, setRun] = useState<TestRun | null>(null)
  const [loading, setLoading] = useState(true)
  const [retrying, setRetrying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([])

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

  useEffect(() => {
    api.get<AuditEntry[]>('/audit-logs', {
      params: {
        entityType: 'run',
        entityId: id,
        limit: 10,
      },
    }).then(res => setAuditLogs(res.data)).catch(() => undefined)
  }, [id])

  if (loading) return <div className="loading-state" data-testid="loading">Carregando...</div>
  if (!run) return <div className="empty-state" data-testid="not-found">Execução não encontrada</div>

  const failedSteps = run.stepResults.filter(step => step.status !== 'passed').length
  const retryable = isRetryableRun(run)

  async function handleRetryRun() {
    if (!run) return

    setRetrying(true)
    setError(null)

    try {
      const nextRun = await retryTestRun({
        _id: run._id,
        caseId: run.caseId,
        environmentId: run.environmentId,
        datasetId: run.datasetId,
      })
      navigate(`/history/${nextRun._id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao reenfileirar execução')
      setRetrying(false)
    }
  }

  return (
    <div data-testid="run-detail-page" className="page-shell">
      <PageHeader
        eyebrow="Detalhe da execução"
        title={<>Execução <code>{shortId(run._id)}</code></>}
        description="Acompanhe o status final, a duração total e os resultados de cada step executado pelo runner."
        actions={
          <>
            <Button
              onClick={handleRetryRun}
              disabled={!retryable || retrying}
              data-testid="btn-retry-run"
            >
              {retrying ? 'Enfileirando...' : 'Reexecutar esse run'}
            </Button>
            <Button asChild variant="outline">
              <Link to="/history">Voltar ao histórico</Link>
            </Button>
          </>
        }
        meta={
          <>
            <StatusBadge status={run.status} />
            <Badge variant="outline">{run.stepResults.length} steps processados</Badge>
            {run.requestedVia && <Badge variant="outline">via {run.requestedVia}</Badge>}
          </>
        }
      />

      <section className="summary-grid">
        <article className="stat-card">
          <span className="stat-label">Status</span>
          <strong className="stat-value">{run.status}</strong>
          <span className="stat-note">Estado final do run</span>
        </article>
        <article className="stat-card">
          <span className="stat-label">Duração total</span>
          <strong className="stat-value">{formatDuration(run.durationMs)}</strong>
          <span className="stat-note">Tempo acumulado da execução</span>
        </article>
        <article className="stat-card">
          <span className="stat-label">Steps</span>
          <strong className="stat-value">{run.stepResults.length}</strong>
          <span className="stat-note">Etapas registradas no resultado</span>
        </article>
        <article className="stat-card">
          <span className="stat-label">Falhas</span>
          <strong className="stat-value">{failedSteps}</strong>
          <span className="stat-note">Steps com erro ou timeout</span>
        </article>
        <article className="stat-card">
          <span className="stat-label">Solicitado por</span>
          <strong className="stat-value">{run.requestedBy?.name ?? 'Sistema'}</strong>
          <span className="stat-note">{run.requestedBy?.email ?? 'Execução interna'}</span>
        </article>
      </section>

      {(run.error || error) && (
        <div className="alert alert-error" data-testid="run-error">
          {error ?? run.error}
        </div>
      )}

      <section className="surface">
        <div className="section-heading">
          <div>
            <h2>Steps</h2>
            <p>Use esta tabela para encontrar gargalos de seletor, timeout e estabilidade do cenário.</p>
          </div>
        </div>

        {run.stepResults.length === 0 ? (
          <div className="empty-state" data-testid="no-steps">
            {run.status === 'running' || run.status === 'pending'
              ? 'Aguardando execução...'
              : 'Nenhum step executado.'}
          </div>
        ) : (
          <div className="table-shell">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tipo</th>
                  <th>Status</th>
                  <th>Duração</th>
                  <th>Erro</th>
                </tr>
              </thead>
              <tbody>
                {run.stepResults.map((step: StepResult, i: number) => (
                  <tr key={step.stepId} data-testid={`step-result-${step.stepId}`}>
                    <td>{i + 1}</td>
                    <td>{step.type}</td>
                    <td><StatusBadge status={step.status} /></td>
                    <td>{formatDuration(step.durationMs)}</td>
                    <td className="table-error">{step.error ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="surface">
        <div className="section-heading">
          <div>
            <h2>Audit trail</h2>
            <p>Mostra quem solicitou ou reenfileirou esta execução.</p>
          </div>
        </div>

        {auditLogs.length === 0 ? (
          <div className="empty-state">Nenhum evento de auditoria encontrado para este run.</div>
        ) : (
          <div className="space-y-3">
            {auditLogs.map(entry => (
              <div key={entry._id} className="rounded-xl border border-border/70 bg-background/60 p-4">
                <div className="text-sm font-semibold">{entry.summary}</div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {entry.actor.name} • {entry.actor.email}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
