import { z } from 'zod'

const stepSchema = z.object({
  id: z.string(),
  type: z.enum(['visit', 'click', 'fill', 'select', 'check', 'waitForVisible', 'waitForURL', 'assertText', 'assertVisible']),
  selector: z.string().optional(),
  value: z.string().optional(),
  description: z.string().optional(),
  timeoutMs: z.number().optional(),
})

export const createTestCaseSchema = z.object({
  suiteId: z.string().min(1),
  name: z.string().min(1, 'Nome obrigatório'),
  description: z.string().optional(),
  steps: z.array(stepSchema).optional().default([]),
})

export const updateTestCaseSchema = createTestCaseSchema.partial()
