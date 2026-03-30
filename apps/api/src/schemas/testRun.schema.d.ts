import { z } from 'zod';
export declare const executeTestRunSchema: z.ZodObject<{
    caseId: z.ZodString;
    environmentId: z.ZodString;
    datasetId: z.ZodOptional<z.ZodString>;
    requestedVia: z.ZodOptional<z.ZodEnum<["web", "cli", "history", "suite"]>>;
    sourceRunId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    environmentId: string;
    caseId: string;
    datasetId?: string | undefined;
    requestedVia?: "suite" | "web" | "cli" | "history" | undefined;
    sourceRunId?: string | undefined;
}, {
    environmentId: string;
    caseId: string;
    datasetId?: string | undefined;
    requestedVia?: "suite" | "web" | "cli" | "history" | undefined;
    sourceRunId?: string | undefined;
}>;
export declare const executeSuiteRunsSchema: z.ZodObject<{
    suiteId: z.ZodString;
    environmentId: z.ZodString;
    datasetId: z.ZodOptional<z.ZodString>;
    caseIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    requestedVia: z.ZodOptional<z.ZodEnum<["web", "cli", "history", "suite"]>>;
}, "strip", z.ZodTypeAny, {
    environmentId: string;
    suiteId: string;
    datasetId?: string | undefined;
    requestedVia?: "suite" | "web" | "cli" | "history" | undefined;
    caseIds?: string[] | undefined;
}, {
    environmentId: string;
    suiteId: string;
    datasetId?: string | undefined;
    requestedVia?: "suite" | "web" | "cli" | "history" | undefined;
    caseIds?: string[] | undefined;
}>;
//# sourceMappingURL=testRun.schema.d.ts.map