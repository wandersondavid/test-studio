import { Router, type NextFunction, type Request, type Response } from 'express'
import { loginSchema, registerUserSchema } from '../schemas/auth.schema.js'
import { UserService } from '../services/user.service.js'
import { AuditLogService } from '../services/auditLog.service.js'
import { hashPassword, signAuthToken, verifyPassword } from '../utils/auth.js'
import { buildAuditActor } from '../utils/audit.js'
import { requireAdmin, requireAuth } from '../middlewares/auth.js'

const userService = new UserService()
const auditLogService = new AuditLogService()

function sanitizeUser(user: {
  id?: unknown
  _id?: unknown
  name: string
  email: string
  role: 'admin' | 'member'
  status: 'active' | 'inactive'
  lastLoginAt?: Date
  createdAt?: Date
  updatedAt?: Date
}) {
  const resolvedId = typeof user.id === 'string'
    ? user.id
    : typeof user._id === 'string'
      ? user._id
      : String(user._id ?? '')

  return {
    _id: resolvedId,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    lastLoginAt: user.lastLoginAt?.toISOString(),
    createdAt: user.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: user.updatedAt?.toISOString() ?? new Date().toISOString(),
  }
}

export const authRouter = Router()

authRouter.get('/bootstrap-state', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const count = await userService.countUsers()
    res.json({ needsSetup: count === 0 })
  } catch (err) {
    next(err)
  }
})

authRouter.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = loginSchema.parse(req.body)
    const user = await userService.findByEmail(email)

    if (!user || user.status !== 'active') {
      res.status(401).json({ error: 'Credenciais inválidas.' })
      return
    }

    const passwordValid = await verifyPassword(password, user.passwordHash)
    if (!passwordValid) {
      res.status(401).json({ error: 'Credenciais inválidas.' })
      return
    }

    user.lastLoginAt = new Date()
    await user.save()

    const safeUser = sanitizeUser(user)
    const token = signAuthToken(safeUser)

    await auditLogService.create({
      entityType: 'auth',
      entityId: safeUser._id,
      action: 'login',
      summary: `${safeUser.name} fez login no Test Studio.`,
      actor: buildAuditActor({
        _id: safeUser._id,
        name: safeUser.name,
        email: safeUser.email,
        role: safeUser.role,
      }),
    })

    res.json({ token, user: safeUser })
  } catch (err) {
    next(err)
  }
})

authRouter.get('/me', requireAuth, async (req: Request, res: Response) => {
  res.json({ user: sanitizeUser(req.auth!.user) })
})

authRouter.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = registerUserSchema.parse(req.body)
    const userCount = await userService.countUsers()

    if (userCount > 0) {
      requireAdmin(req, res, () => undefined)
      if (res.headersSent) return
    }

    const existing = await userService.findByEmail(input.email)
    if (existing) {
      res.status(409).json({ error: 'Já existe um usuário com esse email.' })
      return
    }

    const passwordHash = await hashPassword(input.password)
    const isFirstUser = userCount === 0
    const role = isFirstUser ? 'admin' : input.role
    const createdUser = await userService.create({
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash,
      role,
      status: 'active',
    })

    const safeUser = sanitizeUser(createdUser)
    const actor = req.auth?.actor ?? buildAuditActor({
      _id: safeUser._id,
      name: safeUser.name,
      email: safeUser.email,
      role: safeUser.role,
    })

    await auditLogService.create({
      entityType: 'user',
      entityId: safeUser._id,
      action: isFirstUser ? 'bootstrap_admin_created' : 'user_created',
      summary: isFirstUser
        ? `${safeUser.name} foi criado como primeiro administrador do Test Studio.`
        : `${safeUser.name} foi cadastrado no Test Studio.`,
      actor,
      metadata: {
        role: safeUser.role,
      },
    })

    const token = isFirstUser ? signAuthToken(safeUser) : undefined
    res.status(201).json(token ? { token, user: safeUser } : { user: safeUser })
  } catch (err) {
    next(err)
  }
})
