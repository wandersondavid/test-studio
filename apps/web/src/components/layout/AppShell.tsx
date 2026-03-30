import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import {
  BarChart3,
  Bell,
  Blocks,
  Clock,
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
import { api } from '@/services/api'
import type { Environment, TestCase, TestRun } from '@test-studio/shared-types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { shortId } from '@/lib/format'
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
  { to: '/schedules', label: 'Agendamentos', description: 'Execuções automáticas cron', icon: Clock },
  { to: '/notification-channels', label: 'Notificações', description: 'Slack e webhooks', icon: Bell },
]

const PAGE_LABELS = new Map<string, string>([
  ['/', 'Dashboard'],
  ['/environments', 'Ambientes'],
  ['/suites', 'Suítes'],
  ['/run', 'Execução'],
  ['/history', 'Histórico'],
  ['/analytics', 'Analytics'],
  ['/users', 'Usuários'],
  ['/schedules', 'Agendamentos'],
  ['/notification-channels', 'Notificações'],
])

const SEARCH_CACHE_TTL_MS = 60000
const SEARCH_DEBOUNCE_MS = 250
const SEARCH_MIN_CHARS = 2
const SEARCH_RESULT_LIMIT = 5
const SEARCH_FALLBACK_DESCRIPTION = 'Sem descrição'
const SEARCH_FALLBACK_CASE_NAME = 'Cenário sem nome'
const SEARCH_FALLBACK_ENVIRONMENT_LABEL = 'Ambiente removido'

type SearchData = {
  cases: TestCase[]
  runs: TestRun[]
  environments: Environment[]
}

type SearchItem = {
  id: string
  title: string
  description?: string
  meta?: string
  href: string
}

type SearchResults = {
  cases: SearchItem[]
  runs: SearchItem[]
  environments: SearchItem[]
}

type SearchIndex = {
  caseNameById: Map<string, string>
  environmentLabelById: Map<string, string>
}

type SearchCache = {
  data: SearchData
  index: SearchIndex
}

function resolveCurrentLabel(pathname: string): string {
  if (pathname.startsWith('/cases/')) return 'Builder'
  if (pathname.startsWith('/suites/')) return 'Detalhe da suíte'
  if (pathname.startsWith('/history/')) return 'Detalhe da execução'
  return PAGE_LABELS.get(pathname) ?? 'Workspace'
}

function shouldRefreshCache(cache: SearchCache | null, now: number, lastUpdated: number): boolean {
  return !cache || now - lastUpdated > SEARCH_CACHE_TTL_MS
}

function matchesSearchTerm(value: string | undefined, term: string): boolean {
  return Boolean(value && value.toLowerCase().includes(term))
}

function buildSearchIndex(data: SearchData): SearchIndex {
  return {
    caseNameById: new Map(data.cases.map(testCase => [testCase._id, testCase.name])),
    environmentLabelById: new Map(
      data.environments.map(environment => [environment._id, `${environment.name} (${environment.type})`])
    ),
  }
}

function buildSearchResults(data: SearchData, index: SearchIndex, term: string): SearchResults {
  const normalizedTerm = term.toLowerCase()
  const { caseNameById, environmentLabelById } = index

  const cases = data.cases
    .filter(testCase => (
      matchesSearchTerm(testCase.name, normalizedTerm)
      || matchesSearchTerm(testCase.description, normalizedTerm)
      || matchesSearchTerm(testCase._id, normalizedTerm)
    ))
    .slice(0, SEARCH_RESULT_LIMIT)
    .map(testCase => ({
      id: testCase._id,
      title: testCase.name,
      description: testCase.description ?? SEARCH_FALLBACK_DESCRIPTION,
      href: `/cases/${testCase._id}`,
    }))

  const environments = data.environments
    .filter(environment => (
      matchesSearchTerm(environment.name, normalizedTerm)
      || matchesSearchTerm(environment.baseURL, normalizedTerm)
      || matchesSearchTerm(environment.type, normalizedTerm)
      || matchesSearchTerm(environment._id, normalizedTerm)
    ))
    .slice(0, SEARCH_RESULT_LIMIT)
    .map(environment => ({
      id: environment._id,
      title: environment.name,
      description: `${environment.baseURL} • ${environment.type.toUpperCase()}`,
      href: `/environments#env-${environment._id}`,
    }))

  const runs = data.runs
    .filter(run => {
      const caseName = caseNameById.get(run.caseId) ?? ''
      const environmentLabel = environmentLabelById.get(run.environmentId) ?? ''

      return (
        matchesSearchTerm(run._id, normalizedTerm)
        || matchesSearchTerm(run.status, normalizedTerm)
        || matchesSearchTerm(caseName, normalizedTerm)
        || matchesSearchTerm(environmentLabel, normalizedTerm)
      )
    })
    .slice(0, SEARCH_RESULT_LIMIT)
    .map(run => {
      const caseName = caseNameById.get(run.caseId) ?? SEARCH_FALLBACK_CASE_NAME
      const environmentLabel = environmentLabelById.get(run.environmentId) ?? SEARCH_FALLBACK_ENVIRONMENT_LABEL

      return {
        id: run._id,
        title: caseName,
        description: `${environmentLabel} • ${run.status}`,
        meta: `#${shortId(run._id)}`,
        href: `/history/${run._id}`,
      }
    })

  return { cases, runs, environments }
}

export function AppShell({ children }: AppShellProps) {
  const location = useLocation()
  const { user, logout } = useAuth()
  const currentLabel = resolveCurrentLabel(location.pathname)
  const navItems = user?.role === 'admin'
    ? [...NAV_ITEMS, { to: '/users', label: 'Usuários', description: 'Acessos e permissões', icon: Users }]
    : NAV_ITEMS
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResults>({ cases: [], runs: [], environments: [] })
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const searchContainerRef = useRef<HTMLDivElement | null>(null)
  const searchCacheRef = useRef<SearchCache | null>(null)
  const searchCacheTimestampRef = useRef(0)

  const normalizedQuery = searchQuery.trim()
  const canSearch = normalizedQuery.length >= SEARCH_MIN_CHARS
  const totalResults = searchResults.cases.length + searchResults.runs.length + searchResults.environments.length

  const closeSearch = useCallback((clearQuery = false) => {
    if (clearQuery) {
      setSearchQuery('')
    }
    setSearchOpen(false)
  }, [])

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        closeSearch()
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeSearch()
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [closeSearch])

  useEffect(() => {
    if (!normalizedQuery) {
      setSearchResults({ cases: [], runs: [], environments: [] })
      setSearchError(null)
      setSearchLoading(false)
      setSearchOpen(false)
      return
    }

    if (!canSearch) {
      setSearchResults({ cases: [], runs: [], environments: [] })
      setSearchError(null)
      setSearchLoading(false)
      return
    }

    let cancelled = false
    const timer = window.setTimeout(async () => {
      setSearchLoading(true)
      setSearchError(null)
      try {
        const now = Date.now()
        const cached = searchCacheRef.current
        const shouldFetch = shouldRefreshCache(cached, now, searchCacheTimestampRef.current)
        let resolvedCache = cached

        if (shouldFetch) {
          const [casesResponse, runsResponse, environmentsResponse] = await Promise.all([
            api.get<TestCase[]>('/test-cases'),
            api.get<TestRun[]>('/test-runs'),
            api.get<Environment[]>('/environments'),
          ])
          const data = {
            cases: casesResponse.data,
            runs: runsResponse.data,
            environments: environmentsResponse.data,
          }
          resolvedCache = { data, index: buildSearchIndex(data) }
          searchCacheRef.current = resolvedCache
          searchCacheTimestampRef.current = now
        }

        if (cancelled || !resolvedCache) return
        setSearchResults(buildSearchResults(resolvedCache.data, resolvedCache.index, normalizedQuery))
        setSearchOpen(true)
      } catch (error: unknown) {
        if (cancelled) return
        console.error('[search] Falha ao carregar dados:', error)
        setSearchError(error instanceof Error && error.message
          ? error.message
          : 'Erro ao buscar dados. Verifique sua conexão ou permissões.')
      } finally {
        if (!cancelled) {
          setSearchLoading(false)
        }
      }
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [canSearch, normalizedQuery])

  function handleSearchChange(value: string) {
    setSearchQuery(value)
    if (!value.trim()) {
      closeSearch()
    }
  }

  function handleSearchSelect() {
    setSearchQuery('')
    setSearchOpen(false)
  }

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
                <div className="truncate text-lg font-semibold tracking-tight">Test Studio</div>
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

              <div className="relative mx-auto w-full max-w-2xl" data-testid="global-search" ref={searchContainerRef}>
                <label className="relative flex w-full items-center" aria-label="Pesquisar workspace">
                  <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={event => handleSearchChange(event.target.value)}
                    onFocus={() => {
                      if (canSearch) {
                        setSearchOpen(true)
                      }
                    }}
                    onKeyDown={event => {
                      if (event.key === 'Escape') {
                        event.preventDefault()
                        closeSearch(true)
                      }
                    }}
                    placeholder="Pesquisar cenários, execuções e ambientes"
                    className="h-11 rounded-full border-border/80 bg-card/70 pl-10 pr-4"
                    aria-expanded={searchOpen}
                    aria-controls="global-search-results"
                    aria-haspopup="listbox"
                    data-testid="global-search-input"
                  />
                </label>

                {searchOpen && (
                  <div
                    id="global-search-results"
                    role="listbox"
                    data-testid="global-search-results"
                    className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-lg"
                  >
                    {searchLoading && (
                      <div className="px-4 py-3 text-sm text-muted-foreground">Buscando...</div>
                    )}
                    {!searchLoading && searchError && (
                      <div className="px-4 py-3 text-sm text-red-300">{searchError}</div>
                    )}
                    {!searchLoading && !searchError && !canSearch && (
                      <div className="px-4 py-3 text-sm text-muted-foreground">
                        Digite pelo menos 2 caracteres para buscar.
                      </div>
                    )}
                    {!searchLoading && !searchError && canSearch && totalResults === 0 && (
                      <div className="px-4 py-3 text-sm text-muted-foreground">
                        Nenhum resultado encontrado.
                      </div>
                    )}
                    {!searchLoading && !searchError && totalResults > 0 && (
                      <div className="divide-y divide-border/60">
                        {searchResults.cases.length > 0 && (
                          <div className="py-3">
                            <div className="px-4 text-xs font-semibold uppercase text-muted-foreground">Cenários</div>
                            <ul className="mt-2 space-y-1">
                              {searchResults.cases.map(item => (
                                <li key={item.id}>
                                  <Link
                                    to={item.href}
                                    onClick={handleSearchSelect}
                                    role="option"
                                    data-testid={`search-case-${item.id}`}
                                    className="flex flex-col gap-1 px-4 py-2 text-sm text-foreground transition hover:bg-secondary/60"
                                  >
                                    <span className="font-medium">{item.title}</span>
                                    {item.description && (
                                      <span className="text-xs text-muted-foreground">{item.description}</span>
                                    )}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {searchResults.runs.length > 0 && (
                          <div className="py-3">
                            <div className="px-4 text-xs font-semibold uppercase text-muted-foreground">Execuções</div>
                            <ul className="mt-2 space-y-1">
                              {searchResults.runs.map(item => (
                                <li key={item.id}>
                                  <Link
                                    to={item.href}
                                    onClick={handleSearchSelect}
                                    role="option"
                                    data-testid={`search-run-${item.id}`}
                                    className="flex flex-col gap-1 px-4 py-2 text-sm text-foreground transition hover:bg-secondary/60"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="font-medium">{item.title}</span>
                                      {item.meta && (
                                        <span className="text-xs text-muted-foreground">{item.meta}</span>
                                      )}
                                    </div>
                                    {item.description && (
                                      <span className="text-xs text-muted-foreground">{item.description}</span>
                                    )}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {searchResults.environments.length > 0 && (
                          <div className="py-3">
                            <div className="px-4 text-xs font-semibold uppercase text-muted-foreground">Ambientes</div>
                            <ul className="mt-2 space-y-1">
                              {searchResults.environments.map(item => (
                                <li key={item.id}>
                                  <Link
                                    to={item.href}
                                    onClick={handleSearchSelect}
                                    role="option"
                                    data-testid={`search-environment-${item.id}`}
                                    className="flex flex-col gap-1 px-4 py-2 text-sm text-foreground transition hover:bg-secondary/60"
                                  >
                                    <span className="font-medium">{item.title}</span>
                                    {item.description && (
                                      <span className="text-xs text-muted-foreground">{item.description}</span>
                                    )}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

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
