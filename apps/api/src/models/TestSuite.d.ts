import { Document } from 'mongoose';
import type { AuditActor } from '@test-studio/shared-types';
export interface ITestSuite extends Document {
    name: string;
    description?: string;
    createdBy?: AuditActor;
    updatedBy?: AuditActor;
}
export declare const TestSuite: import("mongoose").Model<ITestSuite, {}, {}, {}, Document<unknown, {}, ITestSuite, {}, {}> & ITestSuite & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=TestSuite.d.ts.map