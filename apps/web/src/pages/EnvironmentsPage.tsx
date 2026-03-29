import { useEffect, useState } from 'react'
import { api } from '../services/api'
import type { Environment, CreateEnvironmentInput } from '@test-studio/shared-types'

export function EnvironmentsPage() {
  const [environments, setEnvironments] = useState<Environment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CreateEnvironmentInput>({ name: '', baseURL: '', type: 'dev' })
  const [saving, setSaving] = useState(false)

  function load() {
    setLoading(true)
    api.get<Environment[]>('/environments')
      .then(res => setEnvironments(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/environments', form)
      setShowForm(false)
      setForm({ name: '', baseURL: '', type: 'dev' })
      load()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Deletar este ambiente?')) return
    await api.delete(`/environments/${id}`)
    load()
  }

  if (loading) return <p data-testid="loading">Carregando...</p>

  return (
    <div data-testid="environments-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Ambientes</h1>
        <button data-testid="btn-new-environment" onClick={() => setShowForm(!showForm)}>
          + Novo ambiente
        </button>
      </div>

      {error && <p style={{ color: 'red' }} data-testid="error">{error}</p>}

      {showForm && (
        <form data-testid="environment-form" onSubmit={handleSubmit} style={{ background: '#fff', padding: 16, marginBottom: 16, borderRadius: 8 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <input
              data-testid="input-name"
              placeholder="Nome"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
            <input
              data-testid="input-baseurl"
              placeholder="Base URL"
              value={form.baseURL}
              onChange={e => setForm(f => ({ ...f, baseURL: e.target.value }))}
              required
            />
            <select
              data-testid="select-type"
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value as Environment['type'] }))}
            >
              <option value="local">Local</option>
              <option value="dev">Dev</option>
              <option value="hml">HML</option>
              <option value="prod">Prod</option>
            </select>
            <button data-testid="btn-save" type="submit" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </form>
      )}

      {environments.length === 0 ? (
        <p data-testid="empty">Nenhum ambiente cadastrado.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8 }}>
          <thead>
            <tr style={{ background: '#f0f0f0' }}>
              <th style={{ padding: 12, textAlign: 'left' }}>Nome</th>
              <th style={{ padding: 12, textAlign: 'left' }}>URL</th>
              <th style={{ padding: 12, textAlign: 'left' }}>Tipo</th>
              <th style={{ padding: 12 }}></th>
            </tr>
          </thead>
          <tbody>
            {environments.map(env => (
              <tr key={env._id} data-testid={`env-row-${env._id}`}>
                <td style={{ padding: 12 }}>{env.name}</td>
                <td style={{ padding: 12 }}>{env.baseURL}</td>
                <td style={{ padding: 12 }}>{env.type}</td>
                <td style={{ padding: 12 }}>
                  <button
                    data-testid={`btn-delete-${env._id}`}
                    onClick={() => handleDelete(env._id)}
                    style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Deletar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
