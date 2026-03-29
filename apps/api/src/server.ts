import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { connectDB } from './config/database.js'
import { errorHandler } from './middlewares/errorHandler.js'
import { recorderRouter } from './routes/recorder.routes.js'
import { environmentRouter } from './routes/environment.routes.js'
import { testSuiteRouter } from './routes/testSuite.routes.js'
import { testCaseRouter } from './routes/testCase.routes.js'
import { datasetRouter } from './routes/dataset.routes.js'
import { testRunRouter } from './routes/testRun.routes.js'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors())
app.use('/recorder', recorderRouter)
app.use(express.json())

app.use('/environments', environmentRouter)
app.use('/test-suites', testSuiteRouter)
app.use('/test-cases', testCaseRouter)
app.use('/datasets', datasetRouter)
app.use('/test-runs', testRunRouter)

app.get('/health', (_, res) => res.json({ status: 'ok' }))

app.use(errorHandler)

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`API rodando em http://localhost:${PORT}`)
  })
})
