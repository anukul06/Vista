import { Router } from 'express'
import { leaderboardController } from '../controllers/leaderboard.controller.js'

export const leaderboardRouter = Router()

// Publicly readable endpoint
leaderboardRouter.get('/', leaderboardController.getLeaderboard)
