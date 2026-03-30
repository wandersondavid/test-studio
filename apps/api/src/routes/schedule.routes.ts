import { Router, Request, Response, NextFunction } from 'express'
import { ScheduleService } from '../services/schedule.service.js'
import { ScheduleModel } from '../models/Schedule.js'
import { TestRunService } from '../services/testRun.service.js'
import { TestCaseService } from '../services/testCase.service.js'
import { EnvironmentService } from '../services/environment.service.js'
import { DatasetService } from '../services/dataset.service.js'
import { createScheduleSchema, updateScheduleSchema } from '../schemas/schedule.schema.js'
import { registerTask, unregisterTask } from '../services/scheduler.service.js'
import { getRunnerSharedSecret } from '../utils/auth.js'

const scheduleService = new ScheduleService()
const runService = new TestRunService()
const caseService = new TestCaseService()
const envService = new EnvironmentService()
const datasetService = new DatasetService()

export const scheduleRouter = Router()

scheduleRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await scheduleService.find())
  } catch (err) { next(err) }
})

scheduleRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await scheduleService.findById(req.params.id)
    if (!item) { res.status(404).json({ error: 'Não encontrado' }); return }
    res.json(item)
  } catch (err) { next(err) }
})

scheduleRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createScheduleSchema.parse(req.body)
    const item = await scheduleService.create({ ...data, createdBy: req.auth!.actor })
    registerTask(item)
    res.status(201).json(item)
  } catch (err) { next(err) }
})

scheduleRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateScheduleSchema.parse(req.body)
    const item = await scheduleService.update(req.params.id, data)
    if (!item) { res.status(404).json({ error: 'Não encontrado' }); return }
    registerTask(item)
    res.json(item)
  } catch (err) { next(err) }
})

scheduleRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const removed = await scheduleService.remove(req.params.id)
    if (!removed) { res.status(404).json({ error: 'Não encontrado' }); return }
    unregisterTask(req.params.id)
    res.status(204).send()
  } catch (err) { next(err) }
})

scheduleRouter.post('/:id/trigger', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schedule = await ScheduleModel.findById(req.params.id)
    if (!schedule) { res.status(404).json({ error: 'Agendamento não encontrado' }); return }

    const [testCase, environment] = await Promise.all([
      caseService.resolveExecutableById(schedule.caseId.toString()),
      envService.findById(schedule.environmentId.toString()),
    ])

    if (!testCase) { res.status(404).json({ error: 'Cenário não encontrado' }); return }
    if (!environment) { res.status(404).json({ error: 'Ambiente não encontrado' }); return }

    const dataset = schedule.datasetId ? await datasetService.findById(schedule.datasetId.toString()) : null

    const testRun = await runService.create({
      caseId: schedule.caseId.toString(),
      environmentId: schedule.environmentId.toString(),
      datasetId: schedule.datasetId?.toString(),
      requestedBy: req.auth!.actor,
      requestedVia: 'scheduled',
    })
    await runService.updateStatus(testRun.id, 'running')
    await scheduleService.updateLastRun(schedule.id)

    const runnerUrl = process.env.RUNNER_URL ?? 'http://localhost:3002'
    fetch(`${runnerUrl}/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-runner-secret': getRunnerSharedSecret(),
      },
      body: JSON.stringify({ runId: testRun.id, testCase, environment, dataset }),
    }).catch(err => {
      console.error('[schedule/trigger] Runner trigger failed:', err)
      runService.updateStatus(testRun.id, 'error')
    })

    res.status(202).json(testRun)
  } catch (err) { next(err) }
})
