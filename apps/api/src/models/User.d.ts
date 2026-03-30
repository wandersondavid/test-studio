import { Document } from 'mongoose';
import type { UserRole, UserStatus } from '@test-studio/shared-types';
export interface IUser extends Document {
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    status: UserStatus;
    lastLoginAt?: Date;
}
export declare const User: import("mongoose").Model<IUser, {}, {}, {}, Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=User.d.ts.map