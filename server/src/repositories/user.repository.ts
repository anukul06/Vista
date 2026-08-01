import { prisma } from '../config/prisma.js'
import type { Prisma } from '@prisma/client'

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } })
  },

  findByRollNumber(rollNumber: string) {
    return prisma.user.findUnique({ where: { rollNumber } })
  },

  findById(id: string) {
    return prisma.user.findUnique({ where: { id } })
  },

  create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data })
  },

  // Profile view used by the dashboard: user + joined domains + earned badges.
  findProfileById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        domains: { include: { domain: true } },
        badges: { include: { badge: true }, orderBy: { earnedAt: 'desc' } },
      },
    })
  },
}
