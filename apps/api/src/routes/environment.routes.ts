import { Router, Request, Response, NextFunction } from 'express'
import { EnvironmentService } from '../services/environment.service.js'
import { AuditLogService } from '../services/auditLog.service.js'
import { createEnvironmentSchema, updateEnvironmentSchema } from '../schemas/environment.schema.js'

const service = new EnvironmentService()
const auditLogService = new AuditLogService()
export const environmentRouter = Router()

environmentRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await service.findAll())
  } catch (err) { next(err) }
})

environmentRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await service.findById(req.params.id)
    if (!item) { res.status(404).json({ error: 'Não encontrado' }); return }
    res.json(item)
  } catch (err) { next(err) }
})

environmentRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createEnvironmentSchema.parse(req.body)
    const item = await service.create({ ...data, createdBy: req.auth!.actor, updatedBy: req.auth!.actor })
    await auditLogService.create({
      entityType: 'environment',
      entityId: item.id,
      action: 'environment_created',
      summary: `Ambiente "${item.name}" foi criado.`,
      actor: req.auth!.actor,
      metadata: { type: item.type },
    })
    res.status(201).json(item)
  } catch (err) { next(err) }
})

environmentRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateEnvironmentSchema.parse(req.body)
    const item = await service.update(req.params.id, { ...data, updatedBy: req.auth!.actor })
    if (!item) { res.status(404).json({ error: 'Não encontrado' }); return }
    await auditLogService.create({
      entityType: 'environment',
      entityId: item.id,
      action: 'environment_updated',
      summary: `Ambiente "${item.name}" foi atualizado.`,
      actor: req.auth!.actor,
      metadata: { type: item.type },
    })
    res.json(item)
  } catch (err) { next(err) }
})

environmentRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await service.findById(req.params.id)
    await service.delete(req.params.id)
    if (existing) {
      await auditLogService.create({
        entityType: 'environment',
        entityId: req.params.id,
        action: 'environment_deleted',
        summary: `Ambiente "${existing.name}" foi removido.`,
        actor: req.auth!.actor,
      })
    }
    res.status(204).send()
  } catch (err) { next(err) }
})
