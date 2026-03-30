import { z } from 'zod';
export declare const createTestCaseSchema: z.ZodObject<{
    suiteId: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    setupCaseId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    steps: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
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
    }>, "many">>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    suiteId: string;
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
    setupCaseId?: string | null | undefined;
}, {
    name: string;
    suiteId: string;
    description?: string | undefined;
    setupCaseId?: string | null | undefined;
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
}>;
export declare const updateTestCaseSchema: z.ZodObject<{
    suiteId: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    setupCaseId: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    steps: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
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
    }>, "many">>>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
    suiteId?: string | undefined;
    setupCaseId?: string | null | undefined;
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
}, {
    name?: string | undefined;
    description?: string | undefined;
    suiteId?: string | undefined;
    setupCaseId?: string | null | undefined;
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
}>;
export declare const bulkDeleteTestCasesSchema: z.ZodObject<{
    ids: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    ids: string[];
}, {
    ids: string[];
}>;
//# sourceMappingURL=testCase.schema.d.ts.map