import { z } from 'zod';
export const updateUserSchema = z.object({
    name: z.string().min(1).optional(),
    role: z.enum(['admin', 'member']).optional(),
    status: z.enum(['active', 'inactive']).optional(),
});
//# sourceMappingURL=user.schema.js.map