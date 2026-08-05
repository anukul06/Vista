import { Router } from 'express'
import { authRouter } from './auth.routes.js'
import { eventRouter } from './event.routes.js'
import { studentRouter } from './student.routes.js'
import { userRouter } from './user.routes.js'
import { leaderboardRouter } from './leaderboard.routes.js'
import { notificationRouter } from './notification.routes.js'

export const apiRouter = Router()

apiRouter.get('/health', (_req, res) => res.json({ success: true, data: { status: 'ok' } }))
apiRouter.use('/auth', authRouter)
apiRouter.use('/events', eventRouter)
apiRouter.use('/students', studentRouter)
apiRouter.use('/users', userRouter)
apiRouter.use('/leaderboard', leaderboardRouter)
apiRouter.use('/notifications', notificationRouter)
