import { z } from 'zod'

export const executeTestRunSchema = z.object({
  caseId: z.string().min(1),
  environmentId: z.string().min(1),
  datasetId: z.string().optional(),
})
