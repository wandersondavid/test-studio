import type { AuditActor, AuditEntityType } from '@test-studio/shared-types'
import { AuditLog, type IAuditLog } from '../models/AuditLog.js'

interface LogAuditInput {
  entityType: AuditEntityType
  entityId: string
  action: string
  summary: string
  actor: AuditActor
  metadata?: Record<string, string | number | boolean | null>
}

export class AuditLogService {
  async findByEntity(entityType: AuditEntityType, entityId: string, limit = 50): Promise<IAuditLog[]> {
    return AuditLog.find({ entityType, entityId }).sort({ createdAt: -1 }).limit(limit)
  }

  async create(input: LogAuditInput): Promise<IAuditLog> {
    return AuditLog.create(input)
  }
}
