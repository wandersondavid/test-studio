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
export declare const User: any;
//# sourceMappingURL=User.d.ts.map