import { api } from './api';
export function isRetryableRun(run) {
    return run.status !== 'pending' && run.status !== 'running';
}
export function matchesHistoryRunFilter(status, filter) {
    if (filter === 'all')
        return true;
    if (filter === 'passed')
        return status === 'passed';
    if (filter === 'failed')
        return status === 'failed' || status === 'error';
    return status === 'running' || status === 'pending';
}
export async function executeTestRun(input) {
    const response = await api.post('/test-runs/execute', input);
    return response.data;
}
export async function executeSuiteRuns(input) {
    const response = await api.post('/test-runs/execute-suite', input);
    return response.data;
}
export async function retryTestRun(run) {
    return executeTestRun({
        caseId: run.caseId,
        environmentId: run.environmentId,
        datasetId: run.datasetId,
        requestedVia: 'history',
        sourceRunId: run._id,
    });
}
export async function retryManyRuns(runs) {
    const created = [];
    const failed = [];
    for (const run of runs) {
        try {
            created.push(await retryTestRun(run));
        }
        catch (error) {
            failed.push(error instanceof Error ? error.message : 'Erro inesperado ao reenfileirar execução.');
        }
    }
    return { created, failed };
}
//# sourceMappingURL=testRuns.js.map