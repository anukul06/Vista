import { Router } from 'express'
import { authController } from '../controllers/auth.controller.js'
import { validateBody } from '../middleware/validate.js'
import { signupSchema, loginSchema } from '../validation/auth.validation.js'
import { requireAuth } from '../middleware/auth.js'
import { authLimiter } from '../middleware/rateLimiter.js'

export const authRouter = Router()

authRouter.post('/signup', authLimiter, validateBody(signupSchema), authController.signup)
authRouter.post('/login', authLimiter, validateBody(loginSchema), authController.login)
authRouter.post('/refresh', authLimiter, authController.refresh)
authRouter.post('/logout', authController.logout)
authRouter.get('/me', requireAuth, authController.me)
