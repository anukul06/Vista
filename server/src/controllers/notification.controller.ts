import type { Request, Response } from 'express'
import { prisma } from '../config/prisma.js'
import { notificationRepository } from '../repositories/notification.repository.js'
import { ApiError } from '../utils/ApiError.js'
import { sendSuccess } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const notificationController = {
  // Inbox for the currently logged-in user (student or admin)
  list: asyncHandler(async (req: Request, res: Response) => {
    const notifications = await notificationRepository.listForUser(req.user!.id)
    const unread = await notificationRepository.unreadCount(req.user!.id)
    sendSuccess(res, { notifications, unread })
  }),

  markRead: asyncHandler(async (req: Request, res: Response) => {
    await notificationRepository.markRead(req.params.id, req.user!.id)
    sendSuccess(res, { marked: true })
  }),

  markAllRead: asyncHandler(async (req: Request, res: Response) => {
    await notificationRepository.markAllRead(req.user!.id)
    sendSuccess(res, { marked: true })
  }),

  // Admin-only: push an announcement to every student, or a specific subset.
  broadcast: asyncHandler(async (req: Request, res: Response) => {
    const { title, message, studentIds } = req.body

    if (!title || typeof title !== 'string' || !title.trim()) {
      throw ApiError.badRequest('Notification title is required')
    }
    if (!message || typeof message !== 'string' || !message.trim()) {
      throw ApiError.badRequest('Notification message is required')
    }

    let targetIds: string[]
    if (Array.isArray(studentIds) && studentIds.length > 0) {
      targetIds = studentIds
    } else {
      const students = await prisma.user.findMany({ where: { role: 'STUDENT' }, select: { id: true } })
      targetIds = students.map((s) => s.id)
    }

    await notificationRepository.createMany(targetIds, title.trim(), message.trim(), 'SYSTEM')
    sendSuccess(res, { sentTo: targetIds.length }, 201)
  }),
}
