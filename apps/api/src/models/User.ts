import { Schema, model, Document } from 'mongoose'
import type { UserRole, UserStatus } from '@test-studio/shared-types'

export interface IUser extends Document {
  name: string
  email: string
  passwordHash: string
  role: UserRole
  status: UserStatus
  lastLoginAt?: Date
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'member'], default: 'member' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  lastLoginAt: { type: Date },
}, { timestamps: true })

export const User = model<IUser>('User', UserSchema)
