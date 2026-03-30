import { z } from 'zod';
export declare const createScheduleSchema: z.ZodObject<{
    name: z.ZodString;
    cron: z.ZodEffects<z.ZodString, string, string>;
    caseId: z.ZodString;
    environmentId: z.ZodString;
    datasetId: z.ZodOptional<z.ZodString>;
    isActive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    environmentId: string;
    caseId: string;
    isActive: boolean;
    cron: string;
    datasetId?: string | undefined;
}, {
    name: string;
    environmentId: string;
    caseId: string;
    cron: string;
    datasetId?: string | undefined;
    isActive?: boolean | undefined;
}>;
export declare const updateScheduleSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    cron: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    caseId: z.ZodOptional<z.ZodString>;
    environmentId: z.ZodOptional<z.ZodString>;
    datasetId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodBoolean>>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    environmentId?: string | undefined;
    caseId?: string | undefined;
    datasetId?: string | undefined;
    isActive?: boolean | undefined;
    cron?: string | undefined;
}, {
    name?: string | undefined;
    environmentId?: string | undefined;
    caseId?: string | undefined;
    datasetId?: string | undefined;
    isActive?: boolean | undefined;
    cron?: string | undefined;
}>;
//# sourceMappingURL=schedule.schema.d.ts.map