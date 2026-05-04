import type { NextFunction, Request, Response } from 'express'
import { WorkSessionState } from '@prisma/client'
import type { AuthenticatedRequest } from '../../../core/middleware/auth.js'
import { ApiResponses } from '../../../core/utils/apiResponse.js'
import {
  completeWorkSessionBodySchema,
  createWorkSessionBodySchema,
  patchWorkSessionBodySchema,
} from '../dto/workSession.schemas.js'
import { WorkSessionService } from '../services/WorkSessionService.js'

function requestId(req: Request): string {
  return req.requestId ?? 'unknown'
}

function parseIdempotencyKeyFromRequest(req: Request): string | undefined {
  const raw = req.headers['idempotency-key'] ?? req.headers['Idempotency-Key']
  if (typeof raw === 'string') return raw
  if (Array.isArray(raw) && raw.length > 0) return raw[0]
  return undefined
}

export class WorkSessionController {
  private readonly service = new WorkSessionService()

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const auth = req as AuthenticatedRequest
      const userId = auth.user!.id
      const tz = auth.user?.timezone ?? 'UTC'
      const parsed = createWorkSessionBodySchema.safeParse(req.body)
      if (!parsed.success) {
        ApiResponses.badRequest('Invalid body for work session create')
          .withRequestId(requestId(req))
          .send(res, 400)
        return
      }
      const row = await this.service.create(userId, tz, parsed.data)
      ApiResponses.created(row, 'Work session started')
        .withRequestId(requestId(req))
        .send(res, 201)
    } catch (e) {
      next(e)
    }
  }

  async getActive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user!.id
      const row = await this.service.getActive(userId)
      ApiResponses.ok({ data: row }, 'Active work session')
        .withRequestId(requestId(req))
        .send(res)
    } catch (e) {
      next(e)
    }
  }

  async todaySummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const auth = req as AuthenticatedRequest
      const userId = auth.user!.id
      const tz = auth.user?.timezone ?? 'UTC'
      const data = await this.service.getTodaySummary(userId, tz)
      ApiResponses.ok(data, 'Today work session summary')
        .withRequestId(requestId(req))
        .send(res)
    } catch (e) {
      next(e)
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const auth = req as AuthenticatedRequest
      const userId = auth.user!.id
      const tz = auth.user?.timezone ?? 'UTC'
      const stateParsed = req.query.state
        ? (Object.values(WorkSessionState) as string[]).includes(
            req.query.state as string,
          )
          ? (req.query.state as WorkSessionState)
          : undefined
        : undefined
      if (req.query.state && !stateParsed) {
        ApiResponses.badRequest('Invalid state filter')
          .withRequestId(requestId(req))
          .send(res, 400)
        return
      }
      const result = await this.service.list(userId, tz, {
        from: req.query.from as string | undefined,
        to: req.query.to as string | undefined,
        taskId: req.query.taskId as string | undefined,
        state: stateParsed,
        cursor: req.query.cursor as string | undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
      })
      ApiResponses.ok(result, 'Work sessions').withRequestId(requestId(req)).send(res)
    } catch (e) {
      next(e)
    }
  }

  async patch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user!.id
      const { id } = req.params
      const parsed = patchWorkSessionBodySchema.safeParse(req.body)
      if (!parsed.success) {
        ApiResponses.badRequest('Invalid patch body')
          .withRequestId(requestId(req))
          .send(res, 400)
        return
      }
      const row = await this.service.patch(userId, id, parsed.data)
      ApiResponses.ok(row, 'Work session updated')
        .withRequestId(requestId(req))
        .send(res)
    } catch (e) {
      next(e)
    }
  }

  async complete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user!.id
      const idempotencyKey = parseIdempotencyKeyFromRequest(req)
      if (!idempotencyKey || idempotencyKey.length < 8) {
        ApiResponses.badRequest('Idempotency-Key header is required')
          .withRequestId(requestId(req))
          .send(res, 400)
        return
      }
      const parsed = completeWorkSessionBodySchema.safeParse(req.body)
      if (!parsed.success) {
        ApiResponses.badRequest('Invalid completion payload')
          .withRequestId(requestId(req))
          .send(res, 400)
        return
      }
      const { id } = req.params
      const result = await this.service.complete(
        userId,
        id,
        idempotencyKey,
        parsed.data,
      )
      ApiResponses.ok(
        { session: result.session, duplicate: result.duplicate },
        'Work session completed',
      )
        .withRequestId(requestId(req))
        .send(res)
    } catch (e) {
      next(e)
    }
  }

  async abandon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user!.id
      const { id } = req.params
      const row = await this.service.abandon(userId, id)
      ApiResponses.ok(row, 'Work session abandoned')
        .withRequestId(requestId(req))
        .send(res)
    } catch (e) {
      next(e)
    }
  }
}
