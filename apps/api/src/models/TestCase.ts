import { Schema, model, Document } from 'mongoose'
import type { StepType, StepRetryConfig, AuditActor } from '@test-studio/shared-types'
import { AuditActorSchema } from './shared.js'

interface ITestStep {
  id: string
  type: StepType
  selector?: string
  value?: string
  description?: string
  timeoutMs?: number
  retry?: StepRetryConfig
}

const StepRetrySchema = new Schema<StepRetryConfig>({
  attempts: { type: Number, required: true, min: 2, max: 100 },
  intervalMs: { type: Number, required: true, min: 250, max: 60 * 60 * 1000 },
}, { _id: false })

export interface ITestCase extends Document {
  suiteId: string
  name: string
  description?: string
  steps: ITestStep[]
  createdBy?: AuditActor
  updatedBy?: AuditActor
  lastRecordedBy?: AuditActor
  lastRecordedAt?: Date
}

const StepSchema = new Schema<ITestStep>({
  id: { type: String, required: true },
  type: { type: String, required: true },
  selector: { type: String },
  value: { type: String },
  description: { type: String },
  timeoutMs: { type: Number },
  retry: { type: StepRetrySchema },
}, { _id: false })

const TestCaseSchema = new Schema<ITestCase>({
  suiteId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  steps: { type: [StepSchema], default: [] },
  createdBy: { type: AuditActorSchema },
  updatedBy: { type: AuditActorSchema },
  lastRecordedBy: { type: AuditActorSchema },
  lastRecordedAt: { type: Date },
}, { timestamps: true })

export const TestCase = model<ITestCase>('TestCase', TestCaseSchema)
