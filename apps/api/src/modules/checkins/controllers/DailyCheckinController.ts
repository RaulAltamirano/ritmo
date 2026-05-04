import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { ApiResponses } from '../../../core/utils/apiResponse.js'
import type { AuthenticatedRequest } from '../../../core/middleware/auth.js'
import { DailyCheckinService } from '../services/DailyCheckinService.js'
import { parseCalendarDateString } from '../../../core/utils/calendarDate.js'

const upsertBodySchema = z.object({
  energy: z.number().int().min(1).max(5),
  stress: z.number().int().min(1).max(5),
})

export class DailyCheckinController {
  private readonly service = new DailyCheckinService()

  async getDaily(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user?.id
      if (!userId) {
        ApiResponses.unauthorized()
          .withRequestId((req as any).requestId)
          .send(res, 401)
        return
      }
      const { calendarDate: calendarDateParam } = req.params
      try {
        parseCalendarDateString(calendarDateParam)
      } catch {
        ApiResponses.badRequest('calendarDate must be YYYY-MM-DD')
          .withRequestId((req as any).requestId)
          .send(res, 400)
        return
      }

      const row = await this.service.getByCalendarDate(userId, calendarDateParam)
      if (!row) {
        ApiResponses.notFound('No daily check-in for this date')
          .withRequestId((req as any).requestId)
          .send(res, 404)
        return
      }

      ApiResponses.ok(
        {
          id: row.id,
          calendarDate: row.calendarDate.toISOString().slice(0, 10),
          energy: row.energy,
          stress: row.stress,
          updatedAt: row.updatedAt.toISOString(),
        },
        'Daily check-in retrieved',
      )
        .withRequestId((req as any).requestId)
        .send(res)
    } catch (error) {
      next(error)
    }
  }

  /**
   * PUT /api/checkins/daily — el servidor deriva el día civil desde la
   * zona horaria del usuario (spec §B2, 2026-04-22). El cliente no envía
   * fecha.
   */
  async putDaily(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const auth = req as AuthenticatedRequest
      const userId = auth.user?.id
      const timezone = auth.user?.timezone ?? 'UTC'
      if (!userId) {
        ApiResponses.unauthorized()
          .withRequestId((req as any).requestId)
          .send(res, 401)
        return
      }

      const parsed = upsertBodySchema.safeParse(req.body)
      if (!parsed.success) {
        ApiResponses.badRequest('energy and stress must be integers 1–5', [])
          .withRequestId((req as any).requestId)
          .send(res, 400)
        return
      }

      const row = await this.service.upsert(userId, timezone, parsed.data)
      ApiResponses.ok(
        {
          id: row.id,
          calendarDate: row.calendarDate.toISOString().slice(0, 10),
          energy: row.energy,
          stress: row.stress,
          updatedAt: row.updatedAt.toISOString(),
        },
        'Daily check-in saved',
      )
        .withRequestId((req as any).requestId)
        .send(res)
    } catch (error) {
      next(error)
    }
  }
}
