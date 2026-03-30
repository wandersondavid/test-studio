import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { PageHeader } from '../components/ui/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

interface OverviewData {
  totalRuns: number
  passedRuns: number
  failedRuns: number
  passRate: number
  avgDurationMs: number
  runsLast7Days: Array<{ date: string; passed: number; failed: number; total: number }>
}

interface FlakinessEntry {
  caseId: string
  caseName: string
  totalRuns: number
  passedRuns: number
  failedRuns: number
  flakinessScore: number
}

interface SlowestStep {
  stepId: string
  type: string
  description?: string
  selector?: string
  avgDurationMs: number
  occurrences: number
}

export function AnalyticsPage() {
  const [overview, setOverview] = useState<OverviewData | null>(null)
  const [flakiness, setFlakiness] = useState<FlakinessEntry[]>([])
  const [slowestSteps, setSlowestSteps] = useState<SlowestStep[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get<OverviewData>('/analytics/overview'),
      api.get<FlakinessEntry[]>('/analytics/flakiness'),
      api.get<SlowestStep[]>('/analytics/slowest-steps'),
    ])
      .then(([ovRes, flRes, stRes]) => {
        setOverview(ovRes.data)
        setFlakiness(flRes.data)
        setSlowestSteps(stRes.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const maxTotal = overview
    ? Math.max(...overview.runsLast7Days.map(d => d.total), 1)
    : 1

  return (
    <div data-testid="analytics-page" className="page-shell">
      <PageHeader
        eyebrow="Métricas do sistema"
        title="Analytics"
        description="Taxa de sucesso, flakiness e performance dos testes ao longo do tempo."
      />

      {loading ? (
        <div className="loading-state" data-testid="analytics-loading">Carregando...</div>
      ) : (
        <div className="space-y-6">
          {/* Stats cards */}
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Total de Runs', value: overview?.totalRuns ?? 0, note: 'Total de execuções registradas' },
              { label: 'Taxa de Sucesso', value: `${overview?.passRate ?? 0}%`, note: 'Percentual de runs com passed' },
              { label: 'Duração Média', value: `${((overview?.avgDurationMs ?? 0) / 1000).toFixed(1)}s`, note: 'Tempo médio por execução' },
              { label: 'Runs com Falha', value: overview?.failedRuns ?? 0, note: 'Runs com status failed ou error' },
            ].map(item => (
              <Card key={item.label} className="bg-card/70">
                <CardHeader className="pb-3">
                  <div className="text-[0.72rem] uppercase tracking-[0.16em] text-muted-foreground">{item.label}</div>
                  <CardTitle className="font-['Inter'] text-4xl font-semibold">{item.value}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.note}</p>
                </CardContent>
              </Card>
            ))}
          </section>

          {/* Bar chart: Runs Last 7 Days */}
          <Card className="bg-card/70">
            <CardHeader>
              <CardTitle className="font-['Inter'] text-xl">Runs nos últimos 7 dias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-40" data-testid="runs-chart">
                {(overview?.runsLast7Days ?? []).map(d => (
                  <div key={d.date} className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-full flex flex-col justify-end gap-0.5" style={{ height: '100%' }}>
                      <div
                        className="bg-red-400 w-full rounded-t-sm"
                        style={{ height: `${(d.failed / maxTotal) * 100}%` }}
                        title={`Failed: ${d.failed}`}
                      />
                      <div
                        className={`bg-green-400 w-full ${d.failed === 0 ? 'rounded-t-sm' : ''}`}
                        style={{ height: `${(d.passed / maxTotal) * 100}%` }}
                        title={`Passed: ${d.passed}`}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{d.date.slice(5)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm bg-green-400" /> Passed
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-400" /> Failed
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Flakiness table */}
          <Card className="bg-card/70">
            <CardHeader>
              <CardTitle className="font-['Inter'] text-xl">Top Testes Instáveis (Flakiness)</CardTitle>
            </CardHeader>
            <CardContent>
              {flakiness.length === 0 ? (
                <div className="empty-state" data-testid="flakiness-empty">Nenhum dado disponível.</div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border/70">
                  <table className="table" data-testid="flakiness-table">
                    <thead>
                      <tr>
                        <th>Cenário</th>
                        <th className="text-right">Total</th>
                        <th className="text-right">Passed</th>
                        <th className="text-right">Failed</th>
                        <th className="text-right">Flakiness %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {flakiness.map(entry => (
                        <tr key={entry.caseId}>
                          <td className="font-medium">{entry.caseName}</td>
                          <td className="text-right">{entry.totalRuns}</td>
                          <td className="text-right text-green-600">{entry.passedRuns}</td>
                          <td className="text-right text-red-500">{entry.failedRuns}</td>
                          <td className="text-right">
                            <span className={entry.flakinessScore >= 50 ? 'text-red-500 font-semibold' : 'text-muted-foreground'}>
                              {entry.flakinessScore.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Slowest steps table */}
          <Card className="bg-card/70">
            <CardHeader>
              <CardTitle className="font-['Inter'] text-xl">Steps mais lentos</CardTitle>
            </CardHeader>
            <CardContent>
              {slowestSteps.length === 0 ? (
                <div className="empty-state" data-testid="slowest-empty">Nenhum dado disponível.</div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border/70">
                  <table className="table" data-testid="slowest-steps-table">
                    <thead>
                      <tr>
                        <th>Tipo</th>
                        <th>Descrição / Selector</th>
                        <th className="text-right">Duração Média</th>
                        <th className="text-right">Ocorrências</th>
                      </tr>
                    </thead>
                    <tbody>
                      {slowestSteps.map(step => (
                        <tr key={step.stepId}>
                          <td>
                            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{step.type}</code>
                          </td>
                          <td className="text-muted-foreground text-sm">
                            {step.description ?? step.selector ?? <span className="italic">—</span>}
                          </td>
                          <td className="text-right font-medium">{(step.avgDurationMs / 1000).toFixed(2)}s</td>
                          <td className="text-right text-muted-foreground">{step.occurrences}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
