import { Router, Request, Response, NextFunction } from 'express'
import { TestSuiteService } from '../services/testSuite.service.js'
import { AuditLogService } from '../services/auditLog.service.js'
import { createTestSuiteSchema, updateTestSuiteSchema } from '../schemas/testSuite.schema.js'

const service = new TestSuiteService()
const auditLogService = new AuditLogService()
export const testSuiteRouter = Router()

testSuiteRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await service.findAll())
  } catch (err) { next(err) }
})

testSuiteRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await service.findById(req.params.id)
    if (!item) { res.status(404).json({ error: 'Não encontrado' }); return }
    res.json(item)
  } catch (err) { next(err) }
})

testSuiteRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createTestSuiteSchema.parse(req.body)
    const item = await service.create({ ...data, createdBy: req.auth!.actor, updatedBy: req.auth!.actor })
    await auditLogService.create({
      entityType: 'suite',
      entityId: item.id,
      action: 'suite_created',
      summary: `Suíte "${item.name}" foi criada.`,
      actor: req.auth!.actor,
    })
    res.status(201).json(item)
  } catch (err) { next(err) }
})

testSuiteRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateTestSuiteSchema.parse(req.body)
    const item = await service.update(req.params.id, { ...data, updatedBy: req.auth!.actor })
    if (!item) { res.status(404).json({ error: 'Não encontrado' }); return }
    await auditLogService.create({
      entityType: 'suite',
      entityId: item.id,
      action: 'suite_updated',
      summary: `Suíte "${item.name}" foi atualizada.`,
      actor: req.auth!.actor,
    })
    res.json(item)
  } catch (err) { next(err) }
})

testSuiteRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await service.findById(req.params.id)
    await service.delete(req.params.id)
    if (existing) {
      await auditLogService.create({
        entityType: 'suite',
        entityId: req.params.id,
        action: 'suite_deleted',
        summary: `Suíte "${existing.name}" foi removida.`,
        actor: req.auth!.actor,
      })
    }
    res.status(204).send()
  } catch (err) { next(err) }
})
