export interface TestSuite {
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
