import type { NextFunction, Request, Response } from 'express'
import { ApiResponses } from '../../../core/utils/apiResponse.js'
import type { CreatePlanInput, UpdatePlanInput } from '../services/PlanService.js'
import { PlanService } from '../services/PlanService.js'

export class PlanController {
  private readonly service = new PlanService()

  async getPlans(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req)
      if (!userId) {
        ApiResponses.unauthorized()
          .withRequestId((req as any).requestId)
          .send(res, 401)
        return
      }
      const plans = await this.service.getPlans(userId)
      ApiResponses.ok(plans, 'Plans retrieved successfully')
        .withRequestId((req as any).requestId)
        .send(res)
    } catch (error) {
      next(error)
    }
  }

  async getPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
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
        ApiResponses.badRequest('Plan id is required')
          .withRequestId((req as any).requestId)
          .send(res, 400)
        return
      }
      const plan = await this.service.getPlan(id, userId)
      ApiResponses.ok(plan, 'Plan retrieved successfully')
        .withRequestId((req as any).requestId)
        .send(res)
    } catch (error) {
      next(error)
    }
  }

  async createPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req)
      if (!userId) {
        ApiResponses.unauthorized()
          .withRequestId((req as any).requestId)
          .send(res, 401)
        return
      }
      const payload = req.body as CreatePlanInput
      if (!payload?.name?.trim()) {
        ApiResponses.badRequest('name is required')
          .withRequestId((req as any).requestId)
          .send(res, 400)
        return
      }
      if (payload.name.trim().length > 255) {
        ApiResponses.badRequest('name must be at most 255 characters')
          .withRequestId((req as any).requestId)
          .send(res, 400)
        return
      }
      const plan = await this.service.createPlan(payload, userId)
      ApiResponses.created(plan, 'Plan created successfully')
        .withRequestId((req as any).requestId)
        .send(res, 201)
    } catch (error) {
      next(error)
    }
  }

  async updatePlan(req: Request, res: Response, next: NextFunction): Promise<void> {
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
        ApiResponses.badRequest('Plan id is required')
          .withRequestId((req as any).requestId)
          .send(res, 400)
        return
      }
      const payload = req.body as UpdatePlanInput
      const plan = await this.service.updatePlan(id, payload, userId)
      ApiResponses.ok(plan, 'Plan updated successfully')
        .withRequestId((req as any).requestId)
        .send(res)
    } catch (error) {
      next(error)
    }
  }

  async deletePlan(req: Request, res: Response, next: NextFunction): Promise<void> {
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
        ApiResponses.badRequest('Plan id is required')
          .withRequestId((req as any).requestId)
          .send(res, 400)
        return
      }
      await this.service.deletePlan(id, userId)
      ApiResponses.ok({ message: 'Plan deleted successfully' })
        .withRequestId((req as any).requestId)
        .send(res)
    } catch (error) {
      next(error)
    }
  }

  async getPlanTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
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
        ApiResponses.badRequest('Plan id is required')
          .withRequestId((req as any).requestId)
          .send(res, 400)
        return
      }
      const tasks = await this.service.getPlanTasks(id, userId)
      ApiResponses.ok(tasks, 'Plan tasks retrieved successfully')
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
