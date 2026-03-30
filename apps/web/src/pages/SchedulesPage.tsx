import { useEffect, useState } from 'react'
import type {
  Schedule,
  CreateScheduleInput,
  UpdateScheduleInput,
  Environment,
} from '@test-studio/shared-types'
import { schedulesApi } from '../services/schedules'
import { api } from '../services/api'
import { PageHeader } from '../components/ui/PageHeader'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'

interface TestCaseOption {
  _id: string
  name: string
}

interface DatasetOption {
  _id: string
  name: string
}

const emptyForm = (): CreateScheduleInput => ({
  name: '',
  cron: '',
  caseId: '',
  environmentId: '',
  datasetId: undefined,
  isActive: true,
})

export function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [cases, setCases] = useState<TestCaseOption[]>([])
  const [environments, setEnvironments] = useState<Environment[]>([])
  const [datasets, setDatasets] = useState<DatasetOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; kind: 'success' | 'error' } | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CreateScheduleInput>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [triggeringId, setTriggeringId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null)

  function showToast(message: string, kind: 'success' | 'error') {
    setToast({ message, kind })
    setTimeout(() => setToast(null), 4000)
  }

  function load() {
    setLoading(true)
    Promise.all([
      schedulesApi.list(),
      api.get<TestCaseOption[]>('/test-cases').then(r => r.data),
      api.get<Environment[]>('/environments').then(r => r.data),
      api.get<DatasetOption[]>('/datasets').then(r => r.data),
    ])
      .then(([s, c, e, d]) => {
        setSchedules(s)
        setCases(c)
        setEnvironments(e)
        setDatasets(d)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  function openNew() {
    setEditingId(null)
    setForm(emptyForm())
    setShowForm(true)
  }

  function openEdit(s: Schedule) {
    setEditingId(s._id)
    setForm({
      name: s.name,
      cron: s.cron,
      caseId: s.caseId,
      environmentId: s.environmentId,
      datasetId: s.datasetId,
      isActive: s.isActive,
    })
    setShowForm(true)
  }

  function cancelForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm())
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) {
        const update: UpdateScheduleInput = { ...form }
        await schedulesApi.update(editingId, update)
        showToast('Agendamento atualizado com sucesso!', 'success')
      } else {
        await schedulesApi.create(form)
        showToast('Agendamento criado com sucesso!', 'success')
      }
      cancelForm()
      load()
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Erro ao salvar', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await schedulesApi.delete(id)
      showToast('Agendamento removido.', 'success')
      load()
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Erro ao deletar', 'error')
    }
  }

  async function handleTrigger(id: string) {
    setTriggeringId(id)
    try {
      await schedulesApi.trigger(id)
      showToast('Execução disparada com sucesso!', 'success')
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Erro ao disparar', 'error')
    } finally {
      setTriggeringId(null)
    }
  }

  function formatDate(dt?: string): string {
    if (!dt) return '—'
    return new Date(dt).toLocaleString('pt-BR')
  }

  function getCaseName(caseId: string): string {
    return cases.find(c => c._id === caseId)?.name ?? caseId
  }

  function getEnvName(envId: string): string {
    return environments.find(e => e._id === envId)?.name ?? envId
  }

  if (loading) return <div className="loading-state" data-testid="loading">Carregando...</div>

  return (
    <div data-testid="schedules-page" className="page-shell">
      <PageHeader
        eyebrow="Automação"
        title="Agendamentos"
        description="Configure execuções automáticas de cenários por expressão cron."
        actions={
          <button
            className="button-primary"
            data-testid="btn-new-schedule"
            onClick={openNew}
          >
            + Novo agendamento
          </button>
        }
        meta={
          <>
            <span className="meta-chip">{schedules.length} cadastrados</span>
            <span className="meta-chip accent">{schedules.filter(s => s.isActive).length} ativos</span>
          </>
        }
      />

      {error && <div className="alert alert-error" data-testid="error">{error}</div>}

      {toast && (
        <div
          className={`alert ${toast.kind === 'success' ? 'alert-success' : 'alert-error'}`}
          data-testid="toast"
        >
          {toast.message}
        </div>
      )}

      {showForm && (
        <form data-testid="schedule-form" onSubmit={handleSubmit} className="surface inline-form">
          <div className="section-heading">
            <div>
              <h2>{editingId ? 'Editar agendamento' : 'Novo agendamento'}</h2>
              <p>Configure quando e como os testes serão executados automaticamente.</p>
            </div>
          </div>

          <div className="field-grid">
            <label className="field">
              <span className="field-label">Nome</span>
              <input
                data-testid="input-name"
                placeholder="Ex: Smoke test diário"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </label>

            <label className="field">
              <span className="field-label">Expressão cron</span>
              <input
                data-testid="input-cron"
                placeholder="0 * * * *"
                value={form.cron}
                onChange={e => setForm(f => ({ ...f, cron: e.target.value }))}
                required
              />
              <span className="field-hint">5 partes: min hora dia mês dia-semana &nbsp;·&nbsp; Ex: <code>0 8 * * 1-5</code> = seg–sex às 8h</span>
            </label>

            <label className="field">
              <span className="field-label">Cenário</span>
              <select
                data-testid="select-case"
                value={form.caseId}
                onChange={e => setForm(f => ({ ...f, caseId: e.target.value }))}
                required
              >
                <option value="">Selecione um cenário...</option>
                {cases.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="field-label">Ambiente</span>
              <select
                data-testid="select-environment"
                value={form.environmentId}
                onChange={e => setForm(f => ({ ...f, environmentId: e.target.value }))}
                required
              >
                <option value="">Selecione um ambiente...</option>
                {environments.map(env => (
                  <option key={env._id} value={env._id}>{env.name}</option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="field-label">Dataset (opcional)</span>
              <select
                data-testid="select-dataset"
                value={form.datasetId ?? ''}
                onChange={e => setForm(f => ({ ...f, datasetId: e.target.value || undefined }))}
              >
                <option value="">Nenhum</option>
                {datasets.map(d => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </label>

            <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.75rem' }}>
              <input
                type="checkbox"
                data-testid="toggle-active"
                checked={form.isActive ?? true}
                onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
              />
              <span className="field-label" style={{ margin: 0 }}>Ativo</span>
            </label>
          </div>

          <div className="form-actions">
            <button className="button-primary" data-testid="btn-save" type="submit" disabled={saving}>
              {saving ? 'Salvando...' : editingId ? 'Atualizar' : 'Criar agendamento'}
            </button>
            <button className="button-secondary" type="button" onClick={cancelForm}>Cancelar</button>
          </div>
        </form>
      )}

      {schedules.length === 0 ? (
        <div className="empty-state" data-testid="empty">Nenhum agendamento cadastrado.</div>
      ) : (
        <section className="surface">
          <div className="section-heading">
            <div>
              <h2>Agendamentos</h2>
              <p>Execuções automáticas configuradas via expressão cron.</p>
            </div>
          </div>

          <div className="table-shell">
            <table className="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Cron</th>
                  <th>Cenário</th>
                  <th>Ambiente</th>
                  <th>Última execução</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {schedules.map(s => (
                  <tr key={s._id} data-testid={`schedule-row-${s._id}`}>
                    <td>{s.name}</td>
                    <td><code>{s.cron}</code></td>
                    <td>{getCaseName(s.caseId)}</td>
                    <td>{getEnvName(s.environmentId)}</td>
                    <td>{formatDate(s.lastRunAt)}</td>
                    <td>
                      <span className={`meta-chip ${s.isActive ? 'accent' : ''}`} data-testid={`badge-active-${s._id}`}>
                        {s.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2" style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="button-secondary"
                          data-testid={`btn-edit-${s._id}`}
                          onClick={() => openEdit(s)}
                        >
                          Editar
                        </button>
                        <button
                          className="button-primary"
                          data-testid={`btn-trigger-${s._id}`}
                          disabled={triggeringId === s._id}
                          onClick={() => handleTrigger(s._id)}
                        >
                          {triggeringId === s._id ? 'Disparando...' : 'Executar agora'}
                        </button>
                        <button
                          className="button-danger"
                          data-testid={`btn-delete-${s._id}`}
                          onClick={() => setConfirmDelete({ id: s._id, name: s.name })}
                        >
                          Deletar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {confirmDelete && (
        <ConfirmDialog
          open={!!confirmDelete}
          title="Deletar agendamento"
          description={`Tem certeza que deseja deletar "${confirmDelete.name}"?`}
          tone="danger"
          confirmLabel="Deletar"
          onConfirm={() => {
            handleDelete(confirmDelete.id)
            setConfirmDelete(null)
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}
