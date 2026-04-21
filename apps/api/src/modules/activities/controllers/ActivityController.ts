import { NextFunction, Request, Response } from 'express'
import { ApiResponses } from '../../../core/utils/apiResponse.js'
import {
  ActivityService,
  CreateActivityInput,
  UpdateActivityInput,
} from '../services/ActivityService.js'

export class ActivityController {
  private readonly activityService: ActivityService

  constructor() {
    this.activityService = new ActivityService()
  }

  async getActivities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req)
      const activities = await this.activityService.getActivities(userId)

      ApiResponses.ok(activities, 'Activities retrieved successfully')
        .withRequestId((req as any).requestId)
        .send(res)
    } catch (error) {
      next(error)
    }
  }

  async getTodayActivities(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = this.getUserId(req)
      const activities = await this.activityService.getTodayActivities(userId)

      ApiResponses.ok(activities, 'Today activities retrieved successfully')
        .withRequestId((req as any).requestId)
        .send(res)
    } catch (error) {
      next(error)
    }
  }

  async createActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req)
      const payload = req.body as CreateActivityInput

      if (!payload?.title || !payload?.startTime) {
        ApiResponses.badRequest('title and startTime are required')
          .withRequestId((req as any).requestId)
          .send(res, 400)
        return
      }

      const created = await this.activityService.createActivity(payload, userId)

      ApiResponses.created(created, 'Activity created successfully')
        .withRequestId((req as any).requestId)
        .send(res, 201)
    } catch (error) {
      next(error)
    }
  }

  async updateActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req)
      const { id } = req.params

      if (!id) {
        ApiResponses.badRequest('Activity id is required')
          .withRequestId((req as any).requestId)
          .send(res, 400)
        return
      }

      const payload = req.body as UpdateActivityInput
      const updated = await this.activityService.updateActivity(id, payload, userId)

      ApiResponses.ok(updated, 'Activity updated successfully')
        .withRequestId((req as any).requestId)
        .send(res)
    } catch (error) {
      next(error)
    }
  }

  async deleteActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req)
      const { id } = req.params

      if (!id) {
        ApiResponses.badRequest('Activity id is required')
          .withRequestId((req as any).requestId)
          .send(res, 400)
        return
      }

      await this.activityService.deleteActivity(id, userId)

      ApiResponses.ok({ message: 'Activity deleted successfully' })
        .withRequestId((req as any).requestId)
        .send(res)
    } catch (error) {
      next(error)
    }
  }

  private getUserId(req: Request): string | undefined {
    const authenticatedUserId = (req as any).user?.id as string | undefined
    const queryUserId = req.query.userId as string | undefined

    return authenticatedUserId || queryUserId
  }
}
