import { Schema, model, Document } from 'mongoose'
import type {
  RunStatus,
  StepResult,
  AuditActor,
  RunRequestedVia,
  ConsoleLogEntry,
  NetworkLogEntry,
} from '@test-studio/shared-types'
import { AuditActorSchema } from './shared.js'

export interface ITestRun extends Document {
  caseId: string
  environmentId: string
  datasetId?: string
  status: RunStatus
  requestedBy?: AuditActor
  requestedVia?: RunRequestedVia
  sourceRunId?: string
  stepResults: StepResult[]
  consoleLogs?: ConsoleLogEntry[]
  networkLogs?: NetworkLogEntry[]
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

const ConsoleLogSchema = new Schema<ConsoleLogEntry>({
  id: { type: String, required: true },
  stepId: { type: String },
  type: { type: String, enum: ['log', 'info', 'warn', 'error', 'debug', 'trace'], required: true },
  text: { type: String, required: true },
  location: { type: String },
  timestamp: { type: String, required: true },
}, { _id: false })

const NetworkLogSchema = new Schema<NetworkLogEntry>({
  id: { type: String, required: true },
  stepId: { type: String },
  kind: { type: String, enum: ['request', 'response', 'failed'], required: true },
  method: { type: String },
  url: { type: String, required: true },
  resourceType: { type: String },
  status: { type: Number },
  error: { type: String },
  timestamp: { type: String, required: true },
}, { _id: false })

const TestRunSchema = new Schema<ITestRun>({
  caseId: { type: String, required: true },
  environmentId: { type: String, required: true },
  datasetId: { type: String },
  status: { type: String, enum: ['pending', 'running', 'passed', 'failed', 'error'], default: 'pending' },
  requestedBy: { type: AuditActorSchema },
  requestedVia: { type: String, enum: ['web', 'cli', 'history', 'suite', 'scheduled'] },
  sourceRunId: { type: String },
  stepResults: { type: [StepResultSchema], default: [] },
  consoleLogs: { type: [ConsoleLogSchema], default: [] },
  networkLogs: { type: [NetworkLogSchema], default: [] },
  durationMs: { type: Number },
  videoPath: { type: String },
  tracePath: { type: String },
  error: { type: String },
}, { timestamps: true })

export const TestRun = model<ITestRun>('TestRun', TestRunSchema)
