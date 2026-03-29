export type UserRole = 'admin' | 'member'

export type UserStatus = 'active' | 'inactive'

export interface User {
  _id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface AuthSession {
  token: string
  user: User
}

export interface RegisterUserInput {
  name: string
  email: string
  password: string
  role?: UserRole
}
