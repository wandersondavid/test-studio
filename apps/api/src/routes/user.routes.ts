import { Router, type NextFunction, type Request, type Response } from 'express'
import { UserService } from '../services/user.service.js'
import { updateUserSchema } from '../schemas/user.schema.js'
import { AuditLogService } from '../services/auditLog.service.js'

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

export const userRouter = Router()

userRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await userService.findAll()
    res.json(users.map(sanitizeUser))
  } catch (err) {
    next(err)
  }
})

userRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateUserSchema.parse(req.body)
    const updated = await userService.update(req.params.id, data)

    if (!updated) {
      res.status(404).json({ error: 'Usuário não encontrado.' })
      return
    }

    await auditLogService.create({
      entityType: 'user',
      entityId: updated.id,
      action: 'user_updated',
      summary: `${updated.name} teve permissões ou status atualizados.`,
      actor: req.auth!.actor,
      metadata: {
        role: updated.role,
        status: updated.status,
      },
    })

    res.json(sanitizeUser(updated))
  } catch (err) {
    next(err)
  }
})
