import { type IUser } from '../models/User.js';
export declare class UserService {
    countUsers(): Promise<number>;
    findAll(): Promise<IUser[]>;
    findById(id: string): Promise<IUser | null>;
    findByEmail(email: string): Promise<IUser | null>;
    create(data: Partial<IUser>): Promise<IUser>;
    update(id: string, data: Partial<IUser>): Promise<IUser | null>;
}
//# sourceMappingURL=user.service.d.ts.map