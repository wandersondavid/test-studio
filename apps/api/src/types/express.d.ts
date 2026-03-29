import type { IUser } from '../models/User.js'
import type { AuditActor } from '@test-studio/shared-types'

declare global {
  namespace Express {
    interface Request {
      auth?: {
        user: IUser
        actor: AuditActor
      }
    }
  }
}

export {}
