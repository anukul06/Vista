import { Router } from 'express'
import { notificationController } from '../controllers/notification.controller.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

export const notificationRouter = Router()

notificationRouter.use(requireAuth)

notificationRouter.get('/', notificationController.list)
notificationRouter.patch('/read-all', notificationController.markAllRead)
notificationRouter.patch('/:id/read', notificationController.markRead)
notificationRouter.post('/broadcast', requireRole('ADMIN'), notificationController.broadcast)
