import type { TestStep } from './testStep'

export interface TestCase {
  _id: string
  suiteId: string
  name: string
  description?: string
  steps: TestStep[]
  createdAt: string
  updatedAt: string
}

export interface CreateTestCaseInput {
  suiteId: string
  name: string
  description?: string
  steps?: TestStep[]
}
