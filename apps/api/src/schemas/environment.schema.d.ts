import { z } from 'zod';
export declare const createEnvironmentSchema: z.ZodObject<{
    name: z.ZodString;
    baseURL: z.ZodString;
    type: z.ZodEnum<["local", "dev", "hml", "prod"]>;
    headers: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>>;
    variables: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    type: "local" | "dev" | "hml" | "prod";
    baseURL: string;
    headers: Record<string, string>;
    variables: Record<string, string>;
}, {
    name: string;
    type: "local" | "dev" | "hml" | "prod";
    baseURL: string;
    headers?: Record<string, string> | undefined;
    variables?: Record<string, string> | undefined;
}>;
export declare const updateEnvironmentSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    baseURL: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["local", "dev", "hml", "prod"]>>;
    headers: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>>>;
    variables: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    type?: "local" | "dev" | "hml" | "prod" | undefined;
    baseURL?: string | undefined;
    headers?: Record<string, string> | undefined;
    variables?: Record<string, string> | undefined;
}, {
    name?: string | undefined;
    type?: "local" | "dev" | "hml" | "prod" | undefined;
    baseURL?: string | undefined;
    headers?: Record<string, string> | undefined;
    variables?: Record<string, string> | undefined;
}>;
//# sourceMappingURL=environment.schema.d.ts.map