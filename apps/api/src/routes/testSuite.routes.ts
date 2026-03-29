import { Router, Request, Response, NextFunction } from 'express'
import { TestSuiteService } from '../services/testSuite.service.js'
import { createTestSuiteSchema, updateTestSuiteSchema } from '../schemas/testSuite.schema.js'

const service = new TestSuiteService()
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
    res.status(201).json(await service.create(data))
  } catch (err) { next(err) }
})

testSuiteRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateTestSuiteSchema.parse(req.body)
    const item = await service.update(req.params.id, data)
    if (!item) { res.status(404).json({ error: 'Não encontrado' }); return }
    res.json(item)
  } catch (err) { next(err) }
})

testSuiteRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.delete(req.params.id)
    res.status(204).send()
  } catch (err) { next(err) }
})
