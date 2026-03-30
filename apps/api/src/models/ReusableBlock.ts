import { Schema, model, Document } from 'mongoose'
import type { StepType, StepRetryConfig, StepApiCondition, AuditActor, ReusableBlockParameter } from '@test-studio/shared-types'
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

export interface IReusableBlock extends Document {
  name: string
  description?: string
  steps: ITestStep[]
  parameters?: ReusableBlockParameter[]
  createdBy?: AuditActor
  updatedBy?: AuditActor
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

const ReusableBlockParameterSchema = new Schema<ReusableBlockParameter>({
  key: { type: String, required: true },
  label: { type: String },
  description: { type: String },
  required: { type: Boolean, default: true },
  defaultValue: { type: String },
  secret: { type: Boolean, default: false },
}, { _id: false })

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

const ReusableBlockSchema = new Schema<IReusableBlock>({
  name: { type: String, required: true },
  description: { type: String },
  steps: { type: [StepSchema], default: [] },
  parameters: { type: [ReusableBlockParameterSchema], default: [] },
  createdBy: { type: AuditActorSchema },
  updatedBy: { type: AuditActorSchema },
}, { timestamps: true })

export const ReusableBlock = model<IReusableBlock>('ReusableBlock', ReusableBlockSchema)
