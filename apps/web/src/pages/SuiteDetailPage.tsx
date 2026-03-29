import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../services/api'
import type { TestSuite, TestCase } from '@test-studio/shared-types'

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

  if (loading) return <p data-testid="loading">Carregando...</p>
  if (!suite) return <p data-testid="not-found">Suíte não encontrada</p>

  return (
    <div data-testid="suite-detail-page">
      <h1>{suite.name}</h1>
      <form data-testid="case-form" onSubmit={handleCreateCase} style={{ marginBottom: 16 }}>
        <input
          data-testid="input-case-name"
          placeholder="Nome do cenário"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          required
        />
        <button data-testid="btn-add-case" type="submit" style={{ marginLeft: 8 }}>+ Adicionar cenário</button>
      </form>

      {cases.length === 0 ? (
        <p data-testid="empty">Nenhum cenário nesta suíte.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {cases.map(c => (
            <li key={c._id} data-testid={`case-item-${c._id}`} style={{ background: '#fff', padding: 16, marginBottom: 8, borderRadius: 8 }}>
              <Link to={`/cases/${c._id}`}>{c.name}</Link>
              <span style={{ marginLeft: 12, color: '#888', fontSize: 12 }}>{c.steps.length} steps</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
