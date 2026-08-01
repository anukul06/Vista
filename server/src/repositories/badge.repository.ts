import { prisma } from '../config/prisma.js'

export const badgeRepository = {
  findAll() {
    return prisma.badge.findMany()
  },

  findByCriteria(criteria: string) {
    return prisma.badge.findUnique({ where: { criteria } })
  },

  earnedCriteriaFor(userId: string) {
    return prisma.userBadge
      .findMany({ where: { userId }, include: { badge: true } })
      .then((rows) => new Set(rows.map((r) => r.badge.criteria).filter(Boolean) as string[]))
  },

  award(userId: string, badgeId: string) {
    return prisma.userBadge.create({ data: { userId, badgeId } })
  },
}
