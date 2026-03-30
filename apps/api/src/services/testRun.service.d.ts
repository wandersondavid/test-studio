import { ITestRun } from '../models/TestRun.js';
import type { AuditActor, RunRequestedVia, StepResult, ConsoleLogEntry, NetworkLogEntry } from '@test-studio/shared-types';
export declare class TestRunService {
    findAll(): Promise<ITestRun[]>;
    findById(id: string): Promise<ITestRun | null>;
    create(data: {
        caseId: string;
        environmentId: string;
        datasetId?: string;
        requestedBy?: AuditActor;
        requestedVia?: RunRequestedVia;
        sourceRunId?: string;
    }): Promise<ITestRun>;
    updateResult(id: string, result: {
        status: ITestRun['status'];
        stepResults: StepResult[];
        consoleLogs?: ConsoleLogEntry[];
        networkLogs?: NetworkLogEntry[];
        durationMs: number;
        videoPath?: string;
        tracePath?: string;
        error?: string;
    }): Promise<ITestRun | null>;
    updateStatus(id: string, status: ITestRun['status']): Promise<void>;
}
//# sourceMappingURL=testRun.service.d.ts.map