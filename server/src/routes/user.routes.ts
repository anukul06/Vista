import { Router } from 'express'
import { userController } from '../controllers/user.controller.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

export const userRouter = Router()

userRouter.get('/profile', requireAuth, requireRole('STUDENT'), userController.getProfile)
