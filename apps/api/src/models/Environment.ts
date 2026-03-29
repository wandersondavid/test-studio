import { Schema, model, Document } from 'mongoose'
import type { AuditActor } from '@test-studio/shared-types'
import { AuditActorSchema } from './shared.js'

export interface IEnvironment extends Document {
  name: string
  baseURL: string
  type: 'local' | 'dev' | 'hml' | 'prod'
  headers: Record<string, string>
  variables: Record<string, string>
  createdBy?: AuditActor
  updatedBy?: AuditActor
}

const EnvironmentSchema = new Schema<IEnvironment>({
  name: { type: String, required: true },
  baseURL: { type: String, required: true },
  type: { type: String, enum: ['local', 'dev', 'hml', 'prod'], required: true },
  headers: { type: Map, of: String, default: {} },
  variables: { type: Map, of: String, default: {} },
  createdBy: { type: AuditActorSchema },
  updatedBy: { type: AuditActorSchema },
}, { timestamps: true })

export const Environment = model<IEnvironment>('Environment', EnvironmentSchema)
