import { Prisma, WorkSessionState } from '@prisma/client'
import { DateTime } from 'luxon'
import type {
  CreateWorkSessionBody,
  CompleteWorkSessionBody,
  PatchWorkSessionBody,
} from '../dto/workSession.schemas.js'
import prisma from '../../../core/database/prisma.js'
import { getCalendarDateForUser } from '../../../core/utils/calendarDate.js'
import { WorkSessionHttpError } from '../errors.js'

export type {
  CreateWorkSessionBody,
  CompleteWorkSessionBody,
  PatchWorkSessionBody,
} from '../dto/workSession.schemas.js'

/** running | paused | pending_feedback — actives y completables (mismo conjunto) */
const NON_TERMINAL_STATES: WorkSessionState[] = [
  WorkSessionState.running,
  WorkSessionState.paused,
  WorkSessionState.pending_feedback,
]

const taskSelect = { task: { select: { id: true, title: true } } } as const

type WorkSessionWithTask = Prisma.WorkSessionGetPayload<{
  include: typeof taskSelect
}>

interface CompleteResult {
  session: WorkSessionWithTask
  duplicate: boolean
}

/** One process: chain complete() for the same (userId, idempotencyKey) so the duplicate check is not racy under Promise.all. */
const idempotencyCompleteLast = new Map<string, Promise<CompleteResult>>()

function dailyCheckinGateEnabled(): boolean {
  return process.env.FEATURE_DAILY_CHECKIN_GATE !== 'false'
}

export class WorkSessionService {
  private workSessionWithTask(
    userId: string,
    sessionId: string,
    client: Prisma.TransactionClient | typeof prisma = prisma,
  ) {
    return client.workSession.findFirst({
      where: { id: sessionId, userId },
      include: taskSelect,
    })
  }

  private async findDuplicateByIdempotency(userId: string, idempotencyKey: string) {
    const row = await prisma.workSessionIdempotency.findUnique({
      where: {
        userId_idempotencyKey: { userId, idempotencyKey },
      },
    })
    if (!row) return null
    const ws = await this.workSessionWithTask(userId, row.workSessionId)
    return ws ?? null
  }

  async create(userId: string, userTimezone: string, body: CreateWorkSessionBody) {
    const civilDate = getCalendarDateForUser(new Date(), userTimezone)
    let dailyCheckinId: string | null = null

    if (dailyCheckinGateEnabled()) {
      const checkin = await prisma.dailyCheckin.findUnique({
        where: {
          userId_calendarDate: { userId, calendarDate: civilDate },
        },
      })
      if (!checkin) {
        throw new WorkSessionHttpError(
          'Daily check-in required before starting a work block',
          412,
          'checkin_required',
          { calendarDate: civilDate.toISOString().slice(0, 10) },
        )
      }
      dailyCheckinId = checkin.id
    }

    const conflict = await prisma.workSession.findFirst({
      where: {
        userId,
        state: { in: NON_TERMINAL_STATES },
        isDeleted: false,
      },
    })
    if (conflict) {
      throw new WorkSessionHttpError(
        'Another work block is active',
        409,
        'WORK_SESSION_CONFLICT',
        { activeSessionId: conflict.id, state: conflict.state },
      )
    }

    const task = await this.resolveTaskForWorkSession(userId, body.taskId)
    if (!task) {
      throw new WorkSessionHttpError('Task not found', 404, 'TASK_NOT_FOUND')
    }

    if (body.targetDurationSec < 60 || body.targetDurationSec > 14_400) {
      throw new WorkSessionHttpError(
        'targetDurationSec must be between 60 and 14400',
        400,
        'INVALID_DURATION',
      )
    }

    return prisma.workSession.create({
      data: {
        userId,
        taskId: task.id,
        startTime: new Date(),
        state: WorkSessionState.running,
        timerMode: body.timerMode,
        targetDurationSec: body.targetDurationSec,
        breakDurationSec:
          body.breakDurationSec !== undefined
            ? Math.min(3600, Math.max(0, body.breakDurationSec))
            : null,
        presetKey: body.presetKey ?? null,
        dailyCheckinId,
      },
      include: taskSelect,
    })
  }

  async getActive(userId: string) {
    return prisma.workSession.findFirst({
      where: {
        userId,
        state: { in: NON_TERMINAL_STATES },
        isDeleted: false,
      },
      orderBy: { startTime: 'desc' },
      include: taskSelect,
    })
  }

  /**
   * Aggregates closed WorkSessions (`completed` + `abandoned`, non-deleted) for
   * the user's civil day. The window is bounded by the user's timezone, not UTC,
   * so late-night blocks are credited to the local day the user lived through.
   *
   * Per-session seconds = `max(0, floor((endTime - startTime)/1000) - pausedDurationSec)`.
   * Uses wall-clock minus paused rather than the legacy `duration` column, which
   * is nullable on abandoned sessions and rounds to minutes.
   */
  async getTodaySummary(
    userId: string,
    userTimezone: string,
  ): Promise<{
    calendarDate: string
    totalSeconds: number
    perTask: Record<string, number>
    lastSessionEndedAt: string | null
  }> {
    const localToday = DateTime.now().setZone(userTimezone)
    const safeLocalToday = localToday.isValid ? localToday : DateTime.utc()
    const calendarDate = safeLocalToday.toISODate() ?? DateTime.utc().toISODate()
    if (calendarDate === null) {
      throw new Error('Unable to derive calendar date from current time')
    }
    const startOfDayUtc = safeLocalToday.startOf('day').toUTC().toJSDate()
    const endOfDayUtc = safeLocalToday.endOf('day').toUTC().toJSDate()

    const sessions = await prisma.workSession.findMany({
      where: {
        userId,
        isDeleted: false,
        state: { in: [WorkSessionState.completed, WorkSessionState.abandoned] },
        endTime: { gte: startOfDayUtc, lte: endOfDayUtc },
      },
      select: {
        taskId: true,
        startTime: true,
        endTime: true,
        pausedDurationSec: true,
      },
      orderBy: { endTime: 'asc' },
    })

    const perTask: Record<string, number> = {}
    let totalSeconds = 0
    let lastSessionEndedAt: string | null = null

    for (const s of sessions) {
      if (!s.endTime) continue
      const wallSeconds = Math.floor(
        (s.endTime.getTime() - s.startTime.getTime()) / 1000,
      )
      const billable = Math.max(0, wallSeconds - (s.pausedDurationSec ?? 0))
      perTask[s.taskId] = (perTask[s.taskId] ?? 0) + billable
      totalSeconds += billable
      lastSessionEndedAt = s.endTime.toISOString()
    }

    return {
      calendarDate,
      totalSeconds,
      perTask,
      lastSessionEndedAt,
    }
  }

  async list(
    userId: string,
    userTimezone: string,
    query: {
      from?: string
      to?: string
      taskId?: string
      state?: WorkSessionState
      cursor?: string
      limit?: number
    },
  ) {
    const limit = Math.min(query.limit ?? 20, 100)
    const where: Prisma.WorkSessionWhereInput = {
      userId,
      isDeleted: false,
    }
    if (query.taskId) {
      where.taskId = query.taskId
    }
    if (query.state) {
      where.state = query.state
    }
    const startTime: Prisma.DateTimeFilter = {}
    if (query.from) {
      const fromStartUtc = DateTime.fromISO(query.from, { zone: userTimezone }).startOf(
        'day',
      )
      if (!fromStartUtc.isValid) {
        throw new WorkSessionHttpError('Invalid from date', 400, 'INVALID_DATE_FILTER')
      }
      startTime.gte = fromStartUtc.toUTC().toJSDate()
    }
    if (query.to) {
      const toEndUtc = DateTime.fromISO(query.to, { zone: userTimezone }).endOf('day')
      if (!toEndUtc.isValid) {
        throw new WorkSessionHttpError('Invalid to date', 400, 'INVALID_DATE_FILTER')
      }
      startTime.lte = toEndUtc.toUTC().toJSDate()
    }
    if (Object.keys(startTime).length > 0) {
      where.startTime = startTime
    }

    const items = await prisma.workSession.findMany({
      where,
      take: limit + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      orderBy: { startTime: 'desc' },
      include: taskSelect,
    })

    const hasMore = items.length > limit
    const page = hasMore ? items.slice(0, limit) : items
    const nextCursor = hasMore ? page[page.length - 1]?.id : undefined

    return { items: page, nextCursor }
  }

  async patch(userId: string, sessionId: string, body: PatchWorkSessionBody) {
    const session = await prisma.workSession.findFirst({
      where: { id: sessionId, userId, isDeleted: false },
    })
    if (!session) {
      throw new WorkSessionHttpError('Work session not found', 404, 'NOT_FOUND')
    }

    if (!NON_TERMINAL_STATES.includes(session.state)) {
      throw new WorkSessionHttpError('Work session is not active', 400, 'INVALID_STATE')
    }

    const data: Prisma.WorkSessionUpdateInput = {}
    if (body.lastClientSeenAt) {
      data.lastClientSeenAt = new Date(body.lastClientSeenAt)
    }
    if (body.pausedDurationSec !== undefined) {
      data.pausedDurationSec = body.pausedDurationSec
    }
    if (body.state !== undefined) {
      const allowedTargets = new Set<WorkSessionState>([
        WorkSessionState.running,
        WorkSessionState.paused,
        WorkSessionState.pending_feedback,
      ])
      if (!allowedTargets.has(body.state)) {
        throw new WorkSessionHttpError('Invalid target state', 400, 'INVALID_STATE')
      }
      data.state = body.state
    }

    return prisma.workSession.update({
      where: { id: sessionId },
      data,
      include: taskSelect,
    })
  }

  /**
   * Same userId+idempotencyKey must be serialized in one process so concurrent
   * HTTP calls do not both pass the duplicate pre-check and race the transaction.
   */
  complete(
    userId: string,
    sessionId: string,
    idempotencyKey: string,
    body: CompleteWorkSessionBody,
  ): Promise<CompleteResult> {
    const k = `${userId}\0${idempotencyKey}`
    const previous = idempotencyCompleteLast.get(k) ?? Promise.resolve()
    const result: Promise<CompleteResult> = previous.then(
      () => this.completeUnlocked(userId, sessionId, idempotencyKey, body),
      () => this.completeUnlocked(userId, sessionId, idempotencyKey, body),
    )
    idempotencyCompleteLast.set(k, result)
    void result.finally(() => {
      if (idempotencyCompleteLast.get(k) === result) {
        idempotencyCompleteLast.delete(k)
      }
    })
    return result
  }

  private async completeUnlocked(
    userId: string,
    sessionId: string,
    idempotencyKey: string,
    body: CompleteWorkSessionBody,
  ): Promise<CompleteResult> {
    const fromKey = await this.findDuplicateByIdempotency(userId, idempotencyKey)
    if (fromKey) {
      return { session: fromKey, duplicate: true as const }
    }

    const session = await prisma.workSession.findFirst({
      where: { id: sessionId, userId, isDeleted: false },
    })
    if (!session) {
      throw new WorkSessionHttpError('Work session not found', 404, 'NOT_FOUND')
    }
    if (session.state === WorkSessionState.completed) {
      const ws = await this.workSessionWithTask(userId, sessionId)
      if (!ws) {
        throw new WorkSessionHttpError('Work session not found', 404, 'NOT_FOUND')
      }
      return { session: ws, duplicate: true as const }
    }
    if (!NON_TERMINAL_STATES.includes(session.state)) {
      throw new WorkSessionHttpError(
        'Session cannot be completed from this state',
        400,
        'INVALID_STATE',
      )
    }

    const endTime = new Date()
    const durationMin = Math.max(
      1,
      Math.round(
        (endTime.getTime() - session.startTime.getTime()) / 60_000 -
          (session.pausedDurationSec ?? 0) / 60,
      ),
    )

    return prisma.$transaction(async tx => {
      try {
        await tx.workSessionIdempotency.create({
          data: {
            userId,
            idempotencyKey,
            workSessionId: sessionId,
          },
        })
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          const duplicateKey = await tx.workSessionIdempotency.findUnique({
            where: {
              userId_idempotencyKey: { userId, idempotencyKey },
            },
          })
          if (duplicateKey) {
            const duplicateSession = await this.workSessionWithTask(
              userId,
              duplicateKey.workSessionId,
              tx,
            )
            if (duplicateSession) {
              return { session: duplicateSession, duplicate: true as const }
            }
          }
          // Concurrent completes: peer tx may have committed idempotency before this tx sees it.
          const fromCommitted = await this.findDuplicateByIdempotency(
            userId,
            idempotencyKey,
          )
          if (fromCommitted) {
            return { session: fromCommitted, duplicate: true as const }
          }
        }
        throw error
      }

      const updatedCount = await tx.workSession.updateMany({
        where: {
          id: sessionId,
          userId,
          isDeleted: false,
          state: { in: NON_TERMINAL_STATES },
        },
        data: {
          state: WorkSessionState.completed,
          endTime,
          duration: durationMin,
          rpeCognitive: body.rpeCognitive,
          frictionScore: body.frictionScore,
          frictionBlocker: body.frictionBlocker ?? null,
          energyAfter: body.energyAfter,
          perceivedFocus: body.perceivedFocus ?? null,
          perceivedProgress: body.perceivedProgress ?? null,
          timeFit: body.timeFit ?? null,
          notes: body.notes ?? null,
          ...(body.perceivedFocus !== null &&
          body.perceivedFocus !== undefined &&
          body.perceivedProgress !== null &&
          body.perceivedProgress !== undefined
            ? {
                focusScore: Math.min(10, Math.max(2, body.perceivedFocus * 2)),
                productivityScore: Math.min(
                  10,
                  Math.max(2, body.perceivedProgress * 2),
                ),
              }
            : { focusScore: null, productivityScore: null }),
        },
      })

      if (updatedCount.count === 0) {
        const current = await tx.workSession.findFirst({
          where: { id: sessionId, userId, isDeleted: false },
        })
        if (!current) {
          throw new WorkSessionHttpError('Work session not found', 404, 'NOT_FOUND')
        }
        if (current.state === WorkSessionState.completed) {
          const duplicateSession = await this.workSessionWithTask(userId, sessionId, tx)
          if (!duplicateSession) {
            throw new WorkSessionHttpError('Work session not found', 404, 'NOT_FOUND')
          }
          return { session: duplicateSession, duplicate: true as const }
        }
        throw new WorkSessionHttpError(
          'Session cannot be completed from this state',
          400,
          'INVALID_STATE',
        )
      }

      const updated = await this.workSessionWithTask(userId, sessionId, tx)
      if (!updated) {
        throw new WorkSessionHttpError('Work session not found', 404, 'NOT_FOUND')
      }

      return { session: updated, duplicate: false as const }
    })
  }

  async abandon(userId: string, sessionId: string) {
    const session = await prisma.workSession.findFirst({
      where: { id: sessionId, userId, isDeleted: false },
    })
    if (!session) {
      throw new WorkSessionHttpError('Work session not found', 404, 'NOT_FOUND')
    }
    if (
      session.state === WorkSessionState.completed ||
      session.state === WorkSessionState.abandoned
    ) {
      return this.workSessionWithTask(userId, sessionId)
    }
    if (!NON_TERMINAL_STATES.includes(session.state)) {
      throw new WorkSessionHttpError(
        'Session cannot be abandoned',
        400,
        'INVALID_STATE',
      )
    }

    return prisma.workSession.update({
      where: { id: sessionId },
      data: {
        state: WorkSessionState.abandoned,
        endTime: new Date(),
      },
      include: taskSelect,
    })
  }

  private async resolveTaskForWorkSession(userId: string, taskId: string) {
    return prisma.task.findFirst({
      where: { id: taskId, userId, isDeleted: false },
    })
  }
}
