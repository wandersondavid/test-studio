import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { connectDB } from './config/database.js'
import { errorHandler } from './middlewares/errorHandler.js'
import { attachAuthenticatedUser, requireAdmin, requireAuth } from './middlewares/auth.js'
import { recorderRouter } from './routes/recorder.routes.js'
import { authRouter } from './routes/auth.routes.js'
import { userRouter } from './routes/user.routes.js'
import { environmentRouter } from './routes/environment.routes.js'
import { testSuiteRouter } from './routes/testSuite.routes.js'
import { testCaseRouter } from './routes/testCase.routes.js'
import { datasetRouter } from './routes/dataset.routes.js'
import { testRunRouter } from './routes/testRun.routes.js'
import { auditLogRouter } from './routes/auditLog.routes.js'
import { reusableBlockRouter } from './routes/reusableBlock.routes.js'
import { UserService } from './services/user.service.js'
import { hashPassword } from './utils/auth.js'

const app = express()
const PORT = process.env.PORT ?? 3001
const userService = new UserService()

app.use(cors())
app.use(attachAuthenticatedUser)
app.use('/recorder', requireAuth, recorderRouter)
app.use(express.json())

app.use('/auth', authRouter)
app.use('/users', requireAdmin, userRouter)
app.use('/environments', requireAdmin, environmentRouter)
app.use('/test-suites', requireAuth, testSuiteRouter)
app.use('/test-cases', requireAuth, testCaseRouter)
app.use('/datasets', requireAuth, datasetRouter)
app.use('/reusable-blocks', requireAuth, reusableBlockRouter)
app.use('/audit-logs', requireAuth, auditLogRouter)
app.use('/test-runs', testRunRouter)

app.get('/health', (_, res) => res.json({ status: 'ok' }))

app.use(errorHandler)

async function ensureBootstrapAdmin(): Promise<void> {
  const count = await userService.countUsers()
  if (count > 0) {
    return
  }

  const email = process.env.DEFAULT_ADMIN_EMAIL ?? 'admin@teststudio.local'
  const password = process.env.DEFAULT_ADMIN_PASSWORD ?? 'admin123456'
  const passwordHash = await hashPassword(password)

  await userService.create({
    name: 'Administrador Test Studio',
    email,
    passwordHash,
    role: 'admin',
    status: 'active',
  })

  console.log(`Admin padrão criado: ${email}`)
}

connectDB().then(async () => {
  await ensureBootstrapAdmin()
  app.listen(PORT, () => {
    console.log(`API rodando em http://localhost:${PORT}`)
  })
})
