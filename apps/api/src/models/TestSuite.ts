import { Schema, model, Document } from 'mongoose'

export interface ITestSuite extends Document {
  name: string
  description?: string
}

const TestSuiteSchema = new Schema<ITestSuite>({
  name: { type: String, required: true },
  description: { type: String },
}, { timestamps: true })

export const TestSuite = model<ITestSuite>('TestSuite', TestSuiteSchema)
