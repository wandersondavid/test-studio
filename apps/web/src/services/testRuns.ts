import type { CreateTestRunInput, ExecuteSuiteRunsInput, RunStatus, TestRun } from '@test-studio/shared-types'
import { api } from './api'

export type HistoryRunFilter = 'all' | 'passed' | 'failed' | 'active'

export function isRetryableRun(run: Pick<TestRun, 'status'>): boolean {
  return run.status !== 'pending' && run.status !== 'running'
}

export function matchesHistoryRunFilter(status: RunStatus, filter: HistoryRunFilter): boolean {
  if (filter === 'all') return true
  if (filter === 'passed') return status === 'passed'
  if (filter === 'failed') return status === 'failed' || status === 'error'
  return status === 'running' || status === 'pending'
}

export async function executeTestRun(input: CreateTestRunInput): Promise<TestRun> {
  const response = await api.post<TestRun>('/test-runs/execute', input)
  return response.data
}

export async function executeSuiteRuns(input: ExecuteSuiteRunsInput): Promise<{ suiteId: string; createdRuns: TestRun[] }> {
  const response = await api.post<{ suiteId: string; createdRuns: TestRun[] }>('/test-runs/execute-suite', input)
  return response.data
}

export async function retryTestRun(run: Pick<TestRun, '_id' | 'caseId' | 'environmentId' | 'datasetId'>): Promise<TestRun> {
  return executeTestRun({
    caseId: run.caseId,
    environmentId: run.environmentId,
    datasetId: run.datasetId,
    requestedVia: 'history',
    sourceRunId: run._id,
  })
}

export async function retryManyRuns(
  runs: Array<Pick<TestRun, '_id' | 'caseId' | 'environmentId' | 'datasetId'>>
): Promise<{ created: TestRun[]; failed: string[] }> {
  const created: TestRun[] = []
  const failed: string[] = []

  for (const run of runs) {
    try {
      created.push(await retryTestRun(run))
    } catch (error: unknown) {
      failed.push(error instanceof Error ? error.message : 'Erro inesperado ao reenfileirar execução.')
    }
  }

  return { created, failed }
}
