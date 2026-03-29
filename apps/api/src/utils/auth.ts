import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { User } from '@test-studio/shared-types'

export interface AuthTokenClaims {
  userId: string
  email: string
  role: 'admin' | 'member'
}

const JWT_SECRET = process.env.JWT_SECRET ?? 'test-studio-dev-secret'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '24h'
const RUNNER_SHARED_SECRET = process.env.RUNNER_SHARED_SECRET ?? 'test-studio-runner-secret'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash)
}

export function signAuthToken(user: Pick<User, '_id' | 'email' | 'role'>): string {
  const signOptions: jwt.SignOptions = {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  }

  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
    } satisfies AuthTokenClaims,
    JWT_SECRET,
    signOptions
  )
}

export function verifyAuthToken(token: string): AuthTokenClaims {
  return jwt.verify(token, JWT_SECRET) as AuthTokenClaims
}

export function getRunnerSharedSecret(): string {
  return RUNNER_SHARED_SECRET
}

export function extractBearerToken(headerValue?: string): string | null {
  if (!headerValue) return null
  const [scheme, token] = headerValue.split(' ')
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null
  return token
}
