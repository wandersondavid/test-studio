import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import type { Environment, TestCase, TestRun } from '@test-studio/shared-types'
import { PageHeader } from '../components/ui/PageHeader'
import { StatusBadge } from '../components/ui/StatusBadge'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { formatDateTimeBR, formatDuration, shortId } from '../lib/format'
import {
  type HistoryRunFilter,
  isRetryableRun,
  matchesHistoryRunFilter,
  retryManyRuns,
} from '../services/testRuns'

const FILTERS: Array<{ value: HistoryRunFilter; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'passed', label: 'Sucesso' },
  { value: 'failed', label: 'Falhas' },
  { value: 'active', label: 'Ativos' },
]

export function HistoryPage() {
  const [runs, setRuns] = useState<TestRun[]>([])
  const [cases, setCases] = useState<TestCase[]>([])
  const [environments, setEnvironments] = useState<Environment[]>([])
  const [selectedRunIds, setSelectedRunIds] = useState<string[]>([])
  const [filter, setFilter] = useState<HistoryRunFilter>('all')
  const [loading, setLoading] = useState(true)
  const [retrying, setRetrying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  async function loadHistory() {
    const [runsResponse, casesResponse, environmentsResponse] = await Promise.all([
      api.get<TestRun[]>('/test-runs'),
      api.get<TestCase[]>('/test-cases'),
      api.get<Environment[]>('/environments'),
    ])

    setRuns(runsResponse.data)
    setCases(casesResponse.data)
    setEnvironments(environmentsResponse.data)
  }

  useEffect(() => {
    loadHistory()
      .catch(err => setError(err instanceof Error ? err.message : 'Erro ao carregar histórico'))
      .finally(() => setLoading(false))
  }, [])

  const caseNameById = useMemo(
    () => new Map(cases.map(testCase => [testCase._id, testCase.name])),
    [cases]
  )
  const environmentLabelById = useMemo(
    () => new Map(environments.map(environment => [environment._id, `${environment.name} (${environment.type})`])),
    [environments]
  )

  const counts = useMemo(() => ({
    all: runs.length,
    passed: runs.filter(run => run.status === 'passed').length,
    failed: runs.filter(run => run.status === 'failed' || run.status === 'error').length,
    active: runs.filter(run => run.status === 'running' || run.status === 'pending').length,
  }), [runs])

  const visibleRuns = useMemo(
    () => runs.filter(run => matchesHistoryRunFilter(run.status, filter)),
    [filter, runs]
  )
  const retryableVisibleRuns = useMemo(
    () => visibleRuns.filter(isRetryableRun),
    [visibleRuns]
  )
  const selectedRetryableRuns = useMemo(
    () => runs.filter(run => selectedRunIds.includes(run._id) && isRetryableRun(run)),
    [runs, selectedRunIds]
  )

  const allVisibleSelected =
    retryableVisibleRuns.length > 0 &&
    retryableVisibleRuns.every(run => selectedRunIds.includes(run._id))

  function toggleRunSelection(runId: string) {
    setSelectedRunIds(current =>
      current.includes(runId)
        ? current.filter(id => id !== runId)
        : [...current, runId]
    )
  }

  function toggleVisibleSelection() {
    const visibleIds = retryableVisibleRuns.map(run => run._id)

    setSelectedRunIds(current =>
      allVisibleSelected
        ? current.filter(id => !visibleIds.includes(id))
        : Array.from(new Set([...current, ...visibleIds]))
    )
  }

  async function handleRetry(targetRuns: TestRun[], label: string) {
    if (targetRuns.length === 0) {
      setError(`Nenhum run elegível para "${label.toLowerCase()}".`)
      return
    }

    setRetrying(true)
    setError(null)
    setFeedback(null)

    try {
      const { created, failed } = await retryManyRuns(targetRuns)

      await loadHistory()
      setSelectedRunIds([])

      if (created.length > 0 && failed.length === 0) {
        setFeedback(`${created.length} reteste(s) enviados para fila com sucesso.`)
        return
      }

      if (created.length > 0 && failed.length > 0) {
        setFeedback(`${created.length} reteste(s) enviados para fila. ${failed.length} falharam ao reenfileirar.`)
        return
      }

      setError('Não foi possível reenfileirar os runs selecionados.')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao reenfileirar runs')
    } finally {
      setRetrying(false)
    }
  }

  if (loading) return <div className="loading-state" data-testid="loading">Carregando...</div>

  return (
    <div data-testid="history-page" className="page-shell">
      <PageHeader
        eyebrow="Observabilidade"
        title="Histórico de execuções"
        description="Use essa área como central de reteste: filtre por status, selecione runs finalizados e reenfileire cenários em lote."
        actions={
          <Button asChild variant="outline">
            <Link to="/run">Novo run manual</Link>
          </Button>
        }
        meta={
          <>
            <Badge variant="outline">{runs.length} registros</Badge>
            <Badge variant="outline">{selectedRetryableRuns.length} selecionados</Badge>
            <Badge variant="secondary">Reteste em lote</Badge>
          </>
        }
      />

      {error && <div className="alert alert-error" data-testid="history-error">{error}</div>}
      {feedback && <div className="alert alert-info" data-testid="history-feedback">{feedback}</div>}

      {runs.length === 0 ? (
        <div className="empty-state" data-testid="empty">Nenhuma execução ainda.</div>
      ) : (
        <>
          <Card className="mb-5 bg-card/70">
            <CardHeader className="pb-3">
              <CardTitle className="font-['Space_Grotesk'] text-2xl">Fila de reteste</CardTitle>
              <CardDescription>
                Filtre os runs visíveis e reteste todos, só os sucessos, só as falhas ou uma seleção específica.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {FILTERS.map(item => (
                  <Button
                    key={item.value}
                    variant={filter === item.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter(item.value)}
                    data-testid={`history-filter-${item.value}`}
                  >
                    {item.label}
                    <Badge variant={filter === item.value ? 'secondary' : 'outline'} className="ml-1">
                      {counts[item.value]}
                    </Badge>
                  </Button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleVisibleSelection}
                  disabled={retryableVisibleRuns.length === 0 || retrying}
                  data-testid="btn-toggle-visible-selection"
                >
                  {allVisibleSelected ? 'Desmarcar visíveis' : 'Selecionar visíveis'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedRunIds([])}
                  disabled={selectedRunIds.length === 0 || retrying}
                  data-testid="btn-clear-selection"
                >
                  Limpar seleção
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleRetry(selectedRetryableRuns, 'Retestar selecionados')}
                  disabled={selectedRetryableRuns.length === 0 || retrying}
                  data-testid="btn-retry-selected"
                >
                  {retrying ? 'Enfileirando...' : 'Retestar selecionados'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRetry(runs.filter(run => run.status === 'passed'), 'Retestar sucessos')}
                  disabled={retrying || counts.passed === 0}
                  data-testid="btn-retry-passed"
                >
                  Retestar sucessos
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRetry(runs.filter(run => run.status === 'failed' || run.status === 'error'), 'Retestar falhas')}
                  disabled={retrying || counts.failed === 0}
                  data-testid="btn-retry-failed"
                >
                  Retestar falhas
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRetry(retryableVisibleRuns, 'Retestar visíveis')}
                  disabled={retrying || retryableVisibleRuns.length === 0}
                  data-testid="btn-retry-visible"
                >
                  Retestar visíveis
                </Button>
              </div>

              <div className="text-sm text-muted-foreground">
                Runs em andamento ficam fora da seleção até terminarem. Para retestar só as falhas, clique em
                <strong> Retestar falhas</strong>; para repetir tudo que já passou no filtro atual, use
                <strong> Retestar visíveis</strong>.
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/70">
            <CardHeader className="pb-3">
              <CardTitle className="font-['Space_Grotesk'] text-2xl">Linha do tempo dos runs</CardTitle>
              <CardDescription>
                Selecione o que quer reenfileirar ou abra o detalhe para inspecionar o resultado step a step.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="table-shell">
                <table className="table">
                  <thead>
                    <tr>
                      <th></th>
                      <th>ID</th>
                      <th>Cenário</th>
                      <th>Ambiente</th>
                      <th>Status</th>
                      <th>Duração</th>
                      <th>Data</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRuns.map(run => {
                      const retryable = isRetryableRun(run)

                      return (
                        <tr key={run._id} data-testid={`run-row-${run._id}`}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedRunIds.includes(run._id)}
                              onChange={() => toggleRunSelection(run._id)}
                              disabled={!retryable || retrying}
                              aria-label={`Selecionar execução ${shortId(run._id)}`}
                              className="h-4 w-4 rounded border border-border bg-background/80 accent-white disabled:cursor-not-allowed disabled:opacity-40"
                            />
                          </td>
                          <td className="table-id">{shortId(run._id)}</td>
                          <td>{caseNameById.get(run.caseId) ?? 'Cenário removido'}</td>
                          <td>{environmentLabelById.get(run.environmentId) ?? 'Ambiente removido'}</td>
                          <td><StatusBadge status={run.status} /></td>
                          <td>{formatDuration(run.durationMs)}</td>
                          <td>{formatDateTimeBR(run.createdAt)}</td>
                          <td>
                            <div className="flex flex-wrap justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRetry([run], 'Retestar execução')}
                                disabled={!retryable || retrying}
                                data-testid={`btn-retry-${run._id}`}
                              >
                                Reexecutar
                              </Button>
                              <Button asChild variant="ghost" size="sm">
                                <Link to={`/history/${run._id}`}>Detalhes</Link>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
