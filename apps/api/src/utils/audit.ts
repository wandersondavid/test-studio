import type { AuditActor } from '@test-studio/shared-types'

export function buildAuditActor(user: {
  id?: string
  _id?: string
  name: string
  email: string
  role: 'admin' | 'member'
}): AuditActor {
  return {
    userId: user.id ?? user._id ?? '',
    name: user.name,
    email: user.email,
    role: user.role,
  }
}

export function stringifyMetadataValue(value: unknown): string | number | boolean | null {
  if (value == null) return null
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value
  return JSON.stringify(value)
}
