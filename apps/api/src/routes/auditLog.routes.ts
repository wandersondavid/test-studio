import { Router, type NextFunction, type Request, type Response } from 'express'
import type { AuditEntityType } from '@test-studio/shared-types'
import { AuditLogService } from '../services/auditLog.service.js'

const auditLogService = new AuditLogService()

export const auditLogRouter = Router()

auditLogRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entityType = req.query.entityType as AuditEntityType | undefined
    const entityId = req.query.entityId as string | undefined
    const limit = Number(req.query.limit ?? 20)

    if (!entityType || !entityId) {
      res.status(400).json({ error: 'Informe entityType e entityId para consultar o audit trail.' })
      return
    }

    res.json(await auditLogService.findByEntity(entityType, entityId, Number.isFinite(limit) ? limit : 20))
  } catch (err) {
    next(err)
  }
})
