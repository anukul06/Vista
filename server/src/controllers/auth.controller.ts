import type { Request, Response } from 'express'
import { authService } from '../services/auth.service.js'
import { sendSuccess } from '../utils/ApiResponse.js'
import { setRefreshCookie, clearRefreshCookie, REFRESH_COOKIE_NAME } from '../utils/cookies.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const authController = {
  signup: asyncHandler(async (req: Request, res: Response) => {
    const { user, accessToken, refreshToken } = await authService.signup(req.body)
    setRefreshCookie(res, refreshToken)
    sendSuccess(res, { user, accessToken }, 201)
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const { user, accessToken, refreshToken } = await authService.login(req.body)
    setRefreshCookie(res, refreshToken)
    sendSuccess(res, { user, accessToken })
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies?.[REFRESH_COOKIE_NAME]
    if (!token) throw ApiError.unauthorized('Missing refresh token')

    const { user, accessToken, refreshToken } = await authService.refresh(token)
    setRefreshCookie(res, refreshToken)
    sendSuccess(res, { user, accessToken })
  }),

  logout: asyncHandler(async (_req: Request, res: Response) => {
    clearRefreshCookie(res)
    sendSuccess(res, { loggedOut: true })
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.me(req.user!.id)
    sendSuccess(res, { user })
  }),
}
