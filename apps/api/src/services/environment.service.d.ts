import { IEnvironment } from '../models/Environment.js';
export declare class EnvironmentService {
    findAll(): Promise<IEnvironment[]>;
    findById(id: string): Promise<IEnvironment | null>;
    create(data: Partial<IEnvironment>): Promise<IEnvironment>;
    update(id: string, data: Partial<IEnvironment>): Promise<IEnvironment | null>;
    delete(id: string): Promise<void>;
}
//# sourceMappingURL=environment.service.d.ts.map