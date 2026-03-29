import 'dotenv/config'
import express from 'express'
import { runTestCase } from './executor.js'
import {
  closeRecorderSession,
  createRecorderSession,
  getRecorderScreenshot,
  getRecorderSessionState,
  interactRecorderSession,
  navigateRecorderSession,
} from './recorder.js'
import type { Environment, TestCase, Dataset } from '@test-studio/shared-types'

const app = express()
const PORT = process.env.PORT ?? 3002

app.use(express.json())

app.post('/run', async (req, res) => {
  const { runId, testCase, environment, dataset } = req.body as {
    runId: string
    testCase: TestCase
    environment: Environment
    dataset: Dataset | null
  }

  res.status(202).json({ message: 'Execução iniciada', runId })

  // Executa de forma assíncrona após responder
  runTestCase({ runId, testCase, environment, dataset }).catch(err => {
    console.error(`Erro fatal no runner para runId ${runId}:`, err)
  })
})

app.get('/health', (_, res) => res.json({ status: 'ok' }))

app.post('/recorder/sessions', async (req, res) => {
  try {
    const { environment, startPath } = req.body as {
      environment: Environment
      startPath?: string
    }

    if (!environment?.baseURL) {
      res.status(400).json({ error: 'Ambiente inválido para iniciar o recorder.' })
      return
    }

    const session = await createRecorderSession({ environment, startPath })
    res.status(201).json(session)
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Erro ao criar sessão do recorder.' })
  }
})

app.get('/recorder/sessions/:id', async (req, res) => {
  try {
    const session = await getRecorderSessionState(req.params.id)
    res.json(session)
  } catch (error) {
    res.status(404).json({ error: error instanceof Error ? error.message : 'Sessão não encontrada.' })
  }
})

app.get('/recorder/sessions/:id/screenshot', async (req, res) => {
  try {
    const screenshot = await getRecorderScreenshot(req.params.id)
    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Cache-Control', 'no-store')
    res.send(screenshot)
  } catch (error) {
    res.status(404).json({ error: error instanceof Error ? error.message : 'Sessão não encontrada.' })
  }
})

app.post('/recorder/sessions/:id/navigate', async (req, res) => {
  try {
    const { target } = req.body as { target?: string }

    if (!target) {
      res.status(400).json({ error: 'Informe um path ou URL para navegar.' })
      return
    }

    const session = await navigateRecorderSession(req.params.id, target)
    res.json(session)
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Erro ao navegar na sessão.' })
  }
})

app.post('/recorder/sessions/:id/interact', async (req, res) => {
  try {
    const { action, x, y, value } = req.body as {
      action?: 'click' | 'fill' | 'select' | 'check' | 'assertVisible' | 'assertText'
      x?: number
      y?: number
      value?: string
    }

    if (!action || typeof x !== 'number' || typeof y !== 'number') {
      res.status(400).json({ error: 'Payload inválido para interação no recorder.' })
      return
    }

    const session = await interactRecorderSession({
      sessionId: req.params.id,
      action,
      x,
      y,
      value,
    })

    res.json(session)
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Erro ao interagir com a sessão.' })
  }
})

app.delete('/recorder/sessions/:id', async (req, res) => {
  try {
    await closeRecorderSession(req.params.id)
    res.status(204).send()
  } catch (error) {
    res.status(404).json({ error: error instanceof Error ? error.message : 'Sessão não encontrada.' })
  }
})

app.listen(PORT, () => {
  console.log(`Runner rodando em http://localhost:${PORT}`)
})
