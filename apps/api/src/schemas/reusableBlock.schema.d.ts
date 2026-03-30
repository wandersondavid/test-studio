import { z } from 'zod';
export declare const createReusableBlockSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    steps: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["visit", "click", "fill", "select", "check", "waitForVisible", "waitForURL", "waitForApi", "assertText", "assertVisible"]>;
        selector: z.ZodOptional<z.ZodString>;
        selectorAlternatives: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        value: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        timeoutMs: z.ZodOptional<z.ZodNumber>;
        retry: z.ZodOptional<z.ZodObject<{
            attempts: z.ZodNumber;
            intervalMs: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            attempts: number;
            intervalMs: number;
        }, {
            attempts: number;
            intervalMs: number;
        }>>;
        api: z.ZodOptional<z.ZodObject<{
            urlContains: z.ZodString;
            method: z.ZodOptional<z.ZodString>;
            status: z.ZodOptional<z.ZodNumber>;
            responseIncludes: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            urlContains: string;
            status?: number | undefined;
            method?: string | undefined;
            responseIncludes?: string | undefined;
        }, {
            urlContains: string;
            status?: number | undefined;
            method?: string | undefined;
            responseIncludes?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        type: "fill" | "select" | "visit" | "click" | "check" | "waitForVisible" | "waitForURL" | "waitForApi" | "assertText" | "assertVisible";
        description?: string | undefined;
        value?: string | undefined;
        selector?: string | undefined;
        selectorAlternatives?: string[] | undefined;
        timeoutMs?: number | undefined;
        retry?: {
            attempts: number;
            intervalMs: number;
        } | undefined;
        api?: {
            urlContains: string;
            status?: number | undefined;
            method?: string | undefined;
            responseIncludes?: string | undefined;
        } | undefined;
    }, {
        id: string;
        type: "fill" | "select" | "visit" | "click" | "check" | "waitForVisible" | "waitForURL" | "waitForApi" | "assertText" | "assertVisible";
        description?: string | undefined;
        value?: string | undefined;
        selector?: string | undefined;
        selectorAlternatives?: string[] | undefined;
        timeoutMs?: number | undefined;
        retry?: {
            attempts: number;
            intervalMs: number;
        } | undefined;
        api?: {
            urlContains: string;
            status?: number | undefined;
            method?: string | undefined;
            responseIncludes?: string | undefined;
        } | undefined;
    }>, "many">;
    parameters: z.ZodOptional<z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        label: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        required: z.ZodOptional<z.ZodBoolean>;
        defaultValue: z.ZodOptional<z.ZodString>;
        secret: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        key: string;
        description?: string | undefined;
        required?: boolean | undefined;
        label?: string | undefined;
        defaultValue?: string | undefined;
        secret?: boolean | undefined;
    }, {
        key: string;
        description?: string | undefined;
        required?: boolean | undefined;
        label?: string | undefined;
        defaultValue?: string | undefined;
        secret?: boolean | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    steps: {
        id: string;
        type: "fill" | "select" | "visit" | "click" | "check" | "waitForVisible" | "waitForURL" | "waitForApi" | "assertText" | "assertVisible";
        description?: string | undefined;
        value?: string | undefined;
        selector?: string | undefined;
        selectorAlternatives?: string[] | undefined;
        timeoutMs?: number | undefined;
        retry?: {
            attempts: number;
            intervalMs: number;
        } | undefined;
        api?: {
            urlContains: string;
            status?: number | undefined;
            method?: string | undefined;
            responseIncludes?: string | undefined;
        } | undefined;
    }[];
    description?: string | undefined;
    parameters?: {
        key: string;
        description?: string | undefined;
        required?: boolean | undefined;
        label?: string | undefined;
        defaultValue?: string | undefined;
        secret?: boolean | undefined;
    }[] | undefined;
}, {
    name: string;
    steps: {
        id: string;
        type: "fill" | "select" | "visit" | "click" | "check" | "waitForVisible" | "waitForURL" | "waitForApi" | "assertText" | "assertVisible";
        description?: string | undefined;
        value?: string | undefined;
        selector?: string | undefined;
        selectorAlternatives?: string[] | undefined;
        timeoutMs?: number | undefined;
        retry?: {
            attempts: number;
            intervalMs: number;
        } | undefined;
        api?: {
            urlContains: string;
            status?: number | undefined;
            method?: string | undefined;
            responseIncludes?: string | undefined;
        } | undefined;
    }[];
    description?: string | undefined;
    parameters?: {
        key: string;
        description?: string | undefined;
        required?: boolean | undefined;
        label?: string | undefined;
        defaultValue?: string | undefined;
        secret?: boolean | undefined;
    }[] | undefined;
}>;
export declare const updateReusableBlockSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    steps: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["visit", "click", "fill", "select", "check", "waitForVisible", "waitForURL", "waitForApi", "assertText", "assertVisible"]>;
        selector: z.ZodOptional<z.ZodString>;
        selectorAlternatives: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        value: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        timeoutMs: z.ZodOptional<z.ZodNumber>;
        retry: z.ZodOptional<z.ZodObject<{
            attempts: z.ZodNumber;
            intervalMs: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            attempts: number;
            intervalMs: number;
        }, {
            attempts: number;
            intervalMs: number;
        }>>;
        api: z.ZodOptional<z.ZodObject<{
            urlContains: z.ZodString;
            method: z.ZodOptional<z.ZodString>;
            status: z.ZodOptional<z.ZodNumber>;
            responseIncludes: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            urlContains: string;
            status?: number | undefined;
            method?: string | undefined;
            responseIncludes?: string | undefined;
        }, {
            urlContains: string;
            status?: number | undefined;
            method?: string | undefined;
            responseIncludes?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        type: "fill" | "select" | "visit" | "click" | "check" | "waitForVisible" | "waitForURL" | "waitForApi" | "assertText" | "assertVisible";
        description?: string | undefined;
        value?: string | undefined;
        selector?: string | undefined;
        selectorAlternatives?: string[] | undefined;
        timeoutMs?: number | undefined;
        retry?: {
            attempts: number;
            intervalMs: number;
        } | undefined;
        api?: {
            urlContains: string;
            status?: number | undefined;
            method?: string | undefined;
            responseIncludes?: string | undefined;
        } | undefined;
    }, {
        id: string;
        type: "fill" | "select" | "visit" | "click" | "check" | "waitForVisible" | "waitForURL" | "waitForApi" | "assertText" | "assertVisible";
        description?: string | undefined;
        value?: string | undefined;
        selector?: string | undefined;
        selectorAlternatives?: string[] | undefined;
        timeoutMs?: number | undefined;
        retry?: {
            attempts: number;
            intervalMs: number;
        } | undefined;
        api?: {
            urlContains: string;
            status?: number | undefined;
            method?: string | undefined;
            responseIncludes?: string | undefined;
        } | undefined;
    }>, "many">>;
    parameters: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        label: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        required: z.ZodOptional<z.ZodBoolean>;
        defaultValue: z.ZodOptional<z.ZodString>;
        secret: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        key: string;
        description?: string | undefined;
        required?: boolean | undefined;
        label?: string | undefined;
        defaultValue?: string | undefined;
        secret?: boolean | undefined;
    }, {
        key: string;
        description?: string | undefined;
        required?: boolean | undefined;
        label?: string | undefined;
        defaultValue?: string | undefined;
        secret?: boolean | undefined;
    }>, "many">>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
    steps?: {
        id: string;
        type: "fill" | "select" | "visit" | "click" | "check" | "waitForVisible" | "waitForURL" | "waitForApi" | "assertText" | "assertVisible";
        description?: string | undefined;
        value?: string | undefined;
        selector?: string | undefined;
        selectorAlternatives?: string[] | undefined;
        timeoutMs?: number | undefined;
        retry?: {
            attempts: number;
            intervalMs: number;
        } | undefined;
        api?: {
            urlContains: string;
            status?: number | undefined;
            method?: string | undefined;
            responseIncludes?: string | undefined;
        } | undefined;
    }[] | undefined;
    parameters?: {
        key: string;
        description?: string | undefined;
        required?: boolean | undefined;
        label?: string | undefined;
        defaultValue?: string | undefined;
        secret?: boolean | undefined;
    }[] | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
    steps?: {
        id: string;
        type: "fill" | "select" | "visit" | "click" | "check" | "waitForVisible" | "waitForURL" | "waitForApi" | "assertText" | "assertVisible";
        description?: string | undefined;
        value?: string | undefined;
        selector?: string | undefined;
        selectorAlternatives?: string[] | undefined;
        timeoutMs?: number | undefined;
        retry?: {
            attempts: number;
            intervalMs: number;
        } | undefined;
        api?: {
            urlContains: string;
            status?: number | undefined;
            method?: string | undefined;
            responseIncludes?: string | undefined;
        } | undefined;
    }[] | undefined;
    parameters?: {
        key: string;
        description?: string | undefined;
        required?: boolean | undefined;
        label?: string | undefined;
        defaultValue?: string | undefined;
        secret?: boolean | undefined;
    }[] | undefined;
}>;
//# sourceMappingURL=reusableBlock.schema.d.ts.map