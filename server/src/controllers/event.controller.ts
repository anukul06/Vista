import type { Request, Response } from 'express'
import { prisma } from '../config/prisma.js'
import { applyXpDelta } from '../services/xp.service.js'
import { notificationRepository } from '../repositories/notification.repository.js'
import { ApiError } from '../utils/ApiError.js'
import { sendSuccess } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { XP_RULES } from '../../../shared/constants.js'

const TYPE_LABEL: Record<string, string> = { EVENT: 'event', COURSE: 'course', WORKSHOP: 'workshop' }

// Pushes a notification to every student when an event/course/workshop goes
// live, so "admin publishes → students see it" doesn't rely on them noticing
// the landing page changed on their own.
async function notifyStudentsOfPublish(event: { id: string; title: string; type: string }) {
  const students = await prisma.user.findMany({ where: { role: 'STUDENT' }, select: { id: true } })
  await notificationRepository.createMany(
    students.map((s) => s.id),
    `New ${TYPE_LABEL[event.type] ?? 'session'} posted`,
    `"${event.title}" just went live — check it out and register.`,
    'EVENT',
  )
}

export const eventController = {
  // List events (public & students only see PUBLISHED; admins see all)
  getAll: asyncHandler(async (req: Request, res: Response) => {
    const { type, status } = req.query
    const userRole = req.user?.role

    // Build filter query
    const where: any = {}
    if (type) {
      where.type = type
    }

    if (userRole === 'ADMIN') {
      if (status) {
        where.status = status
      }
    } else {
      // Students and public only see PUBLISHED
      where.status = 'PUBLISHED'
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { date: 'asc' },
      include: {
        registrations: {
          select: {
            id: true,
            userId: true,
            status: true,
          },
        },
      },
    })
    sendSuccess(res, events)
  }),

  // Get specific event detail
  getById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const userRole = req.user?.role

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        registrations: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                rollNumber: true,
                department: true,
                year: true,
                xp: true,
                level: true,
              },
            },
          },
        },
      },
    })

    if (!event) throw ApiError.notFound('Event not found')

    // Students cannot view draft/cancelled events unless they are already registered
    if (userRole !== 'ADMIN' && event.status !== 'PUBLISHED') {
      const isRegistered = event.registrations.some((r) => r.userId === req.user?.id)
      if (!isRegistered) {
        throw ApiError.forbidden('You do not have permission to view this event')
      }
    }

    sendSuccess(res, event)
  }),

  // Create event (Admin only)
  create: asyncHandler(async (req: Request, res: Response) => {
    const { title, description, bannerUrl, date, venue, capacity, xpReward, registrationDeadline, type, status } = req.body

    if (!title || !description || !date || !venue || !capacity || !registrationDeadline || !type) {
      throw ApiError.badRequest('Missing required event fields')
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        bannerUrl: bannerUrl || null,
        date: new Date(date),
        venue,
        capacity: parseInt(capacity, 10),
        xpReward: xpReward ? parseInt(xpReward, 10) : XP_RULES.JOIN_EVENT,
        registrationDeadline: new Date(registrationDeadline),
        type,
        status: status || 'DRAFT',
      },
    })

    if (event.status === 'PUBLISHED') {
      await notifyStudentsOfPublish(event)
    }

    sendSuccess(res, event, 201)
  }),

  // Update event (Admin only)
  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const { title, description, bannerUrl, date, venue, capacity, xpReward, registrationDeadline, type, status } = req.body

    const existingEvent = await prisma.event.findUnique({ where: { id } })
    if (!existingEvent) throw ApiError.notFound('Event not found')

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (bannerUrl !== undefined) updateData.bannerUrl = bannerUrl
    if (date !== undefined) updateData.date = new Date(date)
    if (venue !== undefined) updateData.venue = venue
    if (capacity !== undefined) updateData.capacity = parseInt(capacity, 10)
    if (xpReward !== undefined) updateData.xpReward = parseInt(xpReward, 10)
    if (registrationDeadline !== undefined) updateData.registrationDeadline = new Date(registrationDeadline)
    if (type !== undefined) updateData.type = type
    if (status !== undefined) updateData.status = status

    const event = await prisma.event.update({
      where: { id },
      data: updateData,
    })

    if (existingEvent.status !== 'PUBLISHED' && event.status === 'PUBLISHED') {
      await notifyStudentsOfPublish(event)
    }

    sendSuccess(res, event)
  }),

  // Delete event (Admin only)
  delete: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const existingEvent = await prisma.event.findUnique({ where: { id } })
    if (!existingEvent) throw ApiError.notFound('Event not found')

    await prisma.event.delete({ where: { id } })
    sendSuccess(res, { deleted: true })
  }),

  // Register for event (Student only)
  register: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const userId = req.user!.id

    const event = await prisma.event.findUnique({ where: { id } })
    if (!event) throw ApiError.notFound('Event not found')

    if (event.status !== 'PUBLISHED') {
      throw ApiError.badRequest('This event is not open for registration')
    }

    if (new Date() > new Date(event.registrationDeadline)) {
      throw ApiError.badRequest('Registration deadline has passed')
    }

    // Check capacity
    const regCount = await prisma.registration.count({
      where: { eventId: id, status: { not: 'CANCELLED' } },
    })
    if (regCount >= event.capacity) {
      throw ApiError.badRequest('Event is at full capacity')
    }

    // Upsert registration (in case they previously cancelled)
    const registration = await prisma.registration.upsert({
      where: {
        userId_eventId: { userId, eventId: id },
      },
      update: {
        status: 'REGISTERED',
      },
      create: {
        userId,
        eventId: id,
        status: 'REGISTERED',
      },
    })

    // Award Event Join XP (defaults to 20 XP)
    await applyXpDelta(userId, event.xpReward, {
      reason: `Registered for ${event.title}`,
      source: 'EVENT_JOIN',
    })

    sendSuccess(res, registration)
  }),

  // Cancel registration (Student only)
  unregister: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const userId = req.user!.id

    const event = await prisma.event.findUnique({ where: { id } })
    if (!event) throw ApiError.notFound('Event not found')

    const registration = await prisma.registration.findUnique({
      where: { userId_eventId: { userId, eventId: id } },
    })

    if (!registration || registration.status === 'CANCELLED') {
      throw ApiError.badRequest('You are not registered for this event')
    }

    if (registration.status === 'ATTENDED' || registration.status === 'WINNER') {
      throw ApiError.badRequest('Cannot cancel registration after attending or winning')
    }

    const updated = await prisma.registration.update({
      where: { id: registration.id },
      data: { status: 'CANCELLED' },
    })

    // Deduct Event Join XP
    await applyXpDelta(userId, -event.xpReward, {
      reason: `Cancelled registration for ${event.title}`,
      source: 'EVENT_JOIN',
    })

    sendSuccess(res, updated)
  }),

  // Update registration status (Admin only - mark attendance, winner, or revert)
  updateRegistrationStatus: asyncHandler(async (req: Request, res: Response) => {
    const { id: eventId, regId } = req.params
    const { status } = req.body // REGISTERED, CANCELLED, ATTENDED, WINNER

    if (!status) throw ApiError.badRequest('Status is required')

    const registration = await prisma.registration.findFirst({
      where: { id: regId, eventId },
      include: { event: true },
    })

    if (!registration) throw ApiError.notFound('Registration not found for this event')

    const oldStatus = registration.status
    const newStatus = status

    if (oldStatus === newStatus) {
      return sendSuccess(res, registration)
    }

    // Update the status in DB
    const updatedRegistration = await prisma.registration.update({
      where: { id: regId },
      data: { status: newStatus },
    })

    // Reconcile XP based on status changes
    // XP changes:
    // ATTENDANCE: XP_RULES.ATTEND_EVENT (40 XP)
    // WINNER: XP_RULES.WIN_EVENT (300 XP)
    let xpDelta = 0
    const reasons: string[] = []

    // 1. Reconcile Attendance XP (40 XP)
    const oldHasAttendance = oldStatus === 'ATTENDED' || oldStatus === 'WINNER'
    const newHasAttendance = newStatus === 'ATTENDED' || newStatus === 'WINNER'

    if (!oldHasAttendance && newHasAttendance) {
      xpDelta += XP_RULES.ATTEND_EVENT
      reasons.push(`Attended ${registration.event.title}`)
    } else if (oldHasAttendance && !newHasAttendance) {
      xpDelta -= XP_RULES.ATTEND_EVENT
      reasons.push(`Attendance revoked for ${registration.event.title}`)
    }

    // 2. Reconcile Winner XP (300 XP)
    const oldHasWinner = oldStatus === 'WINNER'
    const newHasWinner = newStatus === 'WINNER'

    if (!oldHasWinner && newHasWinner) {
      xpDelta += XP_RULES.WIN_EVENT
      reasons.push(`Won ${registration.event.title}`)
    } else if (oldHasWinner && !newHasWinner) {
      xpDelta -= XP_RULES.WIN_EVENT
      reasons.push(`Winner status revoked for ${registration.event.title}`)
    }

    // 3. Reconcile Registration XP if switching to/from CANCELLED
    const oldIsCancelled = oldStatus === 'CANCELLED'
    const newIsCancelled = newStatus === 'CANCELLED'

    if (oldIsCancelled && !newIsCancelled) {
      // Student is re-registering / restored
      xpDelta += registration.event.xpReward
      reasons.push(`Registration restored for ${registration.event.title}`)
    } else if (!oldIsCancelled && newIsCancelled) {
      // Student is cancelled
      xpDelta -= registration.event.xpReward
      reasons.push(`Registration cancelled for ${registration.event.title}`)
    }

    if (xpDelta !== 0) {
      await applyXpDelta(registration.userId, xpDelta, {
        reason: reasons.join(' & '),
        source: newStatus === 'WINNER' ? 'EVENT_WINNER' : newStatus === 'ATTENDED' ? 'EVENT_ATTENDED' : 'EVENT_JOIN',
        adminId: req.user!.id,
      })
    }

    sendSuccess(res, updatedRegistration)
  }),
}
