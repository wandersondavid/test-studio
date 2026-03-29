import { z } from 'zod'

const stepRetrySchema = z.object({
  attempts: z.number().int().min(2).max(100),
  intervalMs: z.number().int().min(250).max(60 * 60 * 1000),
})

const stepSchema = z.object({
  id: z.string(),
  type: z.enum(['visit', 'click', 'fill', 'select', 'check', 'waitForVisible', 'waitForURL', 'assertText', 'assertVisible']),
  selector: z.string().optional(),
  value: z.string().optional(),
  description: z.string().optional(),
  timeoutMs: z.number().optional(),
  retry: stepRetrySchema.optional(),
})

export const createTestCaseSchema = z.object({
  suiteId: z.string().min(1),
  name: z.string().min(1, 'Nome obrigatório'),
  description: z.string().optional(),
  steps: z.array(stepSchema).optional().default([]),
})

export const updateTestCaseSchema = createTestCaseSchema.partial()
