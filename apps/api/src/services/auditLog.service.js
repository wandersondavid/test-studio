import { AuditLog } from '../models/AuditLog.js';
export class AuditLogService {
    async findByEntity(entityType, entityId, limit = 50) {
        return AuditLog.find({ entityType, entityId }).sort({ createdAt: -1 }).limit(limit);
    }
    async create(input) {
        return AuditLog.create(input);
    }
}
//# sourceMappingURL=auditLog.service.js.map