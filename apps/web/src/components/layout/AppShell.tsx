import type { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  BarChart3,
  Blocks,
  Clock3,
  Gauge,
  LogOut,
  MonitorPlay,
  PlayCircle,
  Search,
  ServerCog,
  Sparkles,
  Users,
} from 'lucide-react'
import { useAuth } from '@/auth/AuthProvider'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface AppShellProps {
  children: ReactNode
}

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', description: 'Visão operacional', icon: Gauge },
  { to: '/environments', label: 'Ambientes', description: 'URLs, headers e variáveis', icon: ServerCog },
  { to: '/suites', label: 'Suítes', description: 'Organização dos cenários', icon: Blocks },
  { to: '/run', label: 'Executar', description: 'Disparar testes E2E', icon: PlayCircle },
  { to: '/history', label: 'Histórico', description: 'Runs, logs e falhas', icon: Clock3 },
  { to: '/analytics', label: 'Analytics', description: 'Métricas e flakiness', icon: BarChart3 },
]

const PAGE_LABELS = new Map<string, string>([
  ['/', 'Dashboard'],
  ['/environments', 'Ambientes'],
  ['/suites', 'Suítes'],
  ['/run', 'Execução'],
  ['/history', 'Histórico'],
  ['/analytics', 'Analytics'],
  ['/users', 'Usuários'],
])

function resolveCurrentLabel(pathname: string): string {
  if (pathname.startsWith('/cases/')) return 'Builder'
  if (pathname.startsWith('/suites/')) return 'Detalhe da suíte'
  if (pathname.startsWith('/history/')) return 'Detalhe da execução'
  return PAGE_LABELS.get(pathname) ?? 'Workspace'
}

export function AppShell({ children }: AppShellProps) {
  const location = useLocation()
  const { user, logout } = useAuth()
  const currentLabel = resolveCurrentLabel(location.pathname)
  const navItems = user?.role === 'admin'
    ? [...NAV_ITEMS, { to: '/users', label: 'Usuários', description: 'Acessos e permissões', icon: Users }]
    : NAV_ITEMS

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-r border-border/70 bg-card/35 backdrop-blur-xl" data-testid="sidebar">
          <div className="flex h-full flex-col gap-6 p-4">
            <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/70 px-3 py-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
                TS
              </div>
              <div className="min-w-0">
                <div className="page-kicker">Workspace</div>
                <div className="truncate font-['Space_Grotesk'] text-xl font-semibold">Test Studio</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Recorder</Badge>
              <Badge variant="outline">Playwright</Badge>
              <Badge variant="outline">Mongo</Badge>
            </div>

            <div className="space-y-3">
              <div className="page-kicker">Navegação</div>
              <nav className="grid gap-1.5">
                {navItems.map(item => {
                  const Icon = item.icon

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) =>
                        cn(
                          'group flex items-start gap-3 rounded-xl border px-3 py-3 transition-colors',
                          isActive
                            ? 'border-border bg-secondary text-secondary-foreground'
                            : 'border-transparent text-muted-foreground hover:border-border/60 hover:bg-secondary/50 hover:text-foreground'
                        )
                      }
                    >
                      <span className="mt-0.5 rounded-md border border-border/70 bg-background/70 p-2 text-muted-foreground transition-colors group-hover:text-foreground">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-foreground">{item.label}</span>
                        <span className="block truncate text-xs text-muted-foreground">{item.description}</span>
                      </span>
                    </NavLink>
                  )
                })}
              </nav>
            </div>

            <Card className="mt-auto bg-background/70">
              <CardContent className="space-y-3 p-4">
                <div className="page-kicker">Estado da stack</div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3 text-muted-foreground">
                    <span>Frontend</span>
                    <strong className="text-foreground">Builder visual</strong>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-muted-foreground">
                    <span>Runner</span>
                    <strong className="text-foreground">Sessão real</strong>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-muted-foreground">
                    <span>Artefatos</span>
                    <strong className="text-foreground">Screenshot + vídeo</strong>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur-xl">
            <div className="flex flex-col gap-4 px-5 py-4 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
              <div className="space-y-1">
                <div className="page-kicker">Painel interno</div>
                <div className="flex items-center gap-2">
                  <MonitorPlay className="h-4 w-4 text-muted-foreground" />
                  <strong className="text-sm font-semibold md:text-base">{currentLabel}</strong>
                </div>
              </div>

              <label className="relative mx-auto flex w-full max-w-2xl items-center" aria-label="Pesquisar workspace">
                <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  readOnly
                  value=""
                  placeholder="Pesquisar cenários, execuções e ambientes"
                  className="h-11 rounded-full border-border/80 bg-card/70 pl-10 pr-4"
                />
              </label>

              <div className="flex items-center gap-2">
                <Badge variant="secondary">MVP ativo</Badge>
                {user && <Badge variant="outline">{user.role}</Badge>}
                <Badge variant="outline" className="hidden sm:inline-flex">Local-first</Badge>
                <Badge variant="outline" className="hidden xl:inline-flex">
                  <Sparkles className="mr-1 h-3.5 w-3.5" />
                  shadcn base
                </Badge>
                {user && (
                  <Button variant="ghost" size="sm" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </Button>
                )}
              </div>
            </div>
          </header>

          <main className="min-w-0 px-5 py-6 lg:px-8">
            {user && (
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <Badge variant="outline">{user.name}</Badge>
                <Badge variant="outline">{user.email}</Badge>
              </div>
            )}
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
