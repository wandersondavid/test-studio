import { Schema, model, Document } from 'mongoose'
import type { AuditActor } from '@test-studio/shared-types'
import { AuditActorSchema } from './shared.js'

export interface ITestSuite extends Document {
  name: string
  description?: string
  createdBy?: AuditActor
  updatedBy?: AuditActor
}

const TestSuiteSchema = new Schema<ITestSuite>({
  name: { type: String, required: true },
  description: { type: String },
  createdBy: { type: AuditActorSchema },
  updatedBy: { type: AuditActorSchema },
}, { timestamps: true })

export const TestSuite = model<ITestSuite>('TestSuite', TestSuiteSchema)
