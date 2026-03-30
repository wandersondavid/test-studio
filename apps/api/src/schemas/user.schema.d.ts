import { z } from 'zod';
export declare const updateUserSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<["admin", "member"]>>;
    status: z.ZodOptional<z.ZodEnum<["active", "inactive"]>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    role?: "admin" | "member" | undefined;
    status?: "active" | "inactive" | undefined;
}, {
    name?: string | undefined;
    role?: "admin" | "member" | undefined;
    status?: "active" | "inactive" | undefined;
}>;
//# sourceMappingURL=user.schema.d.ts.map