import fs from 'fs/promises'
import path from 'path'
import { Router, Request, Response, NextFunction } from 'express'
import { TestRunService } from '../services/testRun.service.js'
import { TestCaseService } from '../services/testCase.service.js'
import { EnvironmentService } from '../services/environment.service.js'
import { DatasetService } from '../services/dataset.service.js'
import { AuditLogService } from '../services/auditLog.service.js'
import { NotificationChannelService, sendNotification } from '../services/notificationChannel.service.js'
import { executeSuiteRunsSchema, executeTestRunSchema } from '../schemas/testRun.schema.js'
import { requireAuth, requireRunnerSecret } from '../middlewares/auth.js'
import { getRunnerSharedSecret } from '../utils/auth.js'

const runService = new TestRunService()
const caseService = new TestCaseService()
const envService = new EnvironmentService()
const datasetService = new DatasetService()
const auditLogService = new AuditLogService()
const notificationChannelService = new NotificationChannelService()
const artifactsDir = path.resolve(process.env.ARTIFACTS_DIR ?? './artifacts')

export const testRunRouter = Router()

testRunRouter.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await runService.findAll())
  } catch (err) { next(err) }
})

testRunRouter.get('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await runService.findById(req.params.id)
    if (!item) { res.status(404).json({ error: 'Não encontrado' }); return }
    res.json(item)
  } catch (err) { next(err) }
})

testRunRouter.get('/:id/steps/:stepId/screenshot', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await runService.findById(req.params.id)
    if (!item) {
      res.status(404).json({ error: 'Execução não encontrada.' })
      return
    }

    const step = item.stepResults.find(stepResult => stepResult.stepId === req.params.stepId)
    if (!step?.screenshotPath) {
      res.status(404).json({ error: 'Screenshot não encontrado para este step.' })
      return
    }

    const resolvedScreenshotPath = path.resolve(step.screenshotPath)
    const insideArtifactsDir = resolvedScreenshotPath === artifactsDir
      || resolvedScreenshotPath.startsWith(`${artifactsDir}${path.sep}`)

    if (!insideArtifactsDir) {
      res.status(403).json({ error: 'Arquivo de screenshot fora da área permitida.' })
      return
    }

    await fs.access(resolvedScreenshotPath)
    res.sendFile(resolvedScreenshotPath)
  } catch (err) {
    next(err)
  }
})

testRunRouter.post('/execute', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { caseId, environmentId, datasetId, requestedVia, sourceRunId } = executeTestRunSchema.parse(req.body)

    const [testCase, environment] = await Promise.all([
      caseService.resolveExecutableById(caseId),
      envService.findById(environmentId),
    ])

    if (!testCase) { res.status(404).json({ error: 'Cenário não encontrado' }); return }
    if (!environment) { res.status(404).json({ error: 'Ambiente não encontrado' }); return }

    const dataset = datasetId ? await datasetService.findById(datasetId) : null

    const testRun = await runService.create({
      caseId,
      environmentId,
      datasetId,
      requestedBy: req.auth!.actor,
      requestedVia: requestedVia ?? 'web',
      sourceRunId,
    })
    await runService.updateStatus(testRun.id, 'running')

    // Dispara runner de forma assíncrona (não bloqueia a resposta)
    const runnerUrl = process.env.RUNNER_URL ?? 'http://localhost:3002'
    fetch(`${runnerUrl}/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-runner-secret': getRunnerSharedSecret(),
      },
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

    await auditLogService.create({
      entityType: 'run',
      entityId: testRun.id,
      action: 'run_requested',
      summary: `Execução do cenário "${testCase.name}" foi solicitada.`,
      actor: req.auth!.actor,
      metadata: {
        requestedVia: requestedVia ?? 'web',
        suiteId: testCase.suiteId,
        environmentId,
        datasetId: datasetId ?? null,
      },
    })

    res.status(202).json(testRun)
  } catch (err) { next(err) }
})

testRunRouter.post('/execute-suite', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { suiteId, environmentId, datasetId, caseIds, requestedVia } = executeSuiteRunsSchema.parse(req.body)

    const [environment, suiteCases] = await Promise.all([
      envService.findById(environmentId),
      caseService.findAll(suiteId),
    ])

    if (!environment) {
      res.status(404).json({ error: 'Ambiente não encontrado' })
      return
    }

    const dataset = datasetId ? await datasetService.findById(datasetId) : null
    const targetCases = caseIds?.length
      ? suiteCases.filter(testCase => caseIds.includes(testCase.id))
      : suiteCases

    if (targetCases.length === 0) {
      res.status(404).json({ error: 'Nenhum cenário encontrado para a suíte selecionada.' })
      return
    }

    const runnerUrl = process.env.RUNNER_URL ?? 'http://localhost:3002'
    const createdRuns = []

    for (const testCase of targetCases) {
      const executableCase = await caseService.resolveExecutableById(testCase.id)
      if (!executableCase) {
        continue
      }

      const testRun = await runService.create({
        caseId: testCase.id,
        environmentId,
        datasetId,
        requestedBy: req.auth!.actor,
        requestedVia: requestedVia ?? 'suite',
      })

      createdRuns.push(testRun)
      await runService.updateStatus(testRun.id, 'running')

      fetch(`${runnerUrl}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-runner-secret': getRunnerSharedSecret(),
        },
        body: JSON.stringify({
          runId: testRun.id,
          testCase: executableCase,
          environment,
          dataset,
        }),
      }).catch(err => {
        console.error('Erro ao chamar runner:', err)
        runService.updateStatus(testRun.id, 'error')
      })

      await auditLogService.create({
        entityType: 'run',
        entityId: testRun.id,
        action: 'suite_run_requested',
        summary: `Execução da suíte disparou o cenário "${executableCase.name}".`,
        actor: req.auth!.actor,
        metadata: {
          suiteId,
          environmentId,
          datasetId: datasetId ?? null,
        },
      })
    }

    res.status(202).json({
      suiteId,
      createdRuns,
    })
  } catch (err) {
    next(err)
  }
})

// Chamado pelo runner ao finalizar
testRunRouter.patch('/:id/result', requireRunnerSecret, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await runService.updateResult(req.params.id, req.body)
    if (!updated) { res.status(404).json({ error: 'Não encontrado' }); return }
    res.json(updated)

    const finalStatuses = ['passed', 'failed', 'error'] as const
    if (finalStatuses.includes(updated.status as typeof finalStatuses[number])) {
      const [testCase, channels] = await Promise.all([
        caseService.findById(updated.caseId),
        notificationChannelService.findActive(),
      ])
      const caseName = testCase?.name ?? updated.caseId
      sendNotification(updated, channels, caseName).catch(err => {
        console.error('[notifications] Unexpected error in sendNotification:', err)
      })
    }
  } catch (err) { next(err) }
})
