import { api } from './api'
import type { TestStep } from '@test-studio/shared-types'

export async function generateSteps(description: string, baseURL?: string): Promise<TestStep[]> {
  const response = await api.post<{ steps: TestStep[] }>('/ai/generate-steps', { description, baseURL })
  return response.data.steps
}
