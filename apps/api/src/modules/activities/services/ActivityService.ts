import {
  Activity,
  ActivityStatus,
  ActivityType,
  Prisma,
  Priority,
} from '@prisma/client'
import prisma from '../../../core/database/prisma.js'

export interface CreateActivityInput {
  title: string
  description?: string
  startTime: string | Date
  endTime?: string | Date
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  category?: string
  tags?: string[]
}

export interface UpdateActivityInput {
  title?: string
  description?: string
  startTime?: string | Date
  endTime?: string | Date | null
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  category?: string
  tags?: string[]
  isCompleted?: boolean
}

export interface FrontendActivity {
  id: string
  title: string
  description?: string
  type: string
  status: string
  duration: number
  estimatedDuration?: number
  priority: string
  isCompleted: boolean
  tags: string[]
  category?: string
  createdAt: Date
  updatedAt: Date
  startTime: Date
  endTime: Date
}

export class ActivityService {
  async getActivities(userId?: string): Promise<FrontendActivity[]> {
    const resolvedUserId = await this.resolveUserId(userId)
    const activities = await prisma.activity.findMany({
      where: {
        userId: resolvedUserId,
        isDeleted: false,
      },
      orderBy: {
        startTime: 'asc',
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    })

    return activities.map(activity => this.toFrontendActivity(activity))
  }

  async getTodayActivities(userId?: string): Promise<FrontendActivity[]> {
    const resolvedUserId = await this.resolveUserId(userId)
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)

    const activities = await prisma.activity.findMany({
      where: {
        userId: resolvedUserId,
        isDeleted: false,
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: {
        startTime: 'asc',
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    })

    return activities.map(activity => this.toFrontendActivity(activity))
  }

  async createActivity(
    payload: CreateActivityInput,
    userId?: string,
  ): Promise<FrontendActivity> {
    const resolvedUserId = await this.resolveUserId(userId)
    const categoryId = await this.resolveCategoryId(resolvedUserId, payload.category)
    const createdActivity = await prisma.activity.create({
      data: {
        userId: resolvedUserId,
        title: payload.title.trim(),
        description: payload.description?.trim() ? payload.description.trim() : null,
        type: this.toActivityType(payload.category),
        status: ActivityStatus.active,
        startTime: new Date(payload.startTime),
        endTime: payload.endTime ? new Date(payload.endTime) : null,
        priority: this.toPriority(payload.priority),
        tags: payload.tags ?? [],
        categoryId,
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    })

    return this.toFrontendActivity(createdActivity)
  }

  async updateActivity(
    activityId: string,
    payload: UpdateActivityInput,
    userId?: string,
  ): Promise<FrontendActivity> {
    const resolvedUserId = await this.resolveUserId(userId)

    const existing = await prisma.activity.findFirst({
      where: {
        id: activityId,
        userId: resolvedUserId,
        isDeleted: false,
      },
    })

    if (!existing) {
      throw new Error('Activity not found')
    }

    const data: Prisma.ActivityUpdateInput = {}

    if (payload.title !== undefined) {
      data.title = payload.title.trim()
    }
    if (payload.description !== undefined) {
      data.description = payload.description?.trim() || null
    }
    if (payload.startTime !== undefined) {
      data.startTime = new Date(payload.startTime)
    }
    if (payload.endTime !== undefined) {
      data.endTime = payload.endTime ? new Date(payload.endTime) : null
    }
    if (payload.priority !== undefined) {
      data.priority = this.toPriority(payload.priority)
    }
    if (payload.tags !== undefined) {
      data.tags = payload.tags
    }
    if (payload.category?.trim()) {
      const trimmed = payload.category.trim()
      data.type = this.toActivityType(trimmed)
      const categoryId = await this.resolveCategoryId(resolvedUserId, trimmed)
      data.category = categoryId
        ? { connect: { id: categoryId } }
        : { disconnect: true }
    }
    if (payload.isCompleted !== undefined) {
      data.status = payload.isCompleted
        ? ActivityStatus.completed
        : ActivityStatus.active
    }

    const updated = await prisma.activity.update({
      where: { id: activityId },
      data,
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    })

    return this.toFrontendActivity(updated)
  }

  async deleteActivity(activityId: string, userId?: string): Promise<void> {
    const resolvedUserId = await this.resolveUserId(userId)

    const deletedActivity = await prisma.activity.updateMany({
      where: {
        id: activityId,
        userId: resolvedUserId,
        isDeleted: false,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    })

    if (deletedActivity.count === 0) {
      throw new Error('Activity not found')
    }

    await prisma.task.updateMany({
      where: {
        activityId,
        userId: resolvedUserId,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    })
  }

  private async resolveUserId(userId?: string): Promise<string> {
    if (userId) {
      return userId
    }

    const fallbackUser = await prisma.user.findFirst({
      where: {
        isActive: true,
        isDeleted: false,
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        id: true,
      },
    })

    if (!fallbackUser) {
      throw new Error('No active user found to manage activities')
    }

    return fallbackUser.id
  }

  private async resolveCategoryId(
    userId: string,
    category?: string,
  ): Promise<string | null> {
    if (!category?.trim()) {
      return null
    }

    const normalizedCategory = category.trim()
    const existingCategory = await prisma.category.findFirst({
      where: {
        userId,
        isDeleted: false,
        name: normalizedCategory,
      },
      select: {
        id: true,
      },
    })

    if (existingCategory) {
      return existingCategory.id
    }

    const createdCategory = await prisma.category.create({
      data: {
        userId,
        name: normalizedCategory,
      },
      select: {
        id: true,
      },
    })

    return createdCategory.id
  }

  private toPriority(priority?: string): Priority {
    switch (priority) {
      case 'LOW':
        return Priority.low
      case 'HIGH':
        return Priority.high
      case 'URGENT':
        return Priority.urgent
      case 'MEDIUM':
      default:
        return Priority.medium
    }
  }

  private toActivityType(category?: string): ActivityType {
    const normalizedCategory = (category ?? '').toLowerCase()

    if (normalizedCategory.includes('study')) return ActivityType.study
    if (normalizedCategory.includes('exercise')) return ActivityType.exercise
    if (normalizedCategory.includes('health')) return ActivityType.health
    if (normalizedCategory.includes('social')) return ActivityType.social
    if (normalizedCategory.includes('personal')) return ActivityType.personal
    if (normalizedCategory.includes('creative')) return ActivityType.creative
    if (normalizedCategory.includes('learning')) return ActivityType.learning

    return ActivityType.work
  }

  private toFrontendActivity(
    activity: Activity & { category?: { name: string } | null },
  ): FrontendActivity {
    const duration = activity.duration ?? activity.estimatedDuration ?? 25

    return {
      id: activity.id,
      title: activity.title,
      description: activity.description ?? undefined,
      type: activity.type,
      status: activity.status,
      duration,
      estimatedDuration: activity.estimatedDuration ?? undefined,
      priority: activity.priority,
      isCompleted: activity.status === ActivityStatus.completed,
      tags: activity.tags,
      category: activity.category?.name,
      createdAt: activity.createdAt,
      updatedAt: activity.updatedAt,
      startTime: activity.startTime,
      endTime: activity.endTime ?? activity.startTime,
    }
  }
}
