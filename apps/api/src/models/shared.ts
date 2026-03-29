import { Schema } from 'mongoose'
import type { AuditActor } from '@test-studio/shared-types'

export const AuditActorSchema = new Schema<AuditActor>({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, enum: ['admin', 'member'], required: true },
}, { _id: false })
