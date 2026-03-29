import { useEffect, useState } from 'react'
import { api } from '../services/api'
import type { Environment, CreateEnvironmentInput } from '@test-studio/shared-types'
import { PageHeader } from '../components/ui/PageHeader'

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

  if (loading) return <div className="loading-state" data-testid="loading">Carregando...</div>

  return (
    <div data-testid="environments-page" className="page-shell">
      <PageHeader
        eyebrow="Configuração"
        title="Ambientes"
        description="Centralize baseURL, headers e variáveis para rodar os mesmos cenários em local, dev, hml e produção."
        actions={
          <button
            className="button-primary"
            data-testid="btn-new-environment"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Fechar formulário' : '+ Novo ambiente'}
          </button>
        }
        meta={
          <>
            <span className="meta-chip">{environments.length} cadastrados</span>
            <span className="meta-chip accent">Reutilizáveis por cenário</span>
          </>
        }
      />

      {error && <div className="alert alert-error" data-testid="error">{error}</div>}

      {showForm && (
        <form data-testid="environment-form" onSubmit={handleSubmit} className="surface inline-form">
          <div className="section-heading">
            <div>
              <h2>Novo ambiente</h2>
              <p>Cadastre a URL base que será usada pelo runner durante gravação e execução.</p>
            </div>
          </div>

          <div className="field-grid">
            <label className="field">
              <span className="field-label">Nome</span>
              <input
                data-testid="input-name"
                placeholder="Ex: Local DEV"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </label>

            <label className="field">
              <span className="field-label">Base URL</span>
              <input
                data-testid="input-baseurl"
                placeholder="http://localhost:3009"
                value={form.baseURL}
                onChange={e => setForm(f => ({ ...f, baseURL: e.target.value }))}
                required
              />
            </label>

            <label className="field">
              <span className="field-label">Tipo</span>
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
            </label>
          </div>

          <div className="form-actions">
            <button className="button-primary" data-testid="btn-save" type="submit" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar ambiente'}
            </button>
            <button className="button-secondary" type="button" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </form>
      )}

      {environments.length === 0 ? (
        <div className="empty-state" data-testid="empty">Nenhum ambiente cadastrado.</div>
      ) : (
        <section className="surface">
          <div className="section-heading">
            <div>
              <h2>Lista de ambientes</h2>
              <p>Esses registros abastecem tanto o recorder quanto a execução do runner.</p>
            </div>
          </div>

          <div className="table-shell">
            <table className="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>URL</th>
                  <th>Tipo</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {environments.map(env => (
                  <tr key={env._id} data-testid={`env-row-${env._id}`}>
                    <td>{env.name}</td>
                    <td><code>{env.baseURL}</code></td>
                    <td><span className="meta-chip">{env.type}</span></td>
                    <td>
                      <button
                        className="button-danger"
                        data-testid={`btn-delete-${env._id}`}
                        onClick={() => handleDelete(env._id)}
                      >
                        Deletar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
