import { z } from 'zod';
export declare const createDatasetSchema: z.ZodObject<{
    name: z.ZodString;
    variables: z.ZodRecord<z.ZodString, z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    variables: Record<string, string>;
}, {
    name: string;
    variables: Record<string, string>;
}>;
export declare const updateDatasetSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    variables: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    variables?: Record<string, string> | undefined;
}, {
    name?: string | undefined;
    variables?: Record<string, string> | undefined;
}>;
//# sourceMappingURL=dataset.schema.d.ts.map