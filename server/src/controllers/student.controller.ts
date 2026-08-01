import type { Request, Response } from 'express'
import { prisma } from '../config/prisma.js'
import { applyXpDelta } from '../services/xp.service.js'
import { ApiError } from '../utils/ApiError.js'
import { sendSuccess } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const studentController = {
  // List all students
  getAll: asyncHandler(async (_req: Request, res: Response) => {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        name: true,
        email: true,
        rollNumber: true,
        department: true,
        year: true,
        xp: true,
        level: true,
        githubUsername: true,
        avatarUrl: true,
        createdAt: true,
      },
      orderBy: { xp: 'desc' },
    })
    sendSuccess(res, students)
  }),

  // Get detailed profile of a student (for admin)
  getById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const student = await prisma.user.findFirst({
      where: { id, role: 'STUDENT' },
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
        xpAdjustments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!student) {
      throw ApiError.notFound('Student not found')
    }

    sendSuccess(res, student)
  }),

  // Adjust XP for a student (add/subtract)
  adjustXp: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const { amount, reason } = req.body

    if (!amount || typeof amount !== 'number' || amount === 0) {
      throw ApiError.badRequest('XP amount must be a non-zero number')
    }
    if (!reason || typeof reason !== 'string' || reason.trim() === '') {
      throw ApiError.badRequest('XP adjustment requires a valid reason')
    }

    const result = await applyXpDelta(id, amount, {
      reason: reason.trim(),
      source: 'ADMIN_MANUAL',
      adminId: req.user!.id,
      notify: true,
    })

    sendSuccess(res, result)
  }),
}
