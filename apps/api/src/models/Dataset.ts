import { Schema, model, Document } from 'mongoose'
import type { AuditActor } from '@test-studio/shared-types'
import { AuditActorSchema } from './shared.js'

export interface IDataset extends Document {
  name: string
  variables: Record<string, string>
  createdBy?: AuditActor
  updatedBy?: AuditActor
}

const DatasetSchema = new Schema<IDataset>({
  name: { type: String, required: true },
  variables: { type: Map, of: String, default: {} },
  createdBy: { type: AuditActorSchema },
  updatedBy: { type: AuditActorSchema },
}, { timestamps: true })

export const Dataset = model<IDataset>('Dataset', DatasetSchema)
