import { Schema, model, Document, Types } from 'mongoose'
import type { AuditActor } from '@test-studio/shared-types'
import { AuditActorSchema } from './shared.js'

export interface ISchedule extends Document {
  name: string
  cron: string
  caseId: Types.ObjectId
  environmentId: Types.ObjectId
  datasetId?: Types.ObjectId
  isActive: boolean
  lastRunAt?: Date
  nextRunAt?: Date
  createdBy?: AuditActor
}

const ScheduleSchema = new Schema<ISchedule>({
  name: { type: String, required: true },
  cron: { type: String, required: true },
  caseId: { type: Schema.Types.ObjectId, ref: 'TestCase', required: true },
  environmentId: { type: Schema.Types.ObjectId, ref: 'Environment', required: true },
  datasetId: { type: Schema.Types.ObjectId, ref: 'Dataset' },
  isActive: { type: Boolean, default: true },
  lastRunAt: { type: Date },
  nextRunAt: { type: Date },
  createdBy: { type: AuditActorSchema },
}, { timestamps: true })

export const ScheduleModel = model<ISchedule>('Schedule', ScheduleSchema)
