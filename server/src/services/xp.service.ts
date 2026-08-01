import { prisma } from '../config/prisma.js'
import { notificationRepository } from '../repositories/notification.repository.js'
import { checkAndAwardBadges } from './badge.service.js'
import { calculateLevel } from '../../../shared/constants.js'
import { ApiError } from '../utils/ApiError.js'

export interface ApplyXpOptions {
  reason: string
  source: string
  adminId?: string
  notify?: boolean
}

// The single write path for XP — every automatic award (join/attend/challenge)
// and every manual admin adjustment goes through here so level + audit log +
// badges never drift out of sync with each other.
export async function applyXpDelta(userId: string, amount: number, options: ApplyXpOptions) {
  if (amount === 0) throw ApiError.badRequest('XP amount cannot be zero')

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw ApiError.notFound('User not found')

  const nextXp = Math.max(0, user.xp + amount)
  const nextLevel = calculateLevel(nextXp)

  const updated = await prisma.$transaction(async (tx) => {
    const u = await tx.user.update({
      where: { id: userId },
      data: { xp: nextXp, level: nextLevel },
    })
    await tx.xpAdjustment.create({
      data: {
        userId,
        amount,
        reason: options.reason,
        source: options.source,
        adminId: options.adminId,
      },
    })
    return u
  })

  if (options.notify !== false) {
    const verb = amount > 0 ? 'gained' : 'lost'
    await notificationRepository.create(
      userId,
      `XP ${verb}`,
      `You ${verb} ${Math.abs(amount)} XP — ${options.reason}`,
      'XP',
    )
  }

  const newBadges = await checkAndAwardBadges(userId)

  return { user: updated, newBadges }
}
