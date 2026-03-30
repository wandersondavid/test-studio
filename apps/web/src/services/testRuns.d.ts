import type { CreateTestRunInput, ExecuteSuiteRunsInput, RunStatus, TestRun } from '@test-studio/shared-types';
export type HistoryRunFilter = 'all' | 'passed' | 'failed' | 'active';
export declare function isRetryableRun(run: Pick<TestRun, 'status'>): boolean;
export declare function matchesHistoryRunFilter(status: RunStatus, filter: HistoryRunFilter): boolean;
export declare function executeTestRun(input: CreateTestRunInput): Promise<TestRun>;
export declare function executeSuiteRuns(input: ExecuteSuiteRunsInput): Promise<{
    suiteId: string;
    createdRuns: TestRun[];
}>;
export declare function retryTestRun(run: Pick<TestRun, '_id' | 'caseId' | 'environmentId' | 'datasetId'>): Promise<TestRun>;
export declare function retryManyRuns(runs: Array<Pick<TestRun, '_id' | 'caseId' | 'environmentId' | 'datasetId'>>): Promise<{
    created: TestRun[];
    failed: string[];
}>;
//# sourceMappingURL=testRuns.d.ts.map