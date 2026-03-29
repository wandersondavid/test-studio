import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import type { Environment, TestCase, Dataset, TestRun } from '@test-studio/shared-types'

export function RunPage() {
  const navigate = useNavigate()
  const [environments, setEnvironments] = useState<Environment[]>([])
  const [cases, setCases] = useState<TestCase[]>([])
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [selected, setSelected] = useState({ caseId: '', environmentId: '', datasetId: '' })
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      api.get<Environment[]>('/environments'),
      api.get<TestCase[]>('/test-cases'),
      api.get<Dataset[]>('/datasets'),
    ]).then(([e, c, d]) => {
      setEnvironments(e.data)
      setCases(c.data)
      setDatasets(d.data)
    })
  }, [])

  async function handleRun(e: React.FormEvent) {
    e.preventDefault()
    if (!selected.caseId || !selected.environmentId) return
    setRunning(true)
    setError(null)
    try {
      const res = await api.post<TestRun>('/test-runs/execute', {
        caseId: selected.caseId,
        environmentId: selected.environmentId,
        datasetId: selected.datasetId || undefined,
      })
      navigate(`/history/${res.data._id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao executar')
      setRunning(false)
    }
  }

  return (
    <div data-testid="run-page">
      <h1>Executar teste</h1>
      <form data-testid="run-form" onSubmit={handleRun} style={{ background: '#fff', padding: 24, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
        <div>
          <label>Cenário *</label><br />
          <select
            data-testid="select-case"
            value={selected.caseId}
            onChange={e => setSelected(s => ({ ...s, caseId: e.target.value }))}
            required
            style={{ width: '100%', padding: 8 }}
          >
            <option value="">Selecione...</option>
            {cases.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label>Ambiente *</label><br />
          <select
            data-testid="select-environment"
            value={selected.environmentId}
            onChange={e => setSelected(s => ({ ...s, environmentId: e.target.value }))}
            required
            style={{ width: '100%', padding: 8 }}
          >
            <option value="">Selecione...</option>
            {environments.map(env => <option key={env._id} value={env._id}>{env.name} ({env.type})</option>)}
          </select>
        </div>
        <div>
          <label>Dataset (opcional)</label><br />
          <select
            data-testid="select-dataset"
            value={selected.datasetId}
            onChange={e => setSelected(s => ({ ...s, datasetId: e.target.value }))}
            style={{ width: '100%', padding: 8 }}
          >
            <option value="">Nenhum</option>
            {datasets.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
        </div>
        {error && <p style={{ color: 'red' }} data-testid="run-error">{error}</p>}
        <button data-testid="btn-run" type="submit" disabled={running} style={{ padding: '10px 24px', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
          {running ? 'Executando...' : 'Executar'}
        </button>
      </form>
    </div>
  )
}
