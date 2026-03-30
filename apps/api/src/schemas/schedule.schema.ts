import { z } from 'zod'
import cron from 'node-cron'

export const createScheduleSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  cron: z
    .string()
    .min(1, 'Expressão cron obrigatória')
    .refine(val => cron.validate(val.trim()), { message: 'Expressão cron inválida (use 5 ou 6 partes)' }),
  caseId: z.string().min(1, 'Cenário obrigatório'),
  environmentId: z.string().min(1, 'Ambiente obrigatório'),
  datasetId: z.string().optional(),
  isActive: z.boolean().optional().default(true),
})

export const updateScheduleSchema = createScheduleSchema.partial()
