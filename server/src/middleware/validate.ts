import type { NextFunction, Request, Response } from 'express'
import type { ZodSchema } from 'zod'

// Validates req.body against a zod schema and replaces it with the parsed
// (and coerced/transformed) result so downstream code can trust its shape.
export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    req.body = schema.parse(req.body)
    next()
  }
}
