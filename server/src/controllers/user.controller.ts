import type { Request, Response } from 'express'
import { prisma } from '../config/prisma.js'
import { sendSuccess } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const userController = {
  // Get currently logged-in student's rich profile details
  getProfile: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id

    const profile = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        registrations: {
          include: {
            event: true,
          },
          orderBy: { registeredAt: 'desc' },
        },
        badges: {
          include: {
            badge: true,
          },
          orderBy: { earnedAt: 'desc' },
        },
        notifications: {
          orderBy: { createdAt: 'desc' },
          take: 15,
        },
        xpAdjustments: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    sendSuccess(res, profile)
  }),
}
