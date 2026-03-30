import { type IReusableBlock } from '../models/ReusableBlock.js';
export declare class ReusableBlockService {
    findAll(): Promise<IReusableBlock[]>;
    findById(id: string): Promise<IReusableBlock | null>;
    create(data: Partial<IReusableBlock>): Promise<IReusableBlock>;
    update(id: string, data: Partial<IReusableBlock>): Promise<IReusableBlock | null>;
    delete(id: string): Promise<void>;
}
//# sourceMappingURL=reusableBlock.service.d.ts.map