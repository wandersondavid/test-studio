import { Document } from 'mongoose';
import type { StepType, StepRetryConfig, StepApiCondition, AuditActor, ReusableBlockParameter } from '@test-studio/shared-types';
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
export interface IReusableBlock extends Document {
    name: string;
    description?: string;
    steps: ITestStep[];
    parameters?: ReusableBlockParameter[];
    createdBy?: AuditActor;
    updatedBy?: AuditActor;
}
export declare const ReusableBlock: any;
export {};
//# sourceMappingURL=ReusableBlock.d.ts.map