import { IDataset } from '../models/Dataset.js';
export declare class DatasetService {
    findAll(): Promise<IDataset[]>;
    findById(id: string): Promise<IDataset | null>;
    create(data: Partial<IDataset>): Promise<IDataset>;
    update(id: string, data: Partial<IDataset>): Promise<IDataset | null>;
    delete(id: string): Promise<void>;
}
//# sourceMappingURL=dataset.service.d.ts.map