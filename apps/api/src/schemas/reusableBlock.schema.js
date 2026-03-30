import { z } from 'zod';
const stepRetrySchema = z.object({
    attempts: z.number().int().min(2).max(100),
    intervalMs: z.number().int().min(250).max(60 * 60 * 1000),
});
const stepApiConditionSchema = z.object({
    urlContains: z.string().min(1, 'Informe um trecho da URL da chamada.'),
    method: z.string().optional(),
    status: z.number().int().min(100).max(599).optional(),
    responseIncludes: z.string().optional(),
});
const reusableBlockParameterSchema = z.object({
    key: z.string().min(1, 'Identificador obrigatório'),
    label: z.string().optional(),
    description: z.string().optional(),
    required: z.boolean().optional(),
    defaultValue: z.string().optional(),
    secret: z.boolean().optional(),
});
const stepSchema = z.object({
    id: z.string(),
    type: z.enum(['visit', 'click', 'fill', 'select', 'check', 'waitForVisible', 'waitForURL', 'waitForApi', 'assertText', 'assertVisible']),
    selector: z.string().optional(),
    selectorAlternatives: z.array(z.string()).optional(),
    value: z.string().optional(),
    description: z.string().optional(),
    timeoutMs: z.number().optional(),
    retry: stepRetrySchema.optional(),
    api: stepApiConditionSchema.optional(),
});
export const createReusableBlockSchema = z.object({
    name: z.string().min(1, 'Nome obrigatório'),
    description: z.string().optional(),
    steps: z.array(stepSchema).min(1, 'Adicione pelo menos um step no bloco'),
    parameters: z.array(reusableBlockParameterSchema).optional(),
});
export const updateReusableBlockSchema = createReusableBlockSchema.partial();
//# sourceMappingURL=reusableBlock.schema.js.map