import { Document } from 'mongoose';
import type { RunStatus, StepResult, AuditActor, RunRequestedVia, ConsoleLogEntry, NetworkLogEntry } from '@test-studio/shared-types';
export interface ITestRun extends Document {
    caseId: string;
    environmentId: string;
    datasetId?: string;
    status: RunStatus;
    requestedBy?: AuditActor;
    requestedVia?: RunRequestedVia;
    sourceRunId?: string;
    stepResults: StepResult[];
    consoleLogs?: ConsoleLogEntry[];
    networkLogs?: NetworkLogEntry[];
    durationMs?: number;
    videoPath?: string;
    tracePath?: string;
    error?: string;
}
export declare const TestRun: any;
//# sourceMappingURL=TestRun.d.ts.map