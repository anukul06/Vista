import type { Request, Response } from 'express'
import { prisma } from '../config/prisma.js'
import { sendSuccess } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const leaderboardController = {
  getLeaderboard: asyncHandler(async (_req: Request, res: Response) => {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        name: true,
        email: true,
        xp: true,
        level: true,
        githubUsername: true,
        avatarUrl: true,
      },
      orderBy: { xp: 'desc' },
      take: 50, // Top 50 students
    })

    // Assign rank sequentially
    const leaderboard = students.map((student, index) => ({
      rank: index + 1,
      ...student,
    }))

    sendSuccess(res, leaderboard)
  }),
}
