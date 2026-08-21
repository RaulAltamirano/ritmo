import type { NextFunction, Request, Response } from 'express'

import { ApiResponses } from '../../../core/utils/apiResponse.js'
import type { ChatMessage } from '../services/OpenAiTrainingClient.js'
import {
  type TrainingProfilePatch,
  TrainingProfileService,
} from '../services/TrainingProfileService.js'
import { TrainingWeekService } from '../services/TrainingWeekService.js'

export class TrainingController {
  constructor(
    private readonly service = new TrainingProfileService(),
    private readonly weeks = new TrainingWeekService(),
  ) {}

  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req)
      if (!userId) {
        this.sendUnauthorized(req, res)
        return
      }

      const profile = await this.service.getProfile(userId)
      ApiResponses.ok(profile, 'Training profile retrieved successfully')
        .withRequestId((req as any).requestId)
        .send(res)
    } catch (error) {
      next(error)
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req)
      if (!userId) {
        this.sendUnauthorized(req, res)
        return
      }

      const profile = await this.service.upsertProfile(
        userId,
        req.body as TrainingProfilePatch,
      )
      ApiResponses.ok(profile, 'Training profile updated successfully')
        .withRequestId((req as any).requestId)
        .send(res)
    } catch (error) {
      next(error)
    }
  }

  async chat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req)
      if (!userId) {
        this.sendUnauthorized(req, res)
        return
      }

      const messages = (req.body as { messages?: ChatMessage[] })?.messages
      if (!Array.isArray(messages)) {
        ApiResponses.badRequest('messages must be an array')
          .withRequestId((req as any).requestId)
          .send(res, 400)
        return
      }

      const result = await this.service.chat(userId, messages)
      ApiResponses.ok(result, 'Training intake response generated')
        .withRequestId((req as any).requestId)
        .send(res)
    } catch (error) {
      next(error)
    }
  }

  async generateWeek(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req)
      if (!userId) {
        this.sendUnauthorized(req, res)
        return
      }
      const { weekStart } = req.body as { weekStart?: string }
      const week = await this.weeks.generateWeek(userId, weekStart ?? '')
      ApiResponses.ok(week, 'Training week generated successfully')
        .withRequestId((req as any).requestId)
        .send(res)
    } catch (error) {
      next(error)
    }
  }

  async applyWeek(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req)
      if (!userId) {
        this.sendUnauthorized(req, res)
        return
      }
      const result = await this.weeks.applyWeek(userId, req.params.id)
      ApiResponses.ok(result, 'Training week applied successfully')
        .withRequestId((req as any).requestId)
        .send(res)
    } catch (error) {
      next(error)
    }
  }

  async getWeek(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req)
      if (!userId) {
        this.sendUnauthorized(req, res)
        return
      }
      const weekStart =
        typeof req.query.weekStart === 'string' ? req.query.weekStart : ''
      const week = await this.weeks.getWeek(userId, weekStart)
      ApiResponses.ok(week, 'Training week retrieved successfully')
        .withRequestId((req as any).requestId)
        .send(res)
    } catch (error) {
      next(error)
    }
  }

  async getExercises(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!this.getUserId(req)) {
        this.sendUnauthorized(req, res)
        return
      }
      const exercises = await this.weeks.getExercises()
      ApiResponses.ok(exercises, 'Training exercises retrieved successfully')
        .withRequestId((req as any).requestId)
        .send(res)
    } catch (error) {
      next(error)
    }
  }

  private getUserId(req: Request): string | undefined {
    return (req as any).user?.id as string | undefined
  }

  private sendUnauthorized(req: Request, res: Response): void {
    ApiResponses.unauthorized()
      .withRequestId((req as any).requestId)
      .send(res, 401)
  }
}
