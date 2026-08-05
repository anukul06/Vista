import type { Request, Response } from 'express'
import { prisma } from '../config/prisma.js'
import { applyXpDelta } from '../services/xp.service.js'
import { notificationRepository } from '../repositories/notification.repository.js'
import { ApiError } from '../utils/ApiError.js'
import { sendSuccess } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const YEAR_VALUES = new Set(['FIRST', 'SECOND', 'THIRD', 'FOURTH'])

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

  // Commit edits to a student's profile fields (admin-only)
  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const { name, email, rollNumber, department, year, githubUsername } = req.body

    const existing = await prisma.user.findFirst({ where: { id, role: 'STUDENT' } })
    if (!existing) throw ApiError.notFound('Student not found')

    if (year !== undefined && !YEAR_VALUES.has(year)) {
      throw ApiError.badRequest('Invalid year value')
    }

    if (email !== undefined && email !== existing.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email } })
      if (emailTaken) throw ApiError.conflict('Another account already uses this email')
    }
    if (rollNumber !== undefined && rollNumber !== existing.rollNumber) {
      const rollTaken = await prisma.user.findUnique({ where: { rollNumber } })
      if (rollTaken) throw ApiError.conflict('Another account already uses this roll number')
    }

    const data: Record<string, unknown> = {}
    if (name !== undefined) data.name = String(name).trim()
    if (email !== undefined) data.email = String(email).trim().toLowerCase()
    if (rollNumber !== undefined) data.rollNumber = String(rollNumber).trim()
    if (department !== undefined) data.department = String(department).trim()
    if (year !== undefined) data.year = year
    if (githubUsername !== undefined) data.githubUsername = githubUsername ? String(githubUsername).trim() : null

    const updated = await prisma.user.update({ where: { id }, data })

    await notificationRepository.create(
      id,
      'Profile updated',
      'An admin updated your profile details. Contact the club if this looks wrong.',
      'SYSTEM',
    )

    sendSuccess(res, updated)
  }),

  // Permanently remove a student account (admin-only). Cascades to their
  // registrations, submissions, badges, notifications and XP history.
  remove: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const existing = await prisma.user.findFirst({ where: { id, role: 'STUDENT' } })
    if (!existing) throw ApiError.notFound('Student not found')

    await prisma.user.delete({ where: { id } })
    sendSuccess(res, { deleted: true })
  }),
}
