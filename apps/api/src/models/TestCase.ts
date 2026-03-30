import { Schema, model, Document } from 'mongoose'
import type { StepType, StepRetryConfig, StepApiCondition, AuditActor } from '@test-studio/shared-types'
import { AuditActorSchema } from './shared.js'

interface ITestStep {
  id: string
  type: StepType
  selector?: string
  selectorAlternatives?: string[]
  value?: string
  description?: string
  timeoutMs?: number
  retry?: StepRetryConfig
  api?: StepApiCondition
}

const StepRetrySchema = new Schema<StepRetryConfig>({
  attempts: { type: Number, required: true, min: 2, max: 100 },
  intervalMs: { type: Number, required: true, min: 250, max: 60 * 60 * 1000 },
}, { _id: false })

const StepApiConditionSchema = new Schema<StepApiCondition>({
  urlContains: { type: String, required: true },
  method: { type: String },
  status: { type: Number },
  responseIncludes: { type: String },
}, { _id: false })

export interface ITestCase extends Document {
  suiteId: string
  name: string
  description?: string
  setupCaseId?: string
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
  selectorAlternatives: { type: [String], default: undefined },
  value: { type: String },
  description: { type: String },
  timeoutMs: { type: Number },
  retry: { type: StepRetrySchema },
  api: { type: StepApiConditionSchema },
}, { _id: false })

const TestCaseSchema = new Schema<ITestCase>({
  suiteId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  setupCaseId: { type: String },
  steps: { type: [StepSchema], default: [] },
  createdBy: { type: AuditActorSchema },
  updatedBy: { type: AuditActorSchema },
  lastRecordedBy: { type: AuditActorSchema },
  lastRecordedAt: { type: Date },
}, { timestamps: true })

export const TestCase = model<ITestCase>('TestCase', TestCaseSchema)
