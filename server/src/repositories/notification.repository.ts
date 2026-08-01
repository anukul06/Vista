import { prisma } from '../config/prisma.js'
import type { NotificationType } from '@prisma/client'

export const notificationRepository = {
  create(userId: string, title: string, message: string, type: NotificationType = 'SYSTEM') {
    return prisma.notification.create({ data: { userId, title, message, type } })
  },

  createMany(userIds: string[], title: string, message: string, type: NotificationType = 'SYSTEM') {
    if (userIds.length === 0) return Promise.resolve({ count: 0 })
    return prisma.notification.createMany({
      data: userIds.map((userId) => ({ userId, title, message, type })),
    })
  },

  listForUser(userId: string, limit = 30) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  },

  markRead(id: string, userId: string) {
    return prisma.notification.updateMany({ where: { id, userId }, data: { read: true } })
  },

  markAllRead(userId: string) {
    return prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } })
  },

  unreadCount(userId: string) {
    return prisma.notification.count({ where: { userId, read: false } })
  },
}
