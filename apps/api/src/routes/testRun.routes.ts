import { Router, Request, Response, NextFunction } from 'express'
import { TestRunService } from '../services/testRun.service.js'
import { TestCaseService } from '../services/testCase.service.js'
import { EnvironmentService } from '../services/environment.service.js'
import { DatasetService } from '../services/dataset.service.js'
import { executeTestRunSchema } from '../schemas/testRun.schema.js'

const runService = new TestRunService()
const caseService = new TestCaseService()
const envService = new EnvironmentService()
const datasetService = new DatasetService()

export const testRunRouter = Router()

testRunRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await runService.findAll())
  } catch (err) { next(err) }
})

testRunRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await runService.findById(req.params.id)
    if (!item) { res.status(404).json({ error: 'Não encontrado' }); return }
    res.json(item)
  } catch (err) { next(err) }
})

testRunRouter.post('/execute', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { caseId, environmentId, datasetId } = executeTestRunSchema.parse(req.body)

    const [testCase, environment] = await Promise.all([
      caseService.findById(caseId),
      envService.findById(environmentId),
    ])

    if (!testCase) { res.status(404).json({ error: 'Cenário não encontrado' }); return }
    if (!environment) { res.status(404).json({ error: 'Ambiente não encontrado' }); return }

    const dataset = datasetId ? await datasetService.findById(datasetId) : null

    const testRun = await runService.create({ caseId, environmentId, datasetId })
    await runService.updateStatus(testRun.id, 'running')

    // Dispara runner de forma assíncrona (não bloqueia a resposta)
    const runnerUrl = process.env.RUNNER_URL ?? 'http://localhost:3002'
    fetch(`${runnerUrl}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        runId: testRun.id,
        testCase,
        environment,
        dataset,
      }),
    }).catch(err => {
      console.error('Erro ao chamar runner:', err)
      runService.updateStatus(testRun.id, 'error')
    })

    res.status(202).json(testRun)
  } catch (err) { next(err) }
})

// Chamado pelo runner ao finalizar
testRunRouter.patch('/:id/result', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await runService.updateResult(req.params.id, req.body)
    if (!updated) { res.status(404).json({ error: 'Não encontrado' }); return }
    res.json(updated)
  } catch (err) { next(err) }
})
