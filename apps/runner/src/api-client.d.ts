import type { StepResult, RunStatus, ConsoleLogEntry, NetworkLogEntry } from '@test-studio/shared-types';
export declare function postResult(runId: string, result: {
    status: RunStatus;
    stepResults: StepResult[];
    consoleLogs?: ConsoleLogEntry[];
    networkLogs?: NetworkLogEntry[];
    durationMs: number;
    videoPath?: string;
    error?: string;
}): Promise<void>;
//# sourceMappingURL=api-client.d.ts.map