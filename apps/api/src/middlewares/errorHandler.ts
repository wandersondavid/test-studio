import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction): void {
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Dados inválidos', details: err.errors })
    return
  }
  console.error(err)
  res.status(500).json({ error: 'Erro interno do servidor' })
}
