import { z } from 'zod';
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const registerUserSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodDefault<z.ZodOptional<z.ZodEnum<["admin", "member"]>>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    role: "admin" | "member";
    password: string;
}, {
    name: string;
    email: string;
    password: string;
    role?: "admin" | "member" | undefined;
}>;
//# sourceMappingURL=auth.schema.d.ts.map