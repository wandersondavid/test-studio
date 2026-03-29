import type { StepType } from './testStep'

export type RunStatus = 'pending' | 'running' | 'passed' | 'failed' | 'error'

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
}
