import { Router, Request, Response, NextFunction } from 'express'
import { TestCaseService } from '../services/testCase.service.js'
import { createTestCaseSchema, updateTestCaseSchema } from '../schemas/testCase.schema.js'

const service = new TestCaseService()
export const testCaseRouter = Router()

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
    res.status(201).json(await service.create(data))
  } catch (err) { next(err) }
})

testCaseRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateTestCaseSchema.parse(req.body)
    const item = await service.update(req.params.id, data)
    if (!item) { res.status(404).json({ error: 'Não encontrado' }); return }
    res.json(item)
  } catch (err) { next(err) }
})

testCaseRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.delete(req.params.id)
    res.status(204).send()
  } catch (err) { next(err) }
})
