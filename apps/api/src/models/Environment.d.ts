import { Document } from 'mongoose';
import type { AuditActor } from '@test-studio/shared-types';
export interface IEnvironment extends Document {
    name: string;
    baseURL: string;
    type: 'local' | 'dev' | 'hml' | 'prod';
    headers: Record<string, string>;
    variables: Record<string, string>;
    createdBy?: AuditActor;
    updatedBy?: AuditActor;
}
export declare const Environment: any;
//# sourceMappingURL=Environment.d.ts.map