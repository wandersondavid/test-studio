import { Document } from 'mongoose';
import type { StepType, StepRetryConfig, StepApiCondition, AuditActor } from '@test-studio/shared-types';
interface ITestStep {
    id: string;
    type: StepType;
    selector?: string;
    selectorAlternatives?: string[];
    value?: string;
    description?: string;
    timeoutMs?: number;
    retry?: StepRetryConfig;
    api?: StepApiCondition;
}
export interface ITestCase extends Document {
    suiteId: string;
    name: string;
    description?: string;
    setupCaseId?: string;
    steps: ITestStep[];
    createdBy?: AuditActor;
    updatedBy?: AuditActor;
    lastRecordedBy?: AuditActor;
    lastRecordedAt?: Date;
}
export declare const TestCase: any;
export {};
//# sourceMappingURL=TestCase.d.ts.map