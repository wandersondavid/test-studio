import type { UserRole } from './auth';
export type AuditEntityType = 'environment' | 'suite' | 'case' | 'dataset' | 'run' | 'reusable-block' | 'user' | 'auth';
export interface AuditActor {
    userId: string;
    name: string;
    email: string;
    role: UserRole;
}
export interface AuditEntry {
    _id: string;
    entityType: AuditEntityType;
    entityId: string;
    action: string;
    summary: string;
    actor: AuditActor;
    metadata?: Record<string, string | number | boolean | null>;
    createdAt: string;
    updatedAt: string;
}
export interface AuditedResource {
    createdBy?: AuditActor;
    updatedBy?: AuditActor;
}
//# sourceMappingURL=audit.d.ts.map