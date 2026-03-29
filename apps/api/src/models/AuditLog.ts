import { Schema, model, Document } from 'mongoose'
import type { AuditActor, AuditEntityType } from '@test-studio/shared-types'
import { AuditActorSchema } from './shared.js'

export interface IAuditLog extends Document {
  entityType: AuditEntityType
  entityId: string
  action: string
  summary: string
  actor: AuditActor
  metadata?: Record<string, string | number | boolean | null>
}

const AuditLogSchema = new Schema<IAuditLog>({
  entityType: {
    type: String,
    enum: ['environment', 'suite', 'case', 'dataset', 'run', 'reusable-block', 'user', 'auth'],
    required: true,
  },
  entityId: { type: String, required: true },
  action: { type: String, required: true },
  summary: { type: String, required: true },
  actor: { type: AuditActorSchema, required: true },
  metadata: { type: Schema.Types.Mixed },
}, { timestamps: true })

AuditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 })

export const AuditLog = model<IAuditLog>('AuditLog', AuditLogSchema)
