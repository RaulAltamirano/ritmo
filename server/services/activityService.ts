import { prisma } from '../lib/prisma'

export interface CreateActivityData {
  userId: string
  title: string
  description?: string
  type: 'WORK' | 'STUDY' | 'EXERCISE' | 'CREATIVE' | 'SOCIAL' | 'REST' | 'OTHER'
  duration: number
  startTime: Date
  endTime: Date
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  tags?: string[]
}

export interface UpdateActivityData {
  title?: string
  description?: string
  type?: 'WORK' | 'STUDY' | 'EXERCISE' | 'CREATIVE' | 'SOCIAL' | 'REST' | 'OTHER'
  duration?: number
  startTime?: Date
  endTime?: Date
  isCompleted?: boolean
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  tags?: string[]
}

/**
 * Activity Service - Handles all activity-related database operations
 */
export class ActivityService {
  /**
   * Create a new activity
   */
  static async createActivity(data: CreateActivityData) {
    try {
      return await prisma.activity.create({
        data: {
          ...data,
          priority: data.priority || 'MEDIUM',
          tags: data.tags || []
        }
      })
    } catch (error) {
      console.error('Error creating activity:', error)
      throw new Error('Failed to create activity')
    }
  }

  /**
   * Get activity by ID
   */
  static async getActivityById(id: string) {
    try {
      return await prisma.activity.findUnique({
        where: { id }
      })
    } catch (error) {
      console.error('Error fetching activity:', error)
      throw new Error('Failed to fetch activity')
    }
  }

  /**
   * Get activities for a user
   */
  static async getUserActivities(userId: string, options?: {
    startDate?: Date
    endDate?: Date
    type?: string
    isCompleted?: boolean
    limit?: number
    offset?: number
  }) {
    try {
      const where: any = { userId }
      
      if (options?.startDate || options?.endDate) {
        where.startTime = {}
        if (options.startDate) where.startTime.gte = options.startDate
        if (options.endDate) where.startTime.lte = options.endDate
      }
      
      if (options?.type) where.type = options.type
      if (options?.isCompleted !== undefined) where.isCompleted = options.isCompleted

      return await prisma.activity.findMany({
        where,
        orderBy: { startTime: 'desc' },
        take: options?.limit || 50,
        skip: options?.offset || 0
      })
    } catch (error) {
      console.error('Error fetching user activities:', error)
      throw new Error('Failed to fetch user activities')
    }
  }

  /**
   * Update activity
   */
  static async updateActivity(id: string, data: UpdateActivityData) {
    try {
      return await prisma.activity.update({
        where: { id },
        data
      })
    } catch (error) {
      console.error('Error updating activity:', error)
      throw new Error('Failed to update activity')
    }
  }

  /**
   * Delete activity
   */
  static async deleteActivity(id: string) {
    try {
      await prisma.activity.delete({
        where: { id }
      })
    } catch (error) {
      console.error('Error deleting activity:', error)
      throw new Error('Failed to delete activity')
    }
  }

  /**
   * Mark activity as completed
   */
  static async markAsCompleted(id: string) {
    try {
      return await prisma.activity.update({
        where: { id },
        data: { isCompleted: true }
      })
    } catch (error) {
      console.error('Error marking activity as completed:', error)
      throw new Error('Failed to mark activity as completed')
    }
  }

  /**
   * Get activity statistics for a user
   */
  static async getUserActivityStats(userId: string, startDate?: Date, endDate?: Date) {
    try {
      const where: any = { userId }
      
      if (startDate || endDate) {
        where.startTime = {}
        if (startDate) where.startTime.gte = startDate
        if (endDate) where.startTime.lte = endDate
      }

      const [totalActivities, completedActivities, totalDuration] = await Promise.all([
        prisma.activity.count({ where }),
        prisma.activity.count({ where: { ...where, isCompleted: true } }),
        prisma.activity.aggregate({
          where,
          _sum: { duration: true }
        })
      ])

      return {
        totalActivities,
        completedActivities,
        totalDuration: totalDuration._sum.duration || 0,
        completionRate: totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0
      }
    } catch (error) {
      console.error('Error fetching activity stats:', error)
      throw new Error('Failed to fetch activity statistics')
    }
  }
} 