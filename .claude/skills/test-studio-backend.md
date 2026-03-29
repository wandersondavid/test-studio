---
name: test-studio-backend
description: Skill focada em construir e evoluir o backend do Test Studio. Use para criar endpoints, models, services e lógica de negócio em /apps/api. Acione o agent backend-architect ao final para executar a implementação.
---

# Skill: test-studio-backend

Quando esta skill for acionada, você age como especialista de backend do Test Studio. Planeje e implemente tudo dentro de `/apps/api`.

## Stack obrigatória

- Node.js + TypeScript
- Express.js (rotas e middlewares)
- Mongoose (ODM para MongoDB)
- Zod (validação de entrada)
- dotenv (variáveis de ambiente)

## Padrão de implementação

### 1. Model (Mongoose)

```typescript
// /apps/api/src/models/Environment.ts
import { Schema, model, Document } from 'mongoose'

export interface IEnvironment extends Document {
  name: string
  baseURL: string
  type: 'local' | 'dev' | 'hml' | 'prod'
  headers: Record<string, string>
  variables: Record<string, string>
  createdAt: Date
  updatedAt: Date
}

const EnvironmentSchema = new Schema<IEnvironment>({
  name: { type: String, required: true },
  baseURL: { type: String, required: true },
  type: { type: String, enum: ['local', 'dev', 'hml', 'prod'], required: true },
  headers: { type: Map, of: String, default: {} },
  variables: { type: Map, of: String, default: {} },
}, { timestamps: true })

export const Environment = model<IEnvironment>('Environment', EnvironmentSchema)
```

### 2. Schema de validação (Zod)

```typescript
// /apps/api/src/schemas/environment.schema.ts
import { z } from 'zod'

export const createEnvironmentSchema = z.object({
  name: z.string().min(1),
  baseURL: z.string().url(),
  type: z.enum(['local', 'dev', 'hml', 'prod']),
  headers: z.record(z.string()).optional().default({}),
  variables: z.record(z.string()).optional().default({}),
})
```

### 3. Controller

```typescript
// /apps/api/src/controllers/environment.controller.ts
import { Request, Response, NextFunction } from 'express'
import { EnvironmentService } from '../services/environment.service'
import { createEnvironmentSchema } from '../schemas/environment.schema'

export class EnvironmentController {
  constructor(private service: EnvironmentService) {}

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await this.service.findAll()
      res.json(items)
    } catch (err) {
      next(err)
    }
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createEnvironmentSchema.parse(req.body)
      const item = await this.service.create(data)
      res.status(201).json(item)
    } catch (err) {
      next(err)
    }
  }
}
```

### 4. Service

```typescript
// /apps/api/src/services/environment.service.ts
import { Environment, IEnvironment } from '../models/Environment'

export class EnvironmentService {
  async findAll(): Promise<IEnvironment[]> {
    return Environment.find().sort({ createdAt: -1 })
  }

  async create(data: Partial<IEnvironment>): Promise<IEnvironment> {
    return Environment.create(data)
  }

  async findById(id: string): Promise<IEnvironment | null> {
    return Environment.findById(id)
  }

  async update(id: string, data: Partial<IEnvironment>): Promise<IEnvironment | null> {
    return Environment.findByIdAndUpdate(id, data, { new: true })
  }

  async delete(id: string): Promise<void> {
    await Environment.findByIdAndDelete(id)
  }
}
```

## Middleware de erro global

```typescript
// /apps/api/src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Validation error', details: err.errors })
  }
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
}
```

## Checklist ao implementar um novo endpoint

- [ ] Model Mongoose com tipos corretos
- [ ] Schema Zod para validação de entrada
- [ ] Controller com try/catch e next(err)
- [ ] Service com lógica de negócio isolada
- [ ] Rota registrada no router correto
- [ ] Tipo exportado em `/packages/shared-types`

## Delegação

Após planejar, acione o agent `backend-architect` para executar a implementação com código real e arquivos completos.
