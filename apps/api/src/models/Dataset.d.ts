import { Document } from 'mongoose';
import type { AuditActor } from '@test-studio/shared-types';
export interface IDataset extends Document {
    name: string;
    variables: Record<string, string>;
    createdBy?: AuditActor;
    updatedBy?: AuditActor;
}
export declare const Dataset: import("mongoose").Model<IDataset, {}, {}, {}, Document<unknown, {}, IDataset, {}, {}> & IDataset & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Dataset.d.ts.map