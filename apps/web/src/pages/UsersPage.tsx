import { useEffect, useState } from 'react'
import type { RegisterUserInput, User } from '@test-studio/shared-types'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/services/api'
import { useAuth } from '@/auth/AuthProvider'

export function UsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [form, setForm] = useState<RegisterUserInput>({
    name: '',
    email: '',
    password: '',
    role: 'member',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadUsers() {
    setLoading(true)
    try {
      const response = await api.get<User[]>('/users')
      setUsers(response.data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar usuários.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role === 'admin') {
      void loadUsers()
    }
  }, [user?.role])

  async function handleCreateUser(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)

    try {
      await api.post('/auth/register', form)
      setForm({ name: '', email: '', password: '', role: 'member' })
      await loadUsers()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar usuário.')
    } finally {
      setSaving(false)
    }
  }

  async function toggleStatus(target: User) {
    setSaving(true)
    setError(null)
    try {
      await api.put(`/users/${target._id}`, {
        status: target.status === 'active' ? 'inactive' : 'active',
      })
      await loadUsers()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar usuário.')
    } finally {
      setSaving(false)
    }
  }

  if (user?.role !== 'admin') {
    return (
      <div className="empty-state" data-testid="users-forbidden">
        Apenas administradores podem acessar a gestão de usuários.
      </div>
    )
  }

  return (
    <div data-testid="users-page" className="page-shell">
      <PageHeader
        eyebrow="Administração"
        title="Usuários"
        description="Cadastre membros, ative ou desative acessos e mantenha a trilha de autoria das ações no Test Studio."
      />

      {error && <div className="alert alert-error">{error}</div>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_380px]">
        <Card className="bg-card/70">
          <CardHeader>
            <CardTitle className="font-['Space_Grotesk'] text-2xl">Equipe</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="loading-state">Carregando usuários...</div>
            ) : (
              <div className="table-shell">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(item => (
                      <tr key={item._id}>
                        <td>{item.name}</td>
                        <td>{item.email}</td>
                        <td>{item.role}</td>
                        <td>{item.status}</td>
                        <td>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleStatus(item)}
                            disabled={saving || item._id === user._id}
                          >
                            {item.status === 'active' ? 'Desativar' : 'Ativar'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/70">
          <CardHeader>
            <CardTitle className="font-['Space_Grotesk'] text-2xl">Novo usuário</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="space-y-4" data-testid="user-form">
              <label className="field">
                <span className="field-label">Nome</span>
                <input value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} required />
              </label>
              <label className="field">
                <span className="field-label">Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={event => setForm(current => ({ ...current, email: event.target.value }))}
                  required
                />
              </label>
              <label className="field">
                <span className="field-label">Senha</span>
                <input
                  type="password"
                  value={form.password}
                  onChange={event => setForm(current => ({ ...current, password: event.target.value }))}
                  required
                />
              </label>
              <label className="field">
                <span className="field-label">Permissão</span>
                <select value={form.role} onChange={event => setForm(current => ({ ...current, role: event.target.value as 'admin' | 'member' }))}>
                  <option value="member">member</option>
                  <option value="admin">admin</option>
                </select>
              </label>
              <Button type="submit" disabled={saving}>
                {saving ? 'Salvando...' : 'Criar usuário'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
