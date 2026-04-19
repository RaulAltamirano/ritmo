import { prisma } from '../lib/prisma'
import { NotFoundError } from '../utils/errors'
import type { TaskSession, Prisma } from '@prisma/client'

export interface CreateSessionData {
  taskId: string
  userId: string
  startTime: Date
  endTime?: Date
  plannedMinutes?: number
  notes?: string
}

export interface SessionFilters {
  userId?: string
  taskId?: string
  startDate?: Date
  endDate?: Date
  isBreak?: boolean
}

export class ActivityService {
  async createSession(data: CreateSessionData): Promise<TaskSession> {
    return prisma.taskSession.create({ data })
  }

  async endSession(
    sessionId: string,
    userId: string,
    endTime: Date,
    productivityScore?: number,
  ): Promise<TaskSession> {
    const session = await prisma.taskSession.findFirst({
      where: { id: sessionId, userId },
    })
    if (!session) throw new NotFoundError('Session')

    const durationMinutes = session.startTime
      ? Math.round((endTime.getTime() - session.startTime.getTime()) / 60000)
      : undefined

    return prisma.taskSession.update({
      where: { id: sessionId },
      data: { endTime, durationMinutes, ...(productivityScore !== undefined && { productivityScore }) },
    })
  }

  async findMany(filters: SessionFilters = {}): Promise<TaskSession[]> {
    const where: Prisma.TaskSessionWhereInput = {}

    if (filters.userId) where.userId = filters.userId
    if (filters.taskId) where.taskId = filters.taskId
    if (filters.isBreak !== undefined) where.isBreak = filters.isBreak
    if (filters.startDate || filters.endDate) {
      where.startTime = {
        ...(filters.startDate && { gte: filters.startDate }),
        ...(filters.endDate && { lte: filters.endDate }),
      }
    }

    return prisma.taskSession.findMany({
      where,
      orderBy: { startTime: 'desc' },
    })
  }

  async getTodaySessions(userId: string): Promise<TaskSession[]> {
    const today = new Date()
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)

    return this.findMany({ userId, startDate: start, endDate: end })
  }

  async getStats(
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalSessions: number
    totalMinutes: number
    avgProductivity: number | null
  }> {
    const where: Prisma.TaskSessionWhereInput = {
      userId,
      ...(startDate || endDate
        ? { startTime: { ...(startDate && { gte: startDate }), ...(endDate && { lte: endDate }) } }
        : {}),
    }

    const [count, aggregate] = await Promise.all([
      prisma.taskSession.count({ where }),
      prisma.taskSession.aggregate({
        where,
        _sum: { durationMinutes: true },
        _avg: { productivityScore: true },
      }),
    ])

    return {
      totalSessions: count,
      totalMinutes: aggregate._sum.durationMinutes ?? 0,
      avgProductivity: aggregate._avg.productivityScore,
    }
  }
}

export const activityService = new ActivityService()
