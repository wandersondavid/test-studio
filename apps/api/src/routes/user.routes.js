import { Router } from 'express';
import { UserService } from '../services/user.service.js';
import { updateUserSchema } from '../schemas/user.schema.js';
import { AuditLogService } from '../services/auditLog.service.js';
const userService = new UserService();
const auditLogService = new AuditLogService();
function sanitizeUser(user) {
    const resolvedId = typeof user.id === 'string'
        ? user.id
        : typeof user._id === 'string'
            ? user._id
            : String(user._id ?? '');
    return {
        _id: resolvedId,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        lastLoginAt: user.lastLoginAt?.toISOString(),
        createdAt: user.createdAt?.toISOString() ?? new Date().toISOString(),
        updatedAt: user.updatedAt?.toISOString() ?? new Date().toISOString(),
    };
}
export const userRouter = Router();
userRouter.get('/', async (_req, res, next) => {
    try {
        const users = await userService.findAll();
        res.json(users.map(sanitizeUser));
    }
    catch (err) {
        next(err);
    }
});
userRouter.put('/:id', async (req, res, next) => {
    try {
        const data = updateUserSchema.parse(req.body);
        const updated = await userService.update(req.params.id, data);
        if (!updated) {
            res.status(404).json({ error: 'Usuário não encontrado.' });
            return;
        }
        await auditLogService.create({
            entityType: 'user',
            entityId: updated.id,
            action: 'user_updated',
            summary: `${updated.name} teve permissões ou status atualizados.`,
            actor: req.auth.actor,
            metadata: {
                role: updated.role,
                status: updated.status,
            },
        });
        res.json(sanitizeUser(updated));
    }
    catch (err) {
        next(err);
    }
});
//# sourceMappingURL=user.routes.js.map