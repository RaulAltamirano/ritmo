import { PlanStatus, Prisma, TaskStatus } from '@prisma/client'
import prisma from '../../../core/database/prisma.js'
import {
  InvalidInputException,
  ResourceNotFoundException,
} from '../../../shared/exceptions/app.exceptions.js'
import type { FrontendTask } from '../../tasks/services/TaskService.js'

export type PlanStatusInput = 'planned' | 'active' | 'paused' | 'completed'

export interface CreatePlanInput {
  name: string
  description?: string
  status?: PlanStatusInput
  color?: string
  icon?: string
}

export interface UpdatePlanInput {
  name?: string
  description?: string | null
  status?: PlanStatusInput
  color?: string | null
  icon?: string | null
}

export interface PlanStats {
  totalTasks: number
  pendingTasks: number
  progress: number
}

export interface FrontendPlan {
  id: string
  name: string
  description?: string
  status: PlanStatusInput
  color?: string
  icon?: string
  totalTasks: number
  pendingTasks: number
  progress: number
  createdAt: Date
  updatedAt: Date
}

export class PlanService {
  async getPlans(userId: string): Promise<FrontendPlan[]> {
    const plans = await prisma.plan.findMany({
      where: { userId, isDeleted: false },
      orderBy: { createdAt: 'desc' },
    })
    return Promise.all(plans.map(p => this.toFrontendWithStats(p)))
  }

  async getPlan(planId: string, userId: string): Promise<FrontendPlan> {
    const plan = await this.findOwnedPlan(planId, userId)
    return this.toFrontendWithStats(plan)
  }

  async createPlan(payload: CreatePlanInput, userId: string): Promise<FrontendPlan> {
    const name = payload.name.trim()
    if (!name) throw new InvalidInputException('name is required')
    if (name.length > 255) {
      throw new InvalidInputException('name must be at most 255 characters')
    }

    const plan = await prisma.plan.create({
      data: {
        userId,
        name,
        description: payload.description?.trim() || null,
        status: this.toStatus(payload.status),
        color: payload.color?.trim() || null,
        icon: payload.icon?.trim() || null,
      },
    })
    return this.toFrontendWithStats(plan)
  }

  async updatePlan(
    planId: string,
    payload: UpdatePlanInput,
    userId: string,
  ): Promise<FrontendPlan> {
    await this.findOwnedPlan(planId, userId)

    const data: Prisma.PlanUpdateInput = {}
    if (payload.name !== undefined) {
      const name = payload.name.trim()
      if (!name) throw new InvalidInputException('name is required')
      if (name.length > 255) {
        throw new InvalidInputException('name must be at most 255 characters')
      }
      data.name = name
    }
    if (payload.description !== undefined) {
      data.description = payload.description?.trim() || null
    }
    if (payload.status !== undefined) data.status = this.toStatus(payload.status)
    if (payload.color !== undefined) data.color = payload.color?.trim() || null
    if (payload.icon !== undefined) data.icon = payload.icon?.trim() || null

    const updated = await prisma.plan.update({ where: { id: planId }, data })
    return this.toFrontendWithStats(updated)
  }

  async deletePlan(planId: string, userId: string): Promise<void> {
    await prisma.$transaction(async tx => {
      const plan = await tx.plan.findFirst({
        where: { id: planId, userId, isDeleted: false },
      })
      if (!plan) throw new ResourceNotFoundException('Plan', planId)

      const now = new Date()
      await tx.plan.update({
        where: { id: planId },
        data: { isDeleted: true, deletedAt: now },
      })
      await tx.task.updateMany({
        where: { planId, isDeleted: false },
        data: { isDeleted: true, deletedAt: now },
      })
    })
  }

  async getPlanTasks(planId: string, userId: string): Promise<FrontendTask[]> {
    await this.findOwnedPlan(planId, userId)
    const tasks = await prisma.task.findMany({
      where: { planId, userId, isDeleted: false },
      orderBy: { startTime: 'asc' },
      include: { category: { select: { name: true } } },
    })
    return tasks.map(t => this.taskToFrontend(t))
  }

  private async findOwnedPlan(
    planId: string,
    userId: string,
  ): Promise<{
    id: string
    name: string
    description: string | null
    status: PlanStatus
    color: string | null
    icon: string | null
    createdAt: Date
    updatedAt: Date
  }> {
    const plan = await prisma.plan.findFirst({
      where: { id: planId, userId, isDeleted: false },
    })
    if (!plan) throw new ResourceNotFoundException('Plan', planId)
    return plan
  }

  private async computeStats(planId: string): Promise<PlanStats> {
    const tasks = await prisma.task.findMany({
      where: { planId, isDeleted: false },
      select: { status: true },
    })
    const totalTasks = tasks.length
    const completedCount = tasks.filter(t => t.status === TaskStatus.completed).length
    const pendingTasks = totalTasks - completedCount
    const progress =
      totalTasks === 0 ? 0 : Math.floor((100 * completedCount) / totalTasks)
    return { totalTasks, pendingTasks, progress }
  }

  private async toFrontendWithStats(plan: {
    id: string
    name: string
    description: string | null
    status: PlanStatus
    color: string | null
    icon: string | null
    createdAt: Date
    updatedAt: Date
  }): Promise<FrontendPlan> {
    const stats = await this.computeStats(plan.id)
    return {
      id: plan.id,
      name: plan.name,
      description: plan.description ?? undefined,
      status: plan.status,
      color: plan.color ?? undefined,
      icon: plan.icon ?? undefined,
      ...stats,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    }
  }

  private toStatus(status?: PlanStatusInput): PlanStatus {
    switch (status) {
      case 'active':
        return PlanStatus.active
      case 'paused':
        return PlanStatus.paused
      case 'completed':
        return PlanStatus.completed
      case 'planned':
      default:
        return PlanStatus.planned
    }
  }

  private taskToFrontend(task: {
    id: string
    title: string
    description: string | null
    status: TaskStatus
    priority: string
    startTime: Date
    endTime: Date | null
    duration: number | null
    estimatedDuration: number | null
    dueDate: Date | null
    completedAt: Date | null
    type: string | null
    tags: string[]
    planId: string | null
    createdAt: Date
    updatedAt: Date
    category?: { name: string } | null
  }): FrontendTask {
    return {
      id: task.id,
      title: task.title,
      description: task.description ?? undefined,
      status: task.status,
      priority: task.priority,
      isCompleted: task.status === TaskStatus.completed,
      startTime: task.startTime,
      endTime: task.endTime ?? undefined,
      duration: task.duration ?? task.estimatedDuration ?? undefined,
      estimatedDuration: task.estimatedDuration ?? undefined,
      dueDate: task.dueDate ?? undefined,
      completedAt: task.completedAt ?? undefined,
      type: task.type ?? undefined,
      tags: task.tags,
      category: task.category?.name,
      planId: task.planId ?? null,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    }
  }
}
