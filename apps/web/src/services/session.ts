import type { AuthSession } from '@test-studio/shared-types'

const STORAGE_KEY = 'test-studio.session'

export function getStoredSession(): AuthSession | null {
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as AuthSession
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function setStoredSession(session: AuthSession): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function clearStoredSession(): void {
  window.localStorage.removeItem(STORAGE_KEY)
}

export function getAuthToken(): string | null {
  return getStoredSession()?.token ?? null
}
