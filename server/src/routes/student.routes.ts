import { Router } from 'express'
import { studentController } from '../controllers/student.controller.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

export const studentRouter = Router()

// All student routes require ADMIN role
studentRouter.use(requireAuth, requireRole('ADMIN'))

studentRouter.get('/', studentController.getAll)
studentRouter.get('/:id', studentController.getById)
studentRouter.post('/:id/xp', studentController.adjustXp)
