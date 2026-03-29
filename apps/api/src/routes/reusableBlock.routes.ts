import { Router, type NextFunction, type Request, type Response } from 'express'
import { ReusableBlockService } from '../services/reusableBlock.service.js'
import { AuditLogService } from '../services/auditLog.service.js'
import { createReusableBlockSchema, updateReusableBlockSchema } from '../schemas/reusableBlock.schema.js'

const reusableBlockService = new ReusableBlockService()
const auditLogService = new AuditLogService()

export const reusableBlockRouter = Router()

reusableBlockRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await reusableBlockService.findAll())
  } catch (err) {
    next(err)
  }
})

reusableBlockRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await reusableBlockService.findById(req.params.id)
    if (!item) {
      res.status(404).json({ error: 'Bloco reutilizável não encontrado.' })
      return
    }
    res.json(item)
  } catch (err) {
    next(err)
  }
})

reusableBlockRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createReusableBlockSchema.parse(req.body)
    const item = await reusableBlockService.create({
      ...data,
      createdBy: req.auth!.actor,
      updatedBy: req.auth!.actor,
    })

    await auditLogService.create({
      entityType: 'reusable-block',
      entityId: item.id,
      action: 'reusable_block_created',
      summary: `Bloco reutilizável "${item.name}" foi criado.`,
      actor: req.auth!.actor,
      metadata: {
        stepCount: item.steps.length,
      },
    })

    res.status(201).json(item)
  } catch (err) {
    next(err)
  }
})

reusableBlockRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateReusableBlockSchema.parse(req.body)
    const item = await reusableBlockService.update(req.params.id, {
      ...data,
      updatedBy: req.auth!.actor,
    })

    if (!item) {
      res.status(404).json({ error: 'Bloco reutilizável não encontrado.' })
      return
    }

    await auditLogService.create({
      entityType: 'reusable-block',
      entityId: item.id,
      action: 'reusable_block_updated',
      summary: `Bloco reutilizável "${item.name}" foi atualizado.`,
      actor: req.auth!.actor,
      metadata: {
        stepCount: item.steps.length,
      },
    })

    res.json(item)
  } catch (err) {
    next(err)
  }
})

reusableBlockRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await reusableBlockService.findById(req.params.id)
    if (!existing) {
      res.status(404).json({ error: 'Bloco reutilizável não encontrado.' })
      return
    }

    await reusableBlockService.delete(req.params.id)
    await auditLogService.create({
      entityType: 'reusable-block',
      entityId: req.params.id,
      action: 'reusable_block_deleted',
      summary: `Bloco reutilizável "${existing.name}" foi removido.`,
      actor: req.auth!.actor,
    })

    res.status(204).send()
  } catch (err) {
    next(err)
  }
})
