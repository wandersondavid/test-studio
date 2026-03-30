import { z } from 'zod';
export const createNotificationChannelSchema = z.object({
    name: z.string().min(1, 'Nome obrigatório'),
    type: z.enum(['slack', 'webhook']),
    url: z.string().url('URL inválida'),
    events: z.array(z.enum(['on_pass', 'on_fail', 'always'])).min(1, 'Selecione ao menos um evento').default(['on_fail']),
    isActive: z.boolean().optional().default(true),
});
export const updateNotificationChannelSchema = createNotificationChannelSchema.partial();
//# sourceMappingURL=notificationChannel.schema.js.map