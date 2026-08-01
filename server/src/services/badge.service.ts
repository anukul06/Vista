import { prisma } from '../config/prisma.js'
import { badgeRepository } from '../repositories/badge.repository.js'
import { notificationRepository } from '../repositories/notification.repository.js'
import { BADGE_CRITERIA } from '../../../shared/constants.js'

async function countsFor(userId: string) {
  const [user, eventCount, attendedCount, acceptedSubmissions] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { xp: true } }),
    prisma.registration.count({ where: { userId, status: { not: 'CANCELLED' } } }),
    prisma.registration.count({ where: { userId, status: 'ATTENDED' } }),
    prisma.submission.count({ where: { userId, status: 'ACCEPTED' } }),
  ])
  return { xp: user.xp, eventCount, attendedCount, acceptedSubmissions }
}

function metCriteria(counts: Awaited<ReturnType<typeof countsFor>>): string[] {
  const met: string[] = []
  if (counts.eventCount >= 1) met.push(BADGE_CRITERIA.FIRST_EVENT)
  if (counts.acceptedSubmissions >= 1) met.push(BADGE_CRITERIA.CODE_WARRIOR)
  if (counts.acceptedSubmissions >= 5) met.push(BADGE_CRITERIA.TOP_CONTRIBUTOR)
  if (counts.attendedCount >= 3) met.push(BADGE_CRITERIA.CREATIVE_MIND)
  if (counts.xp >= 100) met.push(BADGE_CRITERIA.XP_100)
  if (counts.xp >= 500) met.push(BADGE_CRITERIA.XP_500)
  if (counts.xp >= 1000) met.push(BADGE_CRITERIA.XP_1000)
  return met
}

// Call after anything that could unlock a badge (XP change, registration,
// attendance mark, submission acceptance). Idempotent — already-earned
// badges are skipped via the unique (userId, badgeId) constraint.
export async function checkAndAwardBadges(userId: string) {
  const [counts, alreadyEarned, allBadges] = await Promise.all([
    countsFor(userId),
    badgeRepository.earnedCriteriaFor(userId),
    badgeRepository.findAll(),
  ])

  const newlyMet = metCriteria(counts).filter((c) => !alreadyEarned.has(c))
  const newlyAwarded = []

  for (const criteria of newlyMet) {
    const badge = allBadges.find((b) => b.criteria === criteria)
    if (!badge) continue
    await badgeRepository.award(userId, badge.id)
    await notificationRepository.create(
      userId,
      'Badge unlocked!',
      `You earned the "${badge.name}" badge — ${badge.description}`,
      'BADGE',
    )
    newlyAwarded.push(badge)
  }

  return newlyAwarded
}
