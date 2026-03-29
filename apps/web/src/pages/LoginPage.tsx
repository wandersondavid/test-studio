import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/auth/AuthProvider'

export function LoginPage() {
  const { user, login, bootstrapAdmin, needsSetup } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (user) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      if (needsSetup) {
        await bootstrapAdmin({
          name: form.name,
          email: form.email,
          password: form.password,
          role: 'admin',
        })
        return
      }

      await login({
        email: form.email,
        password: form.password,
      })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Não foi possível autenticar.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-10 text-foreground">
      <Card className="w-full max-w-lg bg-card/80">
        <CardHeader className="space-y-4">
          <div className="page-kicker">Test Studio</div>
          <CardTitle className="font-['Space_Grotesk'] text-4xl">
            {needsSetup ? 'Criar administrador inicial' : 'Entrar no workspace'}
          </CardTitle>
          <CardDescription className="text-base">
            {needsSetup
              ? 'O banco está vazio. Crie o primeiro admin para ativar a plataforma.'
              : 'Use seu email e senha para acessar o builder, recorder e histórico de execuções.'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit} data-testid="auth-form">
            {needsSetup && (
              <label className="field">
                <span className="field-label">Nome</span>
                <Input
                  data-testid="input-register-name"
                  value={form.name}
                  onChange={event => setForm(current => ({ ...current, name: event.target.value }))}
                  placeholder="Administrador Test Studio"
                  required
                />
              </label>
            )}

            <label className="field">
              <span className="field-label">Email</span>
              <Input
                data-testid="input-login-email"
                type="email"
                value={form.email}
                onChange={event => setForm(current => ({ ...current, email: event.target.value }))}
                placeholder="admin@teststudio.local"
                required
              />
            </label>

            <label className="field">
              <span className="field-label">Senha</span>
              <Input
                data-testid="input-login-password"
                type="password"
                value={form.password}
                onChange={event => setForm(current => ({ ...current, password: event.target.value }))}
                placeholder="********"
                required
              />
            </label>

            {error && (
              <div className="alert alert-error" data-testid="auth-error">
                {error}
              </div>
            )}

            <Button className="w-full" type="submit" disabled={submitting} data-testid="btn-auth-submit">
              {submitting ? 'Processando...' : needsSetup ? 'Criar administrador' : 'Entrar'}
            </Button>

            {!needsSetup && (
              <div className="text-sm text-muted-foreground">
                Se esta for a primeira execução local, entre com o admin padrão: <code>admin@teststudio.local</code> /{' '}
                <code>admin123456</code>.
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
