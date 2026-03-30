import { z } from 'zod';
export const executeTestRunSchema = z.object({
    caseId: z.string().min(1),
    environmentId: z.string().min(1),
    datasetId: z.string().optional(),
    requestedVia: z.enum(['web', 'cli', 'history', 'suite']).optional(),
    sourceRunId: z.string().optional(),
});
export const executeSuiteRunsSchema = z.object({
    suiteId: z.string().min(1),
    environmentId: z.string().min(1),
    datasetId: z.string().optional(),
    caseIds: z.array(z.string()).optional(),
    requestedVia: z.enum(['web', 'cli', 'history', 'suite']).optional(),
});
//# sourceMappingURL=testRun.schema.js.map