import { Router, Request, Response, NextFunction } from 'express'
import { DatasetService } from '../services/dataset.service.js'
import { createDatasetSchema, updateDatasetSchema } from '../schemas/dataset.schema.js'

const service = new DatasetService()
export const datasetRouter = Router()

datasetRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await service.findAll())
  } catch (err) { next(err) }
})

datasetRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await service.findById(req.params.id)
    if (!item) { res.status(404).json({ error: 'Não encontrado' }); return }
    res.json(item)
  } catch (err) { next(err) }
})

datasetRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createDatasetSchema.parse(req.body)
    res.status(201).json(await service.create(data))
  } catch (err) { next(err) }
})

datasetRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateDatasetSchema.parse(req.body)
    const item = await service.update(req.params.id, data)
    if (!item) { res.status(404).json({ error: 'Não encontrado' }); return }
    res.json(item)
  } catch (err) { next(err) }
})

datasetRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.delete(req.params.id)
    res.status(204).send()
  } catch (err) { next(err) }
})
