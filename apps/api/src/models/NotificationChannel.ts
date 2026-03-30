import { Schema, model, Document } from 'mongoose'
import type { AuditActor, NotificationEvent, NotificationChannelType } from '@test-studio/shared-types'
import { AuditActorSchema } from './shared.js'

export interface INotificationChannel extends Document {
  name: string
  type: NotificationChannelType
  url: string
  events: NotificationEvent[]
  isActive: boolean
  createdBy?: AuditActor
}

const NotificationChannelSchema = new Schema<INotificationChannel>({
  name: { type: String, required: true },
  type: { type: String, enum: ['slack', 'webhook'], required: true },
  url: { type: String, required: true },
  events: {
    type: [String],
    enum: ['on_pass', 'on_fail', 'always'],
    required: true,
    default: ['on_fail'],
  },
  isActive: { type: Boolean, default: true },
  createdBy: { type: AuditActorSchema },
}, { timestamps: true })

export const NotificationChannel = model<INotificationChannel>('NotificationChannel', NotificationChannelSchema)
