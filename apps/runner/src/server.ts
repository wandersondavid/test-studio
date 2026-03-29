import 'dotenv/config'
import express from 'express'
import { runTestCase } from './executor.js'
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

app.listen(PORT, () => {
  console.log(`Runner rodando em http://localhost:${PORT}`)
})
