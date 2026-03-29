import type { AuditActor } from './audit'
import type { StepType } from './testStep'

export type RunStatus = 'pending' | 'running' | 'passed' | 'failed' | 'error'
export type RunRequestedVia = 'web' | 'cli' | 'history' | 'suite'

export interface StepResult {
  stepId: string
  type: StepType
  status: 'passed' | 'failed' | 'skipped'
  durationMs: number
  error?: string
  screenshotPath?: string
}

export interface TestRun {
  _id: string
  caseId: string
  environmentId: string
  datasetId?: string
  status: RunStatus
  requestedBy?: AuditActor
  requestedVia?: RunRequestedVia
  sourceRunId?: string
  stepResults: StepResult[]
  durationMs?: number
  videoPath?: string
  tracePath?: string
  error?: string
  createdAt: string
  updatedAt: string
}

export interface CreateTestRunInput {
  caseId: string
  environmentId: string
  datasetId?: string
  requestedVia?: RunRequestedVia
  sourceRunId?: string
}

export interface ExecuteSuiteRunsInput {
  suiteId: string
  environmentId: string
  datasetId?: string
  caseIds?: string[]
  requestedVia?: RunRequestedVia
}
