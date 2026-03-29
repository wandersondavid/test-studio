import type { AuditedResource } from './audit'
import type { TestStep } from './testStep'

export interface ReusableBlock extends AuditedResource {
  _id: string
  name: string
  description?: string
  steps: TestStep[]
  createdAt: string
  updatedAt: string
}

export interface CreateReusableBlockInput {
  name: string
  description?: string
  steps: TestStep[]
}
