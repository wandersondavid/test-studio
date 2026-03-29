import { z } from 'zod'

export const createTestSuiteSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  description: z.string().optional(),
})

export const updateTestSuiteSchema = createTestSuiteSchema.partial()
