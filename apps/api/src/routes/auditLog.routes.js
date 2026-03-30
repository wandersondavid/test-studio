import { Router } from 'express';
import { AuditLogService } from '../services/auditLog.service.js';
const auditLogService = new AuditLogService();
export const auditLogRouter = Router();
auditLogRouter.get('/', async (req, res, next) => {
    try {
        const entityType = req.query.entityType;
        const entityId = req.query.entityId;
        const limit = Number(req.query.limit ?? 20);
        if (!entityType || !entityId) {
            res.status(400).json({ error: 'Informe entityType e entityId para consultar o audit trail.' });
            return;
        }
        res.json(await auditLogService.findByEntity(entityType, entityId, Number.isFinite(limit) ? limit : 20));
    }
    catch (err) {
        next(err);
    }
});
//# sourceMappingURL=auditLog.routes.js.map