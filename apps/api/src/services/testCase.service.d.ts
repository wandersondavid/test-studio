import type { TestCase as SharedTestCase } from '@test-studio/shared-types';
import { ITestCase } from '../models/TestCase.js';
export declare class TestCaseService {
    findAll(suiteId?: string): Promise<ITestCase[]>;
    findById(id: string): Promise<ITestCase | null>;
    findByIds(ids: string[]): Promise<ITestCase[]>;
    create(data: Partial<ITestCase>): Promise<ITestCase>;
    update(id: string, data: Partial<ITestCase>): Promise<ITestCase | null>;
    delete(id: string): Promise<{
        deletedIds: string[];
        clearedSetupRefsCount: number;
    }>;
    deleteMany(ids: string[]): Promise<{
        deletedIds: string[];
        clearedSetupRefsCount: number;
    }>;
    wouldCreateSetupCycle(caseId: string, candidateSetupId?: string): Promise<boolean>;
    resolveExecutableById(id: string): Promise<SharedTestCase | null>;
    private resolveSetupSteps;
}
//# sourceMappingURL=testCase.service.d.ts.map