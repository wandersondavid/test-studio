import { z } from 'zod'

export const createEnvironmentSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  baseURL: z.string().url('URL inválida'),
  type: z.enum(['local', 'dev', 'hml', 'prod']),
  headers: z.record(z.string()).optional().default({}),
  variables: z.record(z.string()).optional().default({}),
})

export const updateEnvironmentSchema = createEnvironmentSchema.partial()
