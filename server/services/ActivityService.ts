import { PrismaClient } from '@prisma/client'
import type { Activity, ActivityType, Priority } from '@prisma/client'

export interface CreateActivityData {
  userId: string
  title: string
  description?: string
  type: ActivityType
  duration: number
  startTime: Date
  endTime: Date
  priority?: Priority
  tags?: string[]
}

export interface UpdateActivityData {
  title?: string
  description?: string
  type?: ActivityType
  duration?: number
  startTime?: Date
  endTime?: Date
  isCompleted?: boolean
  priority?: Priority
  tags?: string[]
}

export interface ActivityFilters {
  userId?: string
  type?: ActivityType
  priority?: Priority
  isCompleted?: boolean
  startDate?: Date
  endDate?: Date
  tags?: string[]
}

export class ActivityService {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  /**
   * Create a new activity
   */
  async create(data: CreateActivityData): Promise<Activity> {
    try {
      const activity = await this.prisma.activity.create({
        data: {
          userId: data.userId,
          title: data.title,
          description: data.description,
          type: data.type,
          duration: data.duration,
          startTime: data.startTime,
          endTime: data.endTime,
          priority: data.priority || 'MEDIUM',
          tags: data.tags || []
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      return activity
    } catch (error) {
      console.error('Error creating activity:', error)
      throw new Error('Failed to create activity')
    }
  }

  /**
   * Get activity by ID
   */
  async findById(id: string): Promise<Activity | null> {
    try {
      return await this.prisma.activity.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })
    } catch (error) {
      console.error('Error finding activity:', error)
      throw new Error('Failed to find activity')
    }
  }

  /**
   * Get activities with filters
   */
  async findMany(filters: ActivityFilters = {}): Promise<Activity[]> {
    try {
      const where: any = {}

      if (filters.userId) where.userId = filters.userId
      if (filters.type) where.type = filters.type
      if (filters.priority) where.priority = filters.priority
      if (filters.isCompleted !== undefined) where.isCompleted = filters.isCompleted
      if (filters.startDate) where.startTime = { gte: filters.startDate }
      if (filters.endDate) where.endTime = { lte: filters.endDate }
      if (filters.tags && filters.tags.length > 0) {
        where.tags = { hasSome: filters.tags }
      }

      return await this.prisma.activity.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { startTime: 'asc' }
        ]
      })
    } catch (error) {
      console.error('Error finding activities:', error)
      throw new Error('Failed to find activities')
    }
  }

  /**
   * Get today's activities for a user
   */
  async getTodayActivities(userId: string): Promise<Activity[]> {
    try {
      const today = new Date()
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)

      return await this.prisma.activity.findMany({
        where: {
          userId,
          startTime: {
            gte: startOfDay,
            lte: endOfDay
          }
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { startTime: 'asc' }
        ]
      })
    } catch (error) {
      console.error('Error getting today activities:', error)
      throw new Error('Failed to get today activities')
    }
  }

  /**
   * Update activity
   */
  async update(id: string, data: UpdateActivityData): Promise<Activity> {
    try {
      return await this.prisma.activity.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date()
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })
    } catch (error) {
      console.error('Error updating activity:', error)
      throw new Error('Failed to update activity')
    }
  }

  /**
   * Mark activity as completed
   */
  async markAsCompleted(id: string): Promise<Activity> {
    try {
      return await this.prisma.activity.update({
        where: { id },
        data: {
          isCompleted: true,
          updatedAt: new Date()
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })
    } catch (error) {
      console.error('Error marking activity as completed:', error)
      throw new Error('Failed to mark activity as completed')
    }
  }

  /**
   * Delete activity
   */
  async delete(id: string): Promise<void> {
    try {
      await this.prisma.activity.delete({
        where: { id }
      })
    } catch (error) {
      console.error('Error deleting activity:', error)
      throw new Error('Failed to delete activity')
    }
  }

  /**
   * Get activity statistics for a user
   */
  async getStats(userId: string, startDate?: Date, endDate?: Date) {
    try {
      const where: any = { userId }
      
      if (startDate && endDate) {
        where.startTime = {
          gte: startDate,
          lte: endDate
        }
      }

      const [total, completed, pending] = await Promise.all([
        this.prisma.activity.count({ where }),
        this.prisma.activity.count({ where: { ...where, isCompleted: true } }),
        this.prisma.activity.count({ where: { ...where, isCompleted: false } })
      ])

      const byType = await this.prisma.activity.groupBy({
        by: ['type'],
        where,
        _count: {
          type: true
        }
      })

      const byPriority = await this.prisma.activity.groupBy({
        by: ['priority'],
        where,
        _count: {
          priority: true
        }
      })

      return {
        total,
        completed,
        pending,
        completionRate: total > 0 ? (completed / total) * 100 : 0,
        byType: byType.reduce((acc: Record<string, number>, item: any) => {
          acc[item.type] = item._count.type
          return acc
        }, {} as Record<string, number>),
        byPriority: byPriority.reduce((acc: Record<string, number>, item: any) => {
          acc[item.priority] = item._count.priority
          return acc
        }, {} as Record<string, number>)
      }
    } catch (error) {
      console.error('Error getting activity stats:', error)
      throw new Error('Failed to get activity statistics')
    }
  }
} 