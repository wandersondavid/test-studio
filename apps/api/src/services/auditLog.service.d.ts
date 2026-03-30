import type { AuditActor, AuditEntityType } from '@test-studio/shared-types';
import { type IAuditLog } from '../models/AuditLog.js';
interface LogAuditInput {
    entityType: AuditEntityType;
    entityId: string;
    action: string;
    summary: string;
    actor: AuditActor;
    metadata?: Record<string, string | number | boolean | null>;
}
export declare class AuditLogService {
    findByEntity(entityType: AuditEntityType, entityId: string, limit?: number): Promise<IAuditLog[]>;
    create(input: LogAuditInput): Promise<IAuditLog>;
}
export {};
//# sourceMappingURL=auditLog.service.d.ts.map