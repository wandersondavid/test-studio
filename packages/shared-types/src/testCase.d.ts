import type { AuditActor, AuditedResource } from './audit';
import type { TestStep } from './testStep';
export interface TestCase extends AuditedResource {
    _id: string;
    suiteId: string;
    name: string;
    description?: string;
    setupCaseId?: string;
    steps: TestStep[];
    lastRecordedBy?: AuditActor;
    lastRecordedAt?: string;
    createdAt: string;
    updatedAt: string;
}
export interface CreateTestCaseInput {
    suiteId: string;
    name: string;
    description?: string;
    setupCaseId?: string;
    steps?: TestStep[];
}
//# sourceMappingURL=testCase.d.ts.map