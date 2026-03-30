import { useEffect, useState } from 'react'
import type {
  NotificationChannel,
  CreateNotificationChannelInput,
  NotificationEvent,
  NotificationChannelType,
} from '@test-studio/shared-types'
import { notificationChannelsApi } from '../services/notificationChannels'
import { PageHeader } from '../components/ui/PageHeader'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'

const EVENT_LABELS: Record<NotificationEvent, string> = {
  on_pass: 'On Pass',
  on_fail: 'On Fail',
  always: 'Always',
}

const ALL_EVENTS: NotificationEvent[] = ['on_pass', 'on_fail', 'always']

const emptyForm = (): CreateNotificationChannelInput => ({
  name: '',
  type: 'slack',
  url: '',
  events: ['on_fail'],
  isActive: true,
})

export function NotificationChannelsPage() {
  const [channels, setChannels] = useState<NotificationChannel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; kind: 'success' | 'error' } | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CreateNotificationChannelInput>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [testingId, setTestingId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null)

  function showToast(message: string, kind: 'success' | 'error') {
    setToast({ message, kind })
    setTimeout(() => setToast(null), 4000)
  }

  function load() {
    setLoading(true)
    notificationChannelsApi
      .list()
      .then(data => setChannels(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  function openNew() {
    setEditingId(null)
    setForm(emptyForm())
    setShowForm(true)
  }

  function openEdit(ch: NotificationChannel) {
    setEditingId(ch._id)
    setForm({ name: ch.name, type: ch.type, url: ch.url, events: ch.events, isActive: ch.isActive })
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm())
  }

  function toggleEvent(ev: NotificationEvent) {
    setForm(f => ({
      ...f,
      events: f.events.includes(ev) ? f.events.filter(e => e !== ev) : [...f.events, ev],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.events.length === 0) {
      showToast('Selecione ao menos um evento.', 'error')
      return
    }
    setSaving(true)
    try {
      if (editingId) {
        await notificationChannelsApi.update(editingId, form)
        showToast('Canal atualizado com sucesso.', 'success')
      } else {
        await notificationChannelsApi.create(form)
        showToast('Canal criado com sucesso.', 'success')
      }
      closeForm()
      load()
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Erro ao salvar', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string, name: string) {
    setConfirmDelete({ id, name })
  }

  async function confirmDeleteChannel() {
    if (!confirmDelete) return
    try {
      await notificationChannelsApi.delete(confirmDelete.id)
      showToast('Canal removido.', 'success')
      load()
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Erro ao deletar', 'error')
    } finally {
      setConfirmDelete(null)
    }
  }

  async function handleTest(id: string) {
    setTestingId(id)
    try {
      await notificationChannelsApi.test(id)
      showToast('Notificação de teste enviada com sucesso!', 'success')
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Falha ao enviar notificação de teste', 'error')
    } finally {
      setTestingId(null)
    }
  }

  async function handleToggleActive(ch: NotificationChannel) {
    try {
      await notificationChannelsApi.update(ch._id, { isActive: !ch.isActive })
      load()
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Erro ao atualizar', 'error')
    }
  }

  const urlPlaceholder = form.type === 'slack'
    ? 'https://hooks.slack.com/services/...'
    : 'https://example.com/webhook'

  if (loading) return <div className="loading-state" data-testid="loading">Carregando...</div>

  return (
    <div data-testid="notification-channels-page" className="page-shell">
      <PageHeader
        eyebrow="Configuração"
        title="Canais de Notificação"
        description="Configure webhooks do Slack ou genéricos para receber alertas quando execuções forem concluídas."
        actions={
          <button
            className="button-primary"
            data-testid="btn-new-channel"
            onClick={showForm ? closeForm : openNew}
          >
            {showForm ? 'Fechar formulário' : '+ Novo canal'}
          </button>
        }
        meta={
          <>
            <span className="meta-chip">{channels.length} cadastrados</span>
            <span className="meta-chip accent">Slack + Webhook</span>
          </>
        }
      />

      {toast && (
        <div
          className={`alert ${toast.kind === 'success' ? 'alert-success' : 'alert-error'}`}
          data-testid="toast"
        >
          {toast.message}
        </div>
      )}

      {error && <div className="alert alert-error" data-testid="error">{error}</div>}

      {showForm && (
        <form data-testid="channel-form" onSubmit={handleSubmit} className="surface inline-form">
          <div className="section-heading">
            <div>
              <h2>{editingId ? 'Editar canal' : 'Novo canal'}</h2>
              <p>Configure a URL do webhook e os eventos que devem disparar a notificação.</p>
            </div>
          </div>

          <div className="field-grid">
            <label className="field">
              <span className="field-label">Nome</span>
              <input
                data-testid="input-name"
                placeholder="Ex: Slack #alerts"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </label>

            <label className="field">
              <span className="field-label">Tipo</span>
              <select
                data-testid="select-type"
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value as NotificationChannelType }))}
              >
                <option value="slack">Slack</option>
                <option value="webhook">Webhook</option>
              </select>
            </label>

            <label className="field">
              <span className="field-label">URL do Webhook</span>
              <input
                data-testid="input-url"
                placeholder={urlPlaceholder}
                value={form.url}
                onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                required
              />
            </label>
          </div>

          <div className="field">
            <span className="field-label">Eventos</span>
            <div className="flex flex-wrap gap-4 mt-1" data-testid="events-checkboxes">
              {ALL_EVENTS.map(ev => (
                <label key={ev} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    data-testid={`checkbox-event-${ev}`}
                    checked={form.events.includes(ev)}
                    onChange={() => toggleEvent(ev)}
                  />
                  {EVENT_LABELS[ev]}
                </label>
              ))}
            </div>
          </div>

          <div className="field">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                data-testid="checkbox-active"
                checked={form.isActive ?? true}
                onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
              />
              <span className="field-label">Ativo</span>
            </label>
          </div>

          <div className="form-actions">
            <button className="button-primary" data-testid="btn-save" type="submit" disabled={saving}>
              {saving ? 'Salvando...' : editingId ? 'Atualizar canal' : 'Salvar canal'}
            </button>
            <button className="button-secondary" type="button" onClick={closeForm}>Cancelar</button>
          </div>
        </form>
      )}

      {channels.length === 0 ? (
        <div className="empty-state" data-testid="empty">Nenhum canal de notificação cadastrado.</div>
      ) : (
        <section className="surface">
          <div className="section-heading">
            <div>
              <h2>Canais cadastrados</h2>
              <p>Ative ou desative canais individualmente sem precisar deletá-los.</p>
            </div>
          </div>

          <div className="table-shell">
            <table className="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Eventos</th>
                  <th>Ativo</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {channels.map(ch => (
                  <tr key={ch._id} data-testid={`channel-row-${ch._id}`}>
                    <td>{ch.name}</td>
                    <td>
                      <span className={`meta-chip ${ch.type === 'slack' ? 'accent' : ''}`}>
                        {ch.type}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {ch.events.map(ev => (
                          <span key={ev} className="meta-chip">{EVENT_LABELS[ev]}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <button
                        data-testid={`btn-toggle-${ch._id}`}
                        className={ch.isActive ? 'button-primary' : 'button-secondary'}
                        style={{ padding: '2px 10px', fontSize: '0.75rem' }}
                        onClick={() => handleToggleActive(ch)}
                        title={ch.isActive ? 'Desativar canal' : 'Ativar canal'}
                      >
                        {ch.isActive ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          className="button-secondary"
                          data-testid={`btn-test-${ch._id}`}
                          disabled={testingId === ch._id}
                          onClick={() => handleTest(ch._id)}
                        >
                          {testingId === ch._id ? 'Enviando...' : 'Testar'}
                        </button>
                        <button
                          className="button-secondary"
                          data-testid={`btn-edit-${ch._id}`}
                          onClick={() => openEdit(ch)}
                        >
                          Editar
                        </button>
                        <button
                          className="button-danger"
                          data-testid={`btn-delete-${ch._id}`}
                          onClick={() => handleDelete(ch._id, ch.name)}
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

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Deletar canal"
        description={`Tem certeza que deseja deletar o canal "${confirmDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Deletar"
        tone="danger"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={confirmDeleteChannel}
      />
    </div>
  )
}
