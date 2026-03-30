import { z } from 'zod';
export const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'Senha obrigatória'),
});
export const registerUserSchema = z.object({
    name: z.string().min(1, 'Nome obrigatório'),
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
    role: z.enum(['admin', 'member']).optional().default('member'),
});
//# sourceMappingURL=auth.schema.js.map