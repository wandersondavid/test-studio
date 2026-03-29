import { Schema, model, Document } from 'mongoose'
import type { RunStatus, StepResult } from '@test-studio/shared-types'

export interface ITestRun extends Document {
  caseId: string
  environmentId: string
  datasetId?: string
  status: RunStatus
  stepResults: StepResult[]
  durationMs?: number
  videoPath?: string
  tracePath?: string
  error?: string
}

const StepResultSchema = new Schema<StepResult>({
  stepId: { type: String, required: true },
  type: { type: String, required: true },
  status: { type: String, enum: ['passed', 'failed', 'skipped'], required: true },
  durationMs: { type: Number, required: true },
  error: { type: String },
  screenshotPath: { type: String },
}, { _id: false })

const TestRunSchema = new Schema<ITestRun>({
  caseId: { type: String, required: true },
  environmentId: { type: String, required: true },
  datasetId: { type: String },
  status: { type: String, enum: ['pending', 'running', 'passed', 'failed', 'error'], default: 'pending' },
  stepResults: { type: [StepResultSchema], default: [] },
  durationMs: { type: Number },
  videoPath: { type: String },
  tracePath: { type: String },
  error: { type: String },
}, { timestamps: true })

export const TestRun = model<ITestRun>('TestRun', TestRunSchema)
