import type { AuditedResource } from './audit'

export interface TestSuite extends AuditedResource {
  _id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface CreateTestSuiteInput {
  name: string
  description?: string
}
