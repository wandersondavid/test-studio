import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../services/api'
import type { TestSuite, TestCase } from '@test-studio/shared-types'
import { PageHeader } from '../components/ui/PageHeader'

export function SuiteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [suite, setSuite] = useState<TestSuite | null>(null)
  const [cases, setCases] = useState<TestCase[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')

  function load() {
    Promise.all([
      api.get<TestSuite>(`/test-suites/${id}`),
      api.get<TestCase[]>(`/test-cases?suiteId=${id}`),
    ]).then(([s, c]) => {
      setSuite(s.data)
      setCases(c.data)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  async function handleCreateCase(e: React.FormEvent) {
    e.preventDefault()
    await api.post('/test-cases', { suiteId: id, name: newName })
    setNewName('')
    load()
  }

  if (loading) return <div className="loading-state" data-testid="loading">Carregando...</div>
  if (!suite) return <div className="empty-state" data-testid="not-found">Suíte não encontrada</div>

  return (
    <div data-testid="suite-detail-page" className="page-shell">
      <PageHeader
        eyebrow="Suíte ativa"
        title={suite.name}
        description="Crie cenários reutilizáveis e entre no builder para gravar ou ajustar os steps."
        meta={
          <>
            <span className="meta-chip">{cases.length} cenários</span>
            <span className="meta-chip accent">Organização por fluxo</span>
          </>
        }
      />

      <form data-testid="case-form" onSubmit={handleCreateCase} className="surface inline-form">
        <div className="section-heading">
          <div>
            <h2>Novo cenário</h2>
            <p>Adicione um novo cenário dentro desta suíte antes de abrir o builder.</p>
          </div>
        </div>
        <div className="field-grid">
          <label className="field">
            <span className="field-label">Nome do cenário</span>
            <input
              data-testid="input-case-name"
              placeholder="Ex: Login com sucesso"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              required
            />
          </label>
        </div>
        <div className="form-actions">
          <button className="button-primary" data-testid="btn-add-case" type="submit">+ Adicionar cenário</button>
        </div>
      </form>

      {cases.length === 0 ? (
        <div className="empty-state" data-testid="empty">Nenhum cenário nesta suíte.</div>
      ) : (
        <ul className="list-stack" style={{ padding: 0 }}>
          {cases.map(c => (
            <li key={c._id} data-testid={`case-item-${c._id}`} className="list-card">
              <div>
                <strong>{c.name}</strong>
                <div className="list-card-meta">{c.steps.length} steps gravados neste cenário</div>
              </div>
              <Link to={`/cases/${c._id}`} className="button-link button-secondary">Abrir builder</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
