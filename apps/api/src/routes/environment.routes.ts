import { Router, Request, Response, NextFunction } from 'express'
import { EnvironmentService } from '../services/environment.service.js'
import { createEnvironmentSchema, updateEnvironmentSchema } from '../schemas/environment.schema.js'

const service = new EnvironmentService()
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
    res.status(201).json(await service.create(data))
  } catch (err) { next(err) }
})

environmentRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateEnvironmentSchema.parse(req.body)
    const item = await service.update(req.params.id, data)
    if (!item) { res.status(404).json({ error: 'Não encontrado' }); return }
    res.json(item)
  } catch (err) { next(err) }
})

environmentRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.delete(req.params.id)
    res.status(204).send()
  } catch (err) { next(err) }
})
