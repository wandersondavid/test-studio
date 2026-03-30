import { Document } from 'mongoose';
import type { AuditActor } from '@test-studio/shared-types';
export interface ITestSuite extends Document {
    name: string;
    description?: string;
    createdBy?: AuditActor;
    updatedBy?: AuditActor;
}
export declare const TestSuite: any;
//# sourceMappingURL=TestSuite.d.ts.map