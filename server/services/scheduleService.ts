import { prisma } from '../lib/prisma'

export interface CreateScheduleData {
  userId: string
  name: string
  description?: string
  isActive?: boolean
}

export interface UpdateScheduleData {
  name?: string
  description?: string
  isActive?: boolean
}

export interface CreateScheduleBlockData {
  scheduleId: string
  dayOfWeek: number // 0-6 (Sunday-Saturday)
  startTime: string // HH:MM format
  endTime: string // HH:MM format
  activityType?: 'WORK' | 'STUDY' | 'EXERCISE' | 'CREATIVE' | 'SOCIAL' | 'REST' | 'OTHER'
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
}

export interface UpdateScheduleBlockData {
  dayOfWeek?: number
  startTime?: string
  endTime?: string
  activityType?: 'WORK' | 'STUDY' | 'EXERCISE' | 'CREATIVE' | 'SOCIAL' | 'REST' | 'OTHER'
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
}

/**
 * Schedule Service - Handles all schedule-related database operations
 */
export class ScheduleService {
  /**
   * Create a new schedule
   */
  static async createSchedule(data: CreateScheduleData) {
    try {
      return await prisma.schedule.create({
        data: {
          ...data,
          isActive: data.isActive ?? true
        }
      })
    } catch (error) {
      console.error('Error creating schedule:', error)
      throw new Error('Failed to create schedule')
    }
  }

  /**
   * Get schedule by ID with blocks
   */
  static async getScheduleById(id: string) {
    try {
      return await prisma.schedule.findUnique({
        where: { id },
        include: {
          scheduleBlocks: {
            orderBy: [
              { dayOfWeek: 'asc' },
              { startTime: 'asc' }
            ]
          }
        }
      })
    } catch (error) {
      console.error('Error fetching schedule:', error)
      throw new Error('Failed to fetch schedule')
    }
  }

  /**
   * Get all schedules for a user
   */
  static async getUserSchedules(userId: string, includeBlocks = false) {
    try {
      return await prisma.schedule.findMany({
        where: { userId },
        include: includeBlocks ? {
          scheduleBlocks: {
            orderBy: [
              { dayOfWeek: 'asc' },
              { startTime: 'asc' }
            ]
          }
        } : false,
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      console.error('Error fetching user schedules:', error)
      throw new Error('Failed to fetch user schedules')
    }
  }

  /**
   * Update schedule
   */
  static async updateSchedule(id: string, data: UpdateScheduleData) {
    try {
      return await prisma.schedule.update({
        where: { id },
        data
      })
    } catch (error) {
      console.error('Error updating schedule:', error)
      throw new Error('Failed to update schedule')
    }
  }

  /**
   * Delete schedule (will also delete all schedule blocks)
   */
  static async deleteSchedule(id: string) {
    try {
      await prisma.schedule.delete({
        where: { id }
      })
    } catch (error) {
      console.error('Error deleting schedule:', error)
      throw new Error('Failed to delete schedule')
    }
  }

  /**
   * Create a schedule block
   */
  static async createScheduleBlock(data: CreateScheduleBlockData) {
    try {
      return await prisma.scheduleBlock.create({
        data: {
          ...data,
          priority: data.priority || 'MEDIUM'
        }
      })
    } catch (error) {
      console.error('Error creating schedule block:', error)
      throw new Error('Failed to create schedule block')
    }
  }

  /**
   * Create multiple schedule blocks
   */
  static async createManyScheduleBlocks(blocks: CreateScheduleBlockData[]) {
    try {
      return await prisma.scheduleBlock.createMany({
        data: blocks.map(block => ({
          ...block,
          priority: block.priority || 'MEDIUM'
        }))
      })
    } catch (error) {
      console.error('Error creating schedule blocks:', error)
      throw new Error('Failed to create schedule blocks')
    }
  }

  /**
   * Get schedule blocks for a schedule
   */
  static async getScheduleBlocks(scheduleId: string) {
    try {
      return await prisma.scheduleBlock.findMany({
        where: { scheduleId },
        orderBy: [
          { dayOfWeek: 'asc' },
          { startTime: 'asc' }
        ]
      })
    } catch (error) {
      console.error('Error fetching schedule blocks:', error)
      throw new Error('Failed to fetch schedule blocks')
    }
  }

  /**
   * Update schedule block
   */
  static async updateScheduleBlock(id: string, data: UpdateScheduleBlockData) {
    try {
      return await prisma.scheduleBlock.update({
        where: { id },
        data
      })
    } catch (error) {
      console.error('Error updating schedule block:', error)
      throw new Error('Failed to update schedule block')
    }
  }

  /**
   * Delete schedule block
   */
  static async deleteScheduleBlock(id: string) {
    try {
      await prisma.scheduleBlock.delete({
        where: { id }
      })
    } catch (error) {
      console.error('Error deleting schedule block:', error)
      throw new Error('Failed to delete schedule block')
    }
  }

  /**
   * Get schedule blocks for a specific day
   */
  static async getScheduleBlocksForDay(scheduleId: string, dayOfWeek: number) {
    try {
      return await prisma.scheduleBlock.findMany({
        where: {
          scheduleId,
          dayOfWeek
        },
        orderBy: { startTime: 'asc' }
      })
    } catch (error) {
      console.error('Error fetching schedule blocks for day:', error)
      throw new Error('Failed to fetch schedule blocks for day')
    }
  }

  /**
   * Get active schedules for a user
   */
  static async getActiveSchedules(userId: string) {
    try {
      return await prisma.schedule.findMany({
        where: {
          userId,
          isActive: true
        },
        include: {
          scheduleBlocks: {
            orderBy: [
              { dayOfWeek: 'asc' },
              { startTime: 'asc' }
            ]
          }
        }
      })
    } catch (error) {
      console.error('Error fetching active schedules:', error)
      throw new Error('Failed to fetch active schedules')
    }
  }
} 