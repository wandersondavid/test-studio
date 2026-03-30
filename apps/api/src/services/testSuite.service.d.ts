import { ITestSuite } from '../models/TestSuite.js';
export declare class TestSuiteService {
    findAll(): Promise<ITestSuite[]>;
    findById(id: string): Promise<ITestSuite | null>;
    create(data: Partial<ITestSuite>): Promise<ITestSuite>;
    update(id: string, data: Partial<ITestSuite>): Promise<ITestSuite | null>;
    delete(id: string): Promise<void>;
}
//# sourceMappingURL=testSuite.service.d.ts.map