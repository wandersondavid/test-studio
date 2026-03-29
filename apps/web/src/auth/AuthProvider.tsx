import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AuthSession, LoginInput, RegisterUserInput, User } from '@test-studio/shared-types'
import { api } from '@/services/api'
import { clearStoredSession, getStoredSession, setStoredSession } from '@/services/session'

interface AuthContextValue {
  session: AuthSession | null
  user: User | null
  loading: boolean
  needsSetup: boolean
  login: (input: LoginInput) => Promise<void>
  bootstrapAdmin: (input: RegisterUserInput) => Promise<void>
  logout: () => void
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => getStoredSession())
  const [needsSetup, setNeedsSetup] = useState(false)
  const [loading, setLoading] = useState(true)

  async function refreshSession(): Promise<void> {
    const stored = getStoredSession()

    if (!stored) {
      const bootstrap = await api.get<{ needsSetup: boolean }>('/auth/bootstrap-state')
      setNeedsSetup(bootstrap.data.needsSetup)
      setSession(null)
      setLoading(false)
      return
    }

    try {
      const response = await api.get<{ user: User }>('/auth/me')
      const nextSession = {
        ...stored,
        user: response.data.user,
      }

      setStoredSession(nextSession)
      setNeedsSetup(false)
      setSession(nextSession)
    } catch {
      clearStoredSession()
      setSession(null)
      const bootstrap = await api.get<{ needsSetup: boolean }>('/auth/bootstrap-state')
      setNeedsSetup(bootstrap.data.needsSetup)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refreshSession()
  }, [])

  async function login(input: LoginInput): Promise<void> {
    const response = await api.post<AuthSession>('/auth/login', input)
    setStoredSession(response.data)
    setSession(response.data)
    setNeedsSetup(false)
  }

  async function bootstrapAdmin(input: RegisterUserInput): Promise<void> {
    const response = await api.post<AuthSession>('/auth/register', input)
    setStoredSession(response.data)
    setSession(response.data)
    setNeedsSetup(false)
  }

  function logout(): void {
    clearStoredSession()
    setSession(null)
  }

  const value = useMemo<AuthContextValue>(() => ({
    session,
    user: session?.user ?? null,
    loading,
    needsSetup,
    login,
    bootstrapAdmin,
    logout,
    refreshSession,
  }), [loading, needsSetup, session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) {
    throw new Error('useAuth precisa ser usado dentro de AuthProvider.')
  }
  return value
}
