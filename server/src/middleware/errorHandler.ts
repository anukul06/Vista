import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { ApiError } from '../utils/ApiError.js'
import { sendError } from '../utils/ApiResponse.js'
import { env } from '../config/env.js'

export function notFoundHandler(req: Request, res: Response) {
  sendError(res, 404, `Route not found: ${req.method} ${req.originalUrl}`)
}

// Express recognizes error middleware by arity (4 params) — do not remove `next`.
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    sendError(res, err.statusCode, err.message, err.details)
    return
  }

  if (err instanceof ZodError) {
    sendError(res, 400, 'Validation failed', err.flatten())
    return
  }

  if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'P2002') {
    // Prisma unique constraint violation
    const target = (err as { meta?: { target?: string[] } }).meta?.target?.join(', ') ?? 'field'
    sendError(res, 409, `A record with this ${target} already exists`)
    return
  }

  // eslint-disable-next-line no-console
  console.error(err)
  sendError(res, 500, env.isProduction ? 'Internal server error' : String((err as Error)?.message ?? err))
}
