import { Prisma, Priority, TaskStatus } from '@prisma/client'
import prisma from '../../../core/database/prisma.js'

export interface CreateTaskInput {
  title: string
  description?: string
  startTime?: string | Date
  endTime?: string | Date
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  category?: string
  type?: string
  tags?: string[]
  estimatedDuration?: number
  dueDate?: string | Date
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  startTime?: string | Date
  endTime?: string | Date | null
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  category?: string
  type?: string
  tags?: string[]
  isCompleted?: boolean
  estimatedDuration?: number
  dueDate?: string | Date | null
}

export interface FrontendTask {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  isCompleted: boolean
  startTime: Date
  endTime?: Date
  duration?: number
  estimatedDuration?: number
  dueDate?: Date
  completedAt?: Date
  type?: string
  tags: string[]
  category?: string
  createdAt: Date
  updatedAt: Date
}

export class TaskService {
  async getTasks(userId: string): Promise<FrontendTask[]> {
    const tasks = await prisma.task.findMany({
      where: { userId, isDeleted: false },
      orderBy: { startTime: 'asc' },
      include: { category: { select: { name: true } } },
    })
    return tasks.map(t => this.toFrontend(t))
  }

  async getTodayTasks(userId: string): Promise<FrontendTask[]> {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)

    const tasks = await prisma.task.findMany({
      where: {
        userId,
        isDeleted: false,
        startTime: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: { startTime: 'asc' },
      include: { category: { select: { name: true } } },
    })
    return tasks.map(t => this.toFrontend(t))
  }

  async createTask(payload: CreateTaskInput, userId: string): Promise<FrontendTask> {
    const categoryId = await this.resolveCategoryId(userId, payload.category)
    const task = await prisma.task.create({
      data: {
        userId,
        title: payload.title.trim(),
        description: payload.description?.trim() ?? null,
        status: TaskStatus.todo,
        priority: this.toPriority(payload.priority),
        startTime: payload.startTime ? new Date(payload.startTime) : new Date(),
        endTime: payload.endTime ? new Date(payload.endTime) : null,
        duration: payload.estimatedDuration ?? null,
        estimatedDuration: payload.estimatedDuration ?? null,
        dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
        type: payload.type ?? payload.category?.toLowerCase() ?? null,
        tags: payload.tags ?? [],
        categoryId,
      },
      include: { category: { select: { name: true } } },
    })
    return this.toFrontend(task)
  }

  async updateTask(
    taskId: string,
    payload: UpdateTaskInput,
    userId: string,
  ): Promise<FrontendTask> {
    const existing = await prisma.task.findFirst({
      where: { id: taskId, userId, isDeleted: false },
    })
    if (!existing) throw new Error('Task not found')

    const data: Prisma.TaskUpdateInput = {}
    if (payload.title !== undefined) data.title = payload.title.trim()
    if (payload.description !== undefined)
      data.description = payload.description?.trim() || null
    if (payload.startTime !== undefined) data.startTime = new Date(payload.startTime)
    if (payload.endTime !== undefined)
      data.endTime = payload.endTime ? new Date(payload.endTime) : null
    if (payload.priority !== undefined)
      data.priority = this.toPriority(payload.priority)
    if (payload.tags !== undefined) data.tags = payload.tags
    if (payload.estimatedDuration !== undefined)
      data.estimatedDuration = payload.estimatedDuration
    if (payload.dueDate !== undefined)
      data.dueDate = payload.dueDate ? new Date(payload.dueDate) : null
    if (payload.type !== undefined) data.type = payload.type || null
    if (payload.isCompleted !== undefined) {
      data.status = payload.isCompleted ? TaskStatus.completed : TaskStatus.todo
      data.completedAt = payload.isCompleted ? new Date() : null
    }
    if (payload.category?.trim()) {
      const categoryId = await this.resolveCategoryId(userId, payload.category.trim())
      data.category = categoryId
        ? { connect: { id: categoryId } }
        : { disconnect: true }
      data.type = payload.category.toLowerCase()
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data,
      include: { category: { select: { name: true } } },
    })
    return this.toFrontend(updated)
  }

  async deleteTask(taskId: string, userId: string): Promise<void> {
    const count = await prisma.task.updateMany({
      where: { id: taskId, userId, isDeleted: false },
      data: { isDeleted: true, deletedAt: new Date() },
    })
    if (count.count === 0) throw new Error('Task not found')
  }

  private async resolveCategoryId(
    userId: string,
    category?: string,
  ): Promise<string | null> {
    if (!category?.trim()) return null
    const name = category.trim()
    const existing = await prisma.category.findFirst({
      where: { userId, isDeleted: false, name },
      select: { id: true },
    })
    if (existing) return existing.id
    const created = await prisma.category.create({
      data: { userId, name },
      select: { id: true },
    })
    return created.id
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

  private toFrontend(task: {
    id: string
    title: string
    description: string | null
    status: TaskStatus
    priority: Priority
    startTime: Date
    endTime: Date | null
    duration: number | null
    estimatedDuration: number | null
    dueDate: Date | null
    completedAt: Date | null
    type: string | null
    tags: string[]
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
      duration: task.duration ?? task.estimatedDuration ?? 25,
      estimatedDuration: task.estimatedDuration ?? undefined,
      dueDate: task.dueDate ?? undefined,
      completedAt: task.completedAt ?? undefined,
      type: task.type ?? undefined,
      tags: task.tags,
      category: task.category?.name,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    }
  }
}
