import type { Response } from 'express'
import { env } from '../config/env.js'

export const REFRESH_COOKIE_NAME = 'vista_refresh_token'

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

export function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'lax',
    maxAge: THIRTY_DAYS_MS,
    path: '/api/auth',
  })
}

export function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' })
}
