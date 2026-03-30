import { z } from 'zod'

const stepRetrySchema = z.object({
  attempts: z.number().int().min(2).max(100),
  intervalMs: z.number().int().min(250).max(60 * 60 * 1000),
})

const stepApiConditionSchema = z.object({
  urlContains: z.string().min(1, 'Informe um trecho da URL da chamada.'),
  method: z.string().optional(),
  status: z.number().int().min(100).max(599).optional(),
  responseIncludes: z.string().optional(),
})

const stepSchema = z.object({
  id: z.string(),
  type: z.enum(['visit', 'click', 'fill', 'select', 'check', 'waitForVisible', 'waitForURL', 'waitForApi', 'assertText', 'assertVisible']),
  selector: z.string().optional(),
  selectorAlternatives: z.array(z.string()).optional(),
  value: z.string().optional(),
  description: z.string().optional(),
  timeoutMs: z.number().optional(),
  retry: stepRetrySchema.optional(),
  api: stepApiConditionSchema.optional(),
})

export const createTestCaseSchema = z.object({
  suiteId: z.string().min(1),
  name: z.string().min(1, 'Nome obrigatório'),
  description: z.string().optional(),
  setupCaseId: z.string().min(1).nullable().optional(),
  steps: z.array(stepSchema).optional().default([]),
})

export const updateTestCaseSchema = createTestCaseSchema.partial()

export const bulkDeleteTestCasesSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'Selecione pelo menos um cenário para excluir.'),
})
