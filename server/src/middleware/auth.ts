import type { NextFunction, Request, Response } from 'express'
import { ApiError } from '../utils/ApiError.js'
import { verifyAccessToken, type JwtRole } from '../utils/jwt.js'

function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return null
  return header.slice('Bearer '.length).trim() || null
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = extractBearerToken(req)
  if (!token) return next(ApiError.unauthorized('Missing access token'))

  try {
    const payload = verifyAccessToken(token)
    req.user = { id: payload.sub, role: payload.role }
    next()
  } catch {
    next(ApiError.unauthorized('Invalid or expired access token'))
  }
}

export function requireRole(...roles: JwtRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized())
    if (!roles.includes(req.user.role)) return next(ApiError.forbidden('Insufficient permissions'))
    next()
  }
}
