import { Document } from 'mongoose';
import type { AuditActor, AuditEntityType } from '@test-studio/shared-types';
export interface IAuditLog extends Document {
    entityType: AuditEntityType;
    entityId: string;
    action: string;
    summary: string;
    actor: AuditActor;
    metadata?: Record<string, string | number | boolean | null>;
}
export declare const AuditLog: any;
//# sourceMappingURL=AuditLog.d.ts.map