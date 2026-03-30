import { z } from 'zod';
export const createDatasetSchema = z.object({
    name: z.string().min(1, 'Nome obrigatório'),
    variables: z.record(z.string()),
});
export const updateDatasetSchema = createDatasetSchema.partial();
//# sourceMappingURL=dataset.schema.js.map