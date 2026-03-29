export type EnvironmentType = 'local' | 'dev' | 'hml' | 'prod'

export interface Environment {
  _id: string
  name: string
  baseURL: string
  type: EnvironmentType
  headers: Record<string, string>
  variables: Record<string, string>
  createdAt: string
  updatedAt: string
}

export interface CreateEnvironmentInput {
  name: string
  baseURL: string
  type: EnvironmentType
  headers?: Record<string, string>
  variables?: Record<string, string>
}
