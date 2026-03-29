import { Schema, model, Document } from 'mongoose'
import type { StepType } from '@test-studio/shared-types'

interface ITestStep {
  id: string
  type: StepType
  selector?: string
  value?: string
  description?: string
  timeoutMs?: number
}

export interface ITestCase extends Document {
  suiteId: string
  name: string
  description?: string
  steps: ITestStep[]
}

const StepSchema = new Schema<ITestStep>({
  id: { type: String, required: true },
  type: { type: String, required: true },
  selector: { type: String },
  value: { type: String },
  description: { type: String },
  timeoutMs: { type: Number },
}, { _id: false })

const TestCaseSchema = new Schema<ITestCase>({
  suiteId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  steps: { type: [StepSchema], default: [] },
}, { timestamps: true })

export const TestCase = model<ITestCase>('TestCase', TestCaseSchema)
