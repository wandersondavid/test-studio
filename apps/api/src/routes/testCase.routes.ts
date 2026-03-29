import { Router, Request, Response, NextFunction } from 'express'
import type { TestStep } from '@test-studio/shared-types'
import { TestCaseService } from '../services/testCase.service.js'
import { AuditLogService } from '../services/auditLog.service.js'
import { createTestCaseSchema, updateTestCaseSchema } from '../schemas/testCase.schema.js'

const service = new TestCaseService()
const auditLogService = new AuditLogService()
export const testCaseRouter = Router()

function stepSignature(step: TestStep): string {
  return JSON.stringify({
    type: step.type,
    selector: step.selector,
    value: step.value,
    description: step.description,
    timeoutMs: step.timeoutMs,
    retry: step.retry,
  })
}

testCaseRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const suiteId = req.query.suiteId as string | undefined
    res.json(await service.findAll(suiteId))
  } catch (err) { next(err) }
})

testCaseRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await service.findById(req.params.id)
    if (!item) { res.status(404).json({ error: 'Não encontrado' }); return }
    res.json(item)
  } catch (err) { next(err) }
})

testCaseRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createTestCaseSchema.parse(req.body)
    const item = await service.create({
      ...data,
      createdBy: req.auth!.actor,
      updatedBy: req.auth!.actor,
      lastRecordedBy: req.auth!.actor,
      lastRecordedAt: new Date(),
    })
    await auditLogService.create({
      entityType: 'case',
      entityId: item.id,
      action: 'case_created',
      summary: `Cenário "${item.name}" foi criado.`,
      actor: req.auth!.actor,
      metadata: { stepCount: item.steps.length },
    })
    res.status(201).json(item)
  } catch (err) { next(err) }
})

testCaseRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateTestCaseSchema.parse(req.body)
    const current = await service.findById(req.params.id)
    const stepPayloadChanged = Array.isArray(data.steps)
    const item = await service.update(req.params.id, {
      ...data,
      updatedBy: req.auth!.actor,
      ...(stepPayloadChanged ? { lastRecordedBy: req.auth!.actor, lastRecordedAt: new Date() } : {}),
    })
    if (!item) { res.status(404).json({ error: 'Não encontrado' }); return }

    if (current) {
      const previousById = new Map(current.steps.map(step => [step.id, step]))
      const nextById = new Map(item.steps.map(step => [step.id, step]))

      for (const step of item.steps) {
        const previous = previousById.get(step.id)

        if (!previous) {
          await auditLogService.create({
            entityType: 'case',
            entityId: item.id,
            action: 'step_added',
            summary: `Step ${step.type} foi adicionado ao cenário "${item.name}".`,
            actor: req.auth!.actor,
            metadata: {
              stepType: step.type,
              selector: step.selector ?? null,
            },
          })
          continue
        }

        if (stepSignature(previous as TestStep) !== stepSignature(step as TestStep)) {
          await auditLogService.create({
            entityType: 'case',
            entityId: item.id,
            action: 'step_updated',
            summary: `Step ${step.type} foi atualizado no cenário "${item.name}".`,
            actor: req.auth!.actor,
            metadata: {
              stepType: step.type,
              selector: step.selector ?? null,
            },
          })
        }
      }

      for (const step of current.steps) {
        if (!nextById.has(step.id)) {
          await auditLogService.create({
            entityType: 'case',
            entityId: item.id,
            action: 'step_removed',
            summary: `Step ${step.type} foi removido do cenário "${item.name}".`,
            actor: req.auth!.actor,
            metadata: {
              stepType: step.type,
              selector: step.selector ?? null,
            },
          })
        }
      }
    }

    await auditLogService.create({
      entityType: 'case',
      entityId: item.id,
      action: 'case_updated',
      summary: `Cenário "${item.name}" foi atualizado.`,
      actor: req.auth!.actor,
      metadata: { stepCount: item.steps.length },
    })
    res.json(item)
  } catch (err) { next(err) }
})

testCaseRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await service.findById(req.params.id)
    await service.delete(req.params.id)
    if (existing) {
      await auditLogService.create({
        entityType: 'case',
        entityId: req.params.id,
        action: 'case_deleted',
        summary: `Cenário "${existing.name}" foi removido.`,
        actor: req.auth!.actor,
      })
    }
    res.status(204).send()
  } catch (err) { next(err) }
})
