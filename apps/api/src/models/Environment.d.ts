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
export declare const Environment: import("mongoose").Model<IEnvironment, {}, {}, {}, Document<unknown, {}, IEnvironment, {}, {}> & IEnvironment & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Environment.d.ts.map