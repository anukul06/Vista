import { Router } from 'express'
import { eventController } from '../controllers/event.controller.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

export const eventRouter = Router()

// Publicly readable endpoints (with optional authorization to filter by role if present)
eventRouter.get('/', (req, res, next) => {
  // If token is present, decode it so we know the role, but don't force login
  const header = req.headers.authorization
  if (header?.startsWith('Bearer ')) {
    return requireAuth(req, res, next)
  }
  next()
}, eventController.getAll)

eventRouter.get('/:id', (req, res, next) => {
  const header = req.headers.authorization
  if (header?.startsWith('Bearer ')) {
    return requireAuth(req, res, next)
  }
  next()
}, eventController.getById)

// Student only endpoints
eventRouter.post('/:id/register', requireAuth, requireRole('STUDENT'), eventController.register)
eventRouter.post('/:id/unregister', requireAuth, requireRole('STUDENT'), eventController.unregister)

// Admin only endpoints
eventRouter.post('/', requireAuth, requireRole('ADMIN'), eventController.create)
eventRouter.patch('/:id', requireAuth, requireRole('ADMIN'), eventController.update)
eventRouter.delete('/:id', requireAuth, requireRole('ADMIN'), eventController.delete)
eventRouter.patch('/:id/registrations/:regId', requireAuth, requireRole('ADMIN'), eventController.updateRegistrationStatus)
