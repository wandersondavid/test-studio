import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import type { Environment, TestCase, Dataset, TestSuite } from '@test-studio/shared-types'
import { PageHeader } from '../components/ui/PageHeader'
import { executeSuiteRuns, executeTestRun } from '../services/testRuns'

type ExecutionMode = 'case' | 'suite'

export function RunPage() {
  const navigate = useNavigate()
  const [environments, setEnvironments] = useState<Environment[]>([])
  const [cases, setCases] = useState<TestCase[]>([])
  const [suites, setSuites] = useState<TestSuite[]>([])
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [mode, setMode] = useState<ExecutionMode>('case')
  const [selected, setSelected] = useState({ caseId: '', suiteId: '', environmentId: '', datasetId: '' })
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      api.get<Environment[]>('/environments'),
      api.get<TestCase[]>('/test-cases'),
      api.get<TestSuite[]>('/test-suites'),
      api.get<Dataset[]>('/datasets'),
    ]).then(([e, c, s, d]) => {
      setEnvironments(e.data)
      setCases(c.data)
      setSuites(s.data)
      setDatasets(d.data)
    })
  }, [])

  async function handleRun(e: React.FormEvent) {
    e.preventDefault()
    if (!selected.environmentId) return
    if (mode === 'case' && !selected.caseId) return
    if (mode === 'suite' && !selected.suiteId) return

    setRunning(true)
    setError(null)
    setSuccess(null)

    try {
      if (mode === 'suite') {
        const result = await executeSuiteRuns({
          suiteId: selected.suiteId,
          environmentId: selected.environmentId,
          datasetId: selected.datasetId || undefined,
          requestedVia: 'suite',
        })

        setSuccess(`${result.createdRuns.length} cenário(s) da suíte foram enfileirados.`)
        navigate('/history')
        return
      }

      const run = await executeTestRun({
        caseId: selected.caseId,
        environmentId: selected.environmentId,
        datasetId: selected.datasetId || undefined,
        requestedVia: 'web',
      })
      navigate(`/history/${run._id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao executar')
      setRunning(false)
      return
    }

    setRunning(false)
  }

  return (
    <div data-testid="run-page" className="page-shell">
      <PageHeader
        eyebrow="Orquestração"
        title="Executar teste"
        description="Dispare um cenário individual ou uma suíte inteira no runner Playwright, reaproveitando o mesmo ambiente e dataset."
        meta={
          <>
            <span className="meta-chip">{cases.length} cenários</span>
            <span className="meta-chip">{suites.length} suítes</span>
            <span className="meta-chip">{environments.length} ambientes</span>
            <span className="meta-chip accent">{datasets.length} datasets</span>
          </>
        }
      />

      <div className="run-form-layout">
        <form data-testid="run-form" onSubmit={handleRun} className="surface inline-form">
          <div className="field-grid">
            <label className="field">
              <span className="field-label">Modo de execução</span>
              <select value={mode} onChange={e => setMode(e.target.value as ExecutionMode)} data-testid="select-run-mode">
                <option value="case">Cenário</option>
                <option value="suite">Suíte</option>
              </select>
            </label>

            {mode === 'case' ? (
              <label className="field">
                <span className="field-label">Cenário *</span>
                <select
                  data-testid="select-case"
                  value={selected.caseId}
                  onChange={e => setSelected(s => ({ ...s, caseId: e.target.value }))}
                  required
                >
                  <option value="">Selecione...</option>
                  {cases.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </label>
            ) : (
              <label className="field">
                <span className="field-label">Suíte *</span>
                <select
                  data-testid="select-suite"
                  value={selected.suiteId}
                  onChange={e => setSelected(s => ({ ...s, suiteId: e.target.value }))}
                  required
                >
                  <option value="">Selecione...</option>
                  {suites.map(suite => <option key={suite._id} value={suite._id}>{suite.name}</option>)}
                </select>
              </label>
            )}

            <label className="field">
              <span className="field-label">Ambiente *</span>
              <select
                data-testid="select-environment"
                value={selected.environmentId}
                onChange={e => setSelected(s => ({ ...s, environmentId: e.target.value }))}
                required
              >
                <option value="">Selecione...</option>
                {environments.map(env => <option key={env._id} value={env._id}>{env.name} ({env.type})</option>)}
              </select>
            </label>

            <label className="field">
              <span className="field-label">Dataset (opcional)</span>
              <select
                data-testid="select-dataset"
                value={selected.datasetId}
                onChange={e => setSelected(s => ({ ...s, datasetId: e.target.value }))}
              >
                <option value="">Nenhum</option>
                {datasets.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </label>
          </div>

          {error && <div className="alert alert-error" data-testid="run-error">{error}</div>}
          {success && <div className="alert alert-info">{success}</div>}

          <div className="form-actions">
            <button className="button-primary" data-testid="btn-run" type="submit" disabled={running}>
              {running
                ? 'Executando...'
                : mode === 'suite'
                  ? 'Executar suíte'
                  : 'Executar cenário'}
            </button>
          </div>
        </form>

        <aside className="surface surface-muted">
          <div className="section-heading">
            <div>
              <h3>Checklist rápido</h3>
              <p>Antes de disparar, confirme os pontos que mais quebram runs em ambiente real.</p>
            </div>
          </div>
          <ul className="check-list">
            <li>Garanta que o ambiente selecionado está acessível pelo runner.</li>
            <li>Prefira steps com `data-testid` quando possível.</li>
            <li>Use dataset quando quiser repetir o mesmo cenário com outras massas.</li>
            <li>Para suítes grandes, use o histórico para retestar apenas os cenários que falharam.</li>
            <li>Depois do disparo, acompanhe os logs no histórico por step.</li>
          </ul>
        </aside>
      </div>
    </div>
  )
}
