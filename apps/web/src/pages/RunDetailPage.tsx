import { useEffect, useMemo, useState } from 'react'
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
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null)
  const [followLatestStep, setFollowLatestStep] = useState(true)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)

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

  const previewableSteps = useMemo(
    () => run?.stepResults.filter(step => Boolean(step.screenshotPath)) ?? [],
    [run]
  )

  const selectedStep = useMemo(() => {
    if (!run) return null
    return run.stepResults.find(step => step.stepId === selectedStepId) ?? null
  }, [run, selectedStepId])

  useEffect(() => {
    if (!run) {
      setSelectedStepId(null)
      return
    }

    const latestPreviewableStep = [...run.stepResults].reverse().find(step => step.screenshotPath)
    const fallbackStep = latestPreviewableStep ?? run.stepResults[run.stepResults.length - 1] ?? null

    if (!fallbackStep) {
      setSelectedStepId(null)
      return
    }

    const selectedStillExists = selectedStepId
      ? run.stepResults.some(step => step.stepId === selectedStepId)
      : false

    if (followLatestStep || !selectedStillExists) {
      setSelectedStepId(fallbackStep.stepId)
    }
  }, [followLatestStep, run, selectedStepId])

  useEffect(() => {
    if (!run || !selectedStep?.screenshotPath) {
      setPreviewUrl(current => {
        if (current) URL.revokeObjectURL(current)
        return null
      })
      setPreviewError(selectedStep ? 'Este step ainda não gerou screenshot.' : null)
      setPreviewLoading(false)
      return
    }

    const controller = new AbortController()
    let active = true

    setPreviewLoading(true)
    setPreviewError(null)

    api.get(
      `/test-runs/${run._id}/steps/${selectedStep.stepId}/screenshot`,
      {
        responseType: 'blob',
        signal: controller.signal,
      }
    ).then(response => {
      if (!active) return

      const nextUrl = URL.createObjectURL(response.data)
      setPreviewUrl(current => {
        if (current) URL.revokeObjectURL(current)
        return nextUrl
      })
      setPreviewLoading(false)
    }).catch(err => {
      if (!active) return
      setPreviewUrl(current => {
        if (current) URL.revokeObjectURL(current)
        return null
      })
      setPreviewLoading(false)
      setPreviewError(err instanceof Error ? err.message : 'Não foi possível carregar o preview deste step.')
    })

    return () => {
      active = false
      controller.abort()
    }
  }, [run, selectedStep?.screenshotPath, selectedStep?.stepId])

  if (loading) return <div className="loading-state" data-testid="loading">Carregando...</div>
  if (!run) return <div className="empty-state" data-testid="not-found">Execução não encontrada</div>

  const failedSteps = run.stepResults.filter(step => step.status !== 'passed').length
  const retryable = isRetryableRun(run)
  const consoleLogs = run.consoleLogs ?? []
  const networkLogs = run.networkLogs ?? []
  const stepIndexById = new Map(run.stepResults.map((step, index) => [step.stepId, index + 1]))
  const recentConsoleLogs = [...consoleLogs].slice(-20).reverse()
  const recentNetworkLogs = [...networkLogs].slice(-20).reverse()

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
            <h2>Preview da execução</h2>
            <p>Clique em um step para ver o frame salvo pelo runner. Enquanto o run estiver ativo, o preview acompanha a última etapa capturada.</p>
          </div>
          <div className="page-meta">
            <Badge variant="outline">{previewableSteps.length} frames disponíveis</Badge>
            <Button
              type="button"
              variant="outline"
              onClick={() => setFollowLatestStep(current => !current)}
              disabled={run.stepResults.length === 0}
            >
              {followLatestStep ? 'Seguindo execução' : 'Travado no step'}
            </Button>
          </div>
        </div>

        <div className="run-preview-shell">
          <div className="run-preview-stage">
            {previewUrl ? (
              <img
                key={previewUrl}
                src={previewUrl}
                alt={selectedStep ? `Preview do step ${selectedStep.type}` : 'Preview da execução'}
                className="run-preview-image"
              />
            ) : (
              <div className="empty-state run-preview-empty">
                <strong>
                  {previewLoading
                    ? 'Carregando preview do step...'
                    : 'Nenhum preview disponível ainda.'}
                </strong>
                <span>
                  {previewError
                    ?? (run.status === 'running' || run.status === 'pending'
                      ? 'O runner vai anexar os frames conforme os steps forem concluídos.'
                      : 'Este run não gerou screenshots para os steps atuais.')}
                </span>
              </div>
            )}
          </div>

          <aside className="run-preview-sidebar">
            <div className="run-preview-meta">
              <span className="stat-label">Step selecionado</span>
              <strong className="stat-value">
                {selectedStep
                  ? `${run.stepResults.findIndex(step => step.stepId === selectedStep.stepId) + 1}. ${selectedStep.type}`
                  : 'Nenhum'}
              </strong>
              <span className="stat-note">
                {selectedStep?.error ?? 'Selecione um step para revisar o estado visual salvo pelo runner.'}
              </span>
            </div>
            <div className="run-preview-meta">
              <span className="stat-label">Status</span>
              {selectedStep ? <StatusBadge status={selectedStep.status} /> : <span className="stat-note">Sem step selecionado</span>}
            </div>
            <div className="run-preview-meta">
              <span className="stat-label">Duração</span>
              <strong className="stat-value">{formatDuration(selectedStep?.durationMs)}</strong>
            </div>
            {previewUrl && (
              <Button asChild variant="outline">
                <a href={previewUrl} target="_blank" rel="noreferrer">Abrir imagem</a>
              </Button>
            )}
          </aside>
        </div>
      </section>

      <section className="surface">
        <div className="section-heading">
          <div>
            <h2>Console e rede</h2>
            <p>Eventos capturados pelo runner durante a execução. A lista mostra os itens mais recentes primeiro.</p>
          </div>
          <div className="page-meta">
            <Badge variant="outline">{consoleLogs.length} console</Badge>
            <Badge variant="outline">{networkLogs.length} network</Badge>
          </div>
        </div>

        <div className="run-logs-grid">
          <article className="run-logs-panel">
            <div className="run-logs-panel-header">
              <h3>Console</h3>
              <span>{recentConsoleLogs.length} recentes</span>
            </div>

            {recentConsoleLogs.length === 0 ? (
              <div className="empty-state">Nenhum log de console capturado.</div>
            ) : (
              <div className="run-log-list">
                {recentConsoleLogs.map(log => (
                  <div key={log.id} className="run-log-item">
                    <div className="run-log-row">
                      <Badge variant={log.type === 'error' ? 'danger' : log.type === 'warn' ? 'warning' : 'outline'}>
                        {log.type}
                      </Badge>
                      <span className="run-log-time">{new Date(log.timestamp).toLocaleTimeString('pt-BR')}</span>
                    </div>
                    <div className="run-log-text">{log.text}</div>
                    <div className="run-log-meta">
                      <span>{log.stepId ? `Step ${stepIndexById.get(log.stepId) ?? '-'}` : 'Sem step'}</span>
                      {log.location && <span>{log.location}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>

          <article className="run-logs-panel">
            <div className="run-logs-panel-header">
              <h3>Rede</h3>
              <span>{recentNetworkLogs.length} recentes</span>
            </div>

            {recentNetworkLogs.length === 0 ? (
              <div className="empty-state">Nenhum evento de rede capturado.</div>
            ) : (
              <div className="run-log-list">
                {recentNetworkLogs.map(log => (
                  <div key={log.id + log.kind + log.timestamp} className="run-log-item">
                    <div className="run-log-row">
                      <Badge variant={log.kind === 'failed' ? 'danger' : log.kind === 'response' && log.status && log.status >= 400 ? 'warning' : 'outline'}>
                        {log.kind}
                      </Badge>
                      <span className="run-log-time">{new Date(log.timestamp).toLocaleTimeString('pt-BR')}</span>
                    </div>
                    <div className="run-log-text">{log.method} {log.url}</div>
                    <div className="run-log-meta">
                      <span>{log.stepId ? `Step ${stepIndexById.get(log.stepId) ?? '-'}` : 'Sem step'}</span>
                      {log.status ? <span>Status {log.status}</span> : null}
                      {log.resourceType ? <span>{log.resourceType}</span> : null}
                    </div>
                    {log.error && <div className="run-log-error">{log.error}</div>}
                  </div>
                ))}
              </div>
            )}
          </article>
        </div>
      </section>

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
                  <tr
                    key={step.stepId}
                    data-testid={`step-result-${step.stepId}`}
                    className={selectedStepId === step.stepId ? 'table-row-selected' : undefined}
                    onClick={() => {
                      setSelectedStepId(step.stepId)
                      setFollowLatestStep(false)
                    }}
                  >
                    <td>{i + 1}</td>
                    <td>{step.type}</td>
                    <td><StatusBadge status={step.status} /></td>
                    <td>{formatDuration(step.durationMs)}</td>
                    <td className="table-error">
                      {step.error ?? (step.screenshotPath ? 'Preview disponível' : '-')}
                    </td>
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
