import type { AuditActor } from '@test-studio/shared-types';
export declare function buildAuditActor(user: {
    id?: string;
    _id?: string;
    name: string;
    email: string;
    role: 'admin' | 'member';
}): AuditActor;
export declare function stringifyMetadataValue(value: unknown): string | number | boolean | null;
//# sourceMappingURL=audit.d.ts.map