import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import type { TestSuite } from '@test-studio/shared-types'

export function SuitesPage() {
  const [suites, setSuites] = useState<TestSuite[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')

  function load() {
    api.get<TestSuite[]>('/test-suites')
      .then(res => setSuites(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    await api.post('/test-suites', { name })
    setName('')
    setShowForm(false)
    load()
  }

  if (loading) return <p data-testid="loading">Carregando...</p>

  return (
    <div data-testid="suites-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Suítes</h1>
        <button data-testid="btn-new-suite" onClick={() => setShowForm(!showForm)}>+ Nova suíte</button>
      </div>

      {showForm && (
        <form data-testid="suite-form" onSubmit={handleCreate} style={{ marginBottom: 16 }}>
          <input
            data-testid="input-suite-name"
            placeholder="Nome da suíte"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <button data-testid="btn-save-suite" type="submit" style={{ marginLeft: 8 }}>Salvar</button>
        </form>
      )}

      {suites.length === 0 ? (
        <p data-testid="empty">Nenhuma suíte criada.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {suites.map(suite => (
            <li key={suite._id} data-testid={`suite-item-${suite._id}`} style={{ background: '#fff', padding: 16, marginBottom: 8, borderRadius: 8 }}>
              <Link to={`/suites/${suite._id}`}><strong>{suite.name}</strong></Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
