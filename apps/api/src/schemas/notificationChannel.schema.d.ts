import { z } from 'zod';
export declare const createNotificationChannelSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodEnum<["slack", "webhook"]>;
    url: z.ZodString;
    events: z.ZodDefault<z.ZodArray<z.ZodEnum<["on_pass", "on_fail", "always"]>, "many">>;
    isActive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    type: "slack" | "webhook";
    url: string;
    events: ("on_pass" | "on_fail" | "always")[];
    isActive: boolean;
}, {
    name: string;
    type: "slack" | "webhook";
    url: string;
    events?: ("on_pass" | "on_fail" | "always")[] | undefined;
    isActive?: boolean | undefined;
}>;
export declare const updateNotificationChannelSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["slack", "webhook"]>>;
    url: z.ZodOptional<z.ZodString>;
    events: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodEnum<["on_pass", "on_fail", "always"]>, "many">>>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodBoolean>>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    type?: "slack" | "webhook" | undefined;
    url?: string | undefined;
    events?: ("on_pass" | "on_fail" | "always")[] | undefined;
    isActive?: boolean | undefined;
}, {
    name?: string | undefined;
    type?: "slack" | "webhook" | undefined;
    url?: string | undefined;
    events?: ("on_pass" | "on_fail" | "always")[] | undefined;
    isActive?: boolean | undefined;
}>;
//# sourceMappingURL=notificationChannel.schema.d.ts.map