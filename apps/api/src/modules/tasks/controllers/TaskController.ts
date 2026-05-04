import type { NextFunction, Request, Response } from 'express'
import { ApiResponses } from '../../../core/utils/apiResponse.js'
import type { CreateTaskInput, UpdateTaskInput } from '../services/TaskService.js'
import { TaskService } from '../services/TaskService.js'

export class TaskController {
  private readonly service = new TaskService()

  async getTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req)
      if (!userId) {
        ApiResponses.unauthorized()
          .withRequestId((req as any).requestId)
          .send(res, 401)
        return
      }
      const tasks = await this.service.getTasks(userId)
      ApiResponses.ok(tasks, 'Tasks retrieved successfully')
        .withRequestId((req as any).requestId)
        .send(res)
    } catch (error) {
      next(error)
    }
  }

  async getTodayTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req)
      if (!userId) {
        ApiResponses.unauthorized()
          .withRequestId((req as any).requestId)
          .send(res, 401)
        return
      }
      const tasks = await this.service.getTodayTasks(userId)
      ApiResponses.ok(tasks, 'Today tasks retrieved successfully')
        .withRequestId((req as any).requestId)
        .send(res)
    } catch (error) {
      next(error)
    }
  }

  async createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req)
      if (!userId) {
        ApiResponses.unauthorized()
          .withRequestId((req as any).requestId)
          .send(res, 401)
        return
      }
      const payload = req.body as CreateTaskInput
      if (!payload?.title) {
        ApiResponses.badRequest('title is required')
          .withRequestId((req as any).requestId)
          .send(res, 400)
        return
      }
      const task = await this.service.createTask(payload, userId)
      ApiResponses.created(task, 'Task created successfully')
        .withRequestId((req as any).requestId)
        .send(res, 201)
    } catch (error) {
      next(error)
    }
  }

  async updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req)
      if (!userId) {
        ApiResponses.unauthorized()
          .withRequestId((req as any).requestId)
          .send(res, 401)
        return
      }
      const { id } = req.params
      if (!id) {
        ApiResponses.badRequest('Task id is required')
          .withRequestId((req as any).requestId)
          .send(res, 400)
        return
      }
      const payload = req.body as UpdateTaskInput
      const task = await this.service.updateTask(id, payload, userId)
      ApiResponses.ok(task, 'Task updated successfully')
        .withRequestId((req as any).requestId)
        .send(res)
    } catch (error) {
      next(error)
    }
  }

  async deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req)
      if (!userId) {
        ApiResponses.unauthorized()
          .withRequestId((req as any).requestId)
          .send(res, 401)
        return
      }
      const { id } = req.params
      if (!id) {
        ApiResponses.badRequest('Task id is required')
          .withRequestId((req as any).requestId)
          .send(res, 400)
        return
      }
      await this.service.deleteTask(id, userId)
      ApiResponses.ok({ message: 'Task deleted successfully' })
        .withRequestId((req as any).requestId)
        .send(res)
    } catch (error) {
      next(error)
    }
  }

  private getUserId(req: Request): string | undefined {
    return (req as any).user?.id as string | undefined
  }
}
