/**
 * Integration tests — WorkSession module (spec §8–§11, §15)
 *
 * Covers:
 *  - POST create with 412 checkin_required gate
 *  - POST create with 409 conflict on existing active block
 *  - GET /active returns null (never 404) and restores active block
 *  - GET list with filters
 *  - PATCH heartbeat / pause / resume
 *  - POST complete idempotency via Idempotency-Key
 *  - POST abandon idempotent
 */

import type { Application } from 'express'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { DateTime } from 'luxon'
import { createAuthedUser as createAuthedUserWithSession } from '../../helpers/auth.ts'
import { app, authedHttp, workerPrisma } from '../../helpers/index.ts'

let expressApp: Application

beforeAll(async () => {
  expressApp = await app()
})

/** DB user + UserSession + JWT (middleware looks up `user_sessions` by token sessionId). */
async function createAuthedUser(options?: { timezone?: string }) {
  const { user, accessToken } = await createAuthedUserWithSession(
    options?.timezone ? { timezone: options.timezone } : undefined,
  )
  return { userId: user.id, accessToken }
}

/** Body MVP para `POST …/complete` (§5.3); perceived/timeFit opcionales si se prueba instrumentación. */
function validCompleteBody(overrides: Record<string, unknown> = {}) {
  return {
    rpeCognitive: 3,
    frictionScore: 2,
    energyAfter: 4,
    ...overrides,
  }
}

async function createActiveWorkSessionBlock(): Promise<{
  id: string
  accessToken: string
}> {
  const { userId, accessToken } = await createAuthedUser()
  const task = await createTaskForUser(userId)
  await seedCheckinForToday(userId)
  const created = await authedReq(accessToken).post('/api/work-sessions').send({
    taskId: task.id,
    targetDurationSec: 1500,
    timerMode: 'pomodoro',
  })
  return { id: created.body.data.id, accessToken }
}

async function seedCompletedSession(userId: string, taskId: string, startTime: Date) {
  return workerPrisma.workSession.create({
    data: {
      userId,
      taskId,
      startTime,
      state: 'completed',
      timerMode: 'pomodoro',
      targetDurationSec: 1500,
      pausedDurationSec: 0,
    },
  })
}

async function createTaskForUser(userId: string, title = 'Deep work') {
  return workerPrisma.task.create({ data: { userId, title } })
}

async function seedCheckinForToday(userId: string) {
  const today = DateTime.utc().startOf('day').toJSDate()
  return workerPrisma.dailyCheckin.upsert({
    where: { userId_calendarDate: { userId, calendarDate: today } },
    create: { userId, calendarDate: today, energy: 3, stress: 3 },
    update: { energy: 3, stress: 3 },
  })
}

function authedReq(token: string) {
  return authedHttp(expressApp, token)
}

describe('WorkSession API', () => {
  let prevDailyCheckinGate: string | undefined

  beforeAll(() => {
    prevDailyCheckinGate = process.env.FEATURE_DAILY_CHECKIN_GATE
  })

  afterAll(() => {
    if (prevDailyCheckinGate === undefined) {
      delete process.env.FEATURE_DAILY_CHECKIN_GATE
    } else {
      process.env.FEATURE_DAILY_CHECKIN_GATE = prevDailyCheckinGate
    }
  })

  beforeEach(() => {
    process.env.FEATURE_DAILY_CHECKIN_GATE = 'true'
  })

  describe('POST /api/work-sessions', () => {
    it('rejects with 412 checkin_required when no DailyCheckin for today', async () => {
      const { userId, accessToken } = await createAuthedUser()
      const task = await createTaskForUser(userId)

      const res = await authedReq(accessToken).post('/api/work-sessions').send({
        taskId: task.id,
        targetDurationSec: 1500,
        timerMode: 'pomodoro',
      })

      expect(res.status).toBe(412)
      expect(res.body.error.code).toBe('checkin_required')
      expect(res.body.error.calendarDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('creates running block when check-in exists and task belongs to user', async () => {
      const { userId, accessToken } = await createAuthedUser()
      const task = await createTaskForUser(userId)
      await seedCheckinForToday(userId)

      const res = await authedReq(accessToken).post('/api/work-sessions').send({
        taskId: task.id,
        targetDurationSec: 1500,
        timerMode: 'pomodoro',
        presetKey: 'pomodoro-25-5',
      })

      expect(res.status).toBe(201)
      expect(res.body.data.state).toBe('running')
      expect(res.body.data.taskId).toBe(task.id)
      expect(res.body.data.targetDurationSec).toBe(1500)
    })

    it('returns 409 with activeSessionId when another block is active', async () => {
      const { userId, accessToken } = await createAuthedUser()
      const task = await createTaskForUser(userId)
      await seedCheckinForToday(userId)

      const first = await authedReq(accessToken).post('/api/work-sessions').send({
        taskId: task.id,
        targetDurationSec: 1500,
        timerMode: 'pomodoro',
      })
      expect(first.status).toBe(201)

      const second = await authedReq(accessToken).post('/api/work-sessions').send({
        taskId: task.id,
        targetDurationSec: 1500,
        timerMode: 'pomodoro',
      })

      expect(second.status).toBe(409)
      expect(second.body.error.code).toBe('WORK_SESSION_CONFLICT')
      expect(second.body.error.activeSessionId).toBe(first.body.data.id)
      expect(second.body.error.state).toBe('running')
    })

    it('rejects taskId that does not belong to the user', async () => {
      const { userId, accessToken } = await createAuthedUser()
      const { userId: otherUserId } = await createAuthedUser()
      const otherTask = await createTaskForUser(otherUserId)
      await seedCheckinForToday(userId)

      const res = await authedReq(accessToken).post('/api/work-sessions').send({
        taskId: otherTask.id,
        targetDurationSec: 1500,
        timerMode: 'pomodoro',
      })

      expect([404, 412]).toContain(res.status)
    })
  })

  describe('GET /api/work-sessions/active', () => {
    it('returns data: null when no active block exists (never 404)', async () => {
      const { accessToken } = await createAuthedUser()

      const res = await authedReq(accessToken).get('/api/work-sessions/active')

      expect(res.status).toBe(200)
      expect(res.body.data.data).toBeNull()
    })

    it('returns the running block when one exists', async () => {
      const { userId, accessToken } = await createAuthedUser()
      const task = await createTaskForUser(userId)
      await seedCheckinForToday(userId)

      const created = await authedReq(accessToken).post('/api/work-sessions').send({
        taskId: task.id,
        targetDurationSec: 1500,
        timerMode: 'pomodoro',
      })

      const res = await authedReq(accessToken).get('/api/work-sessions/active')

      expect(res.status).toBe(200)
      expect(res.body.data.data.id).toBe(created.body.data.id)
      expect(res.body.data.data.state).toBe('running')
    })
  })

  describe('PATCH /api/work-sessions/:id', () => {
    it('updates lastClientSeenAt on heartbeat', async () => {
      const { userId, accessToken } = await createAuthedUser()
      const task = await createTaskForUser(userId)
      await seedCheckinForToday(userId)
      const created = await authedReq(accessToken).post('/api/work-sessions').send({
        taskId: task.id,
        targetDurationSec: 1500,
        timerMode: 'pomodoro',
      })
      const { id } = created.body.data

      const now = new Date().toISOString()
      const res = await authedReq(accessToken).patch(`/api/work-sessions/${id}`).send({
        lastClientSeenAt: now,
      })

      expect(res.status).toBe(200)
      const row = await workerPrisma.workSession.findUnique({ where: { id } })
      expect(row?.lastClientSeenAt?.toISOString()).toBe(now)
    })

    it('transitions to paused and back to running', async () => {
      const { userId, accessToken } = await createAuthedUser()
      const task = await createTaskForUser(userId)
      await seedCheckinForToday(userId)
      const created = await authedReq(accessToken).post('/api/work-sessions').send({
        taskId: task.id,
        targetDurationSec: 1500,
        timerMode: 'pomodoro',
      })
      const { id } = created.body.data

      const paused = await authedReq(accessToken)
        .patch(`/api/work-sessions/${id}`)
        .send({
          state: 'paused',
          pausedDurationSec: 30,
        })
      expect(paused.status).toBe(200)
      expect(paused.body.data.state).toBe('paused')

      const resumed = await authedReq(accessToken)
        .patch(`/api/work-sessions/${id}`)
        .send({
          state: 'running',
        })
      expect(resumed.status).toBe(200)
      expect(resumed.body.data.state).toBe('running')
    })

    it('PATCH to on_break sets breakStartedAt; then pending_feedback', async () => {
      const { userId, accessToken } = await createAuthedUser()
      const task = await createTaskForUser(userId)
      await seedCheckinForToday(userId)
      const created = await authedReq(accessToken).post('/api/work-sessions').send({
        taskId: task.id,
        targetDurationSec: 1500,
        timerMode: 'pomodoro',
        breakDurationSec: 300,
      })
      const { id } = created.body.data

      const patchBreak = await authedReq(accessToken)
        .patch(`/api/work-sessions/${id}`)
        .send({
          state: 'on_break',
          pausedDurationSec: 0,
          lastClientSeenAt: new Date().toISOString(),
        })
      expect(patchBreak.status).toBe(200)
      expect(patchBreak.body.data.state).toBe('on_break')
      expect(patchBreak.body.data.breakStartedAt).toBeTruthy()

      const patchFb = await authedReq(accessToken)
        .patch(`/api/work-sessions/${id}`)
        .send({
          state: 'pending_feedback',
          lastClientSeenAt: new Date().toISOString(),
        })
      expect(patchFb.status).toBe(200)
      expect(patchFb.body.data.state).toBe('pending_feedback')
    })

    it('rejects on_break when breakDurationSec is 0', async () => {
      const { userId, accessToken } = await createAuthedUser()
      const task = await createTaskForUser(userId)
      await seedCheckinForToday(userId)
      const created = await authedReq(accessToken).post('/api/work-sessions').send({
        taskId: task.id,
        targetDurationSec: 1500,
        timerMode: 'pomodoro',
        breakDurationSec: 0,
      })
      const { id } = created.body.data

      const res = await authedReq(accessToken).patch(`/api/work-sessions/${id}`).send({
        state: 'on_break',
        pausedDurationSec: 0,
        lastClientSeenAt: new Date().toISOString(),
      })
      expect(res.status).toBe(400)
      expect(res.body.error.code).toBe('INVALID_STATE')
    })

    it('rejects pending_feedback from running when breakDurationSec > 0', async () => {
      const { userId, accessToken } = await createAuthedUser()
      const task = await createTaskForUser(userId)
      await seedCheckinForToday(userId)
      const created = await authedReq(accessToken).post('/api/work-sessions').send({
        taskId: task.id,
        targetDurationSec: 1500,
        timerMode: 'pomodoro',
        breakDurationSec: 300,
      })
      const { id } = created.body.data

      const res = await authedReq(accessToken).patch(`/api/work-sessions/${id}`).send({
        state: 'pending_feedback',
        lastClientSeenAt: new Date().toISOString(),
      })
      expect(res.status).toBe(400)
      expect(res.body.error.code).toBe('INVALID_STATE')
    })
  })

  describe('POST /api/work-sessions/:id/complete', () => {
    it('requires Idempotency-Key header', async () => {
      const { id, accessToken } = await createActiveWorkSessionBlock()

      const res = await authedReq(accessToken)
        .post(`/api/work-sessions/${id}/complete`)
        .send(validCompleteBody())

      expect(res.status).toBe(400)
    })

    it('completes the block and sets state=completed', async () => {
      const { id, accessToken } = await createActiveWorkSessionBlock()

      const res = await authedReq(accessToken)
        .post(`/api/work-sessions/${id}/complete`)
        .set('Idempotency-Key', 'key-complete-happy-12345')
        .send(validCompleteBody({ notes: 'Clean block' }))

      expect(res.status).toBe(200)
      expect(res.body.data.session.state).toBe('completed')
      expect(res.body.data.session.rpeCognitive).toBe(3)
      expect(res.body.data.session.notes).toBe('Clean block')
      expect(res.body.data.duplicate).toBe(false)
    })

    it('is idempotent: second POST with same Idempotency-Key returns duplicate=true and does not change metrics', async () => {
      const { id, accessToken } = await createActiveWorkSessionBlock()
      const key = 'idem-key-abcdef123456'

      const first = await authedReq(accessToken)
        .post(`/api/work-sessions/${id}/complete`)
        .set('Idempotency-Key', key)
        .send(validCompleteBody())
      expect(first.status).toBe(200)

      const second = await authedReq(accessToken)
        .post(`/api/work-sessions/${id}/complete`)
        .set('Idempotency-Key', key)
        .send(
          validCompleteBody({
            // different body on purpose — server must ignore it
            rpeCognitive: 5,
            frictionScore: 5,
            energyAfter: 1,
            perceivedFocus: 1,
            perceivedProgress: 1,
          }),
        )

      expect(second.status).toBe(200)
      expect(second.body.data.duplicate).toBe(true)
      expect(second.body.data.session.rpeCognitive).toBe(3)
      expect(second.body.data.session.frictionScore).toBe(2)
      expect(second.body.data.session.energyAfter).toBe(4)
    })

    it('concurrent POST with same Idempotency-Key: both 200 and exactly one duplicate', async () => {
      const { id, accessToken } = await createActiveWorkSessionBlock()
      const key = `idem-concurrent-${Date.now()}-${Math.random().toString(36).slice(2)}`
      const body = validCompleteBody({ notes: 'concurrent complete' })

      const [a, b] = await Promise.all([
        authedReq(accessToken)
          .post(`/api/work-sessions/${id}/complete`)
          .set('Idempotency-Key', key)
          .send(body),
        authedReq(accessToken)
          .post(`/api/work-sessions/${id}/complete`)
          .set('Idempotency-Key', key)
          .send(body),
      ])

      expect(a.status).toBe(200)
      expect(b.status).toBe(200)
      const sorted = [a, b].sort(
        (x, y) => Number(x.body.data.duplicate) - Number(y.body.data.duplicate),
      )
      expect(sorted[0].body.data.duplicate).toBe(false)
      expect(sorted[1].body.data.duplicate).toBe(true)
      expect(sorted[0].body.data.session.state).toBe('completed')
      expect(sorted[1].body.data.session.state).toBe('completed')
      expect(sorted[0].body.data.session.id).toBe(id)
      expect(sorted[1].body.data.session.id).toBe(id)

      const row = await workerPrisma.workSession.findUnique({ where: { id } })
      expect(row?.state).toBe('completed')
    })

    it('rejects notes longer than 500 characters', async () => {
      const { id, accessToken } = await createActiveWorkSessionBlock()

      const res = await authedReq(accessToken)
        .post(`/api/work-sessions/${id}/complete`)
        .set('Idempotency-Key', 'key-notes-too-long')
        .send(validCompleteBody({ notes: 'x'.repeat(501) }))

      expect(res.status).toBe(400)
    })

    it('accepts optional fields (frictionBlocker, notes, timeFit) and persists notes', async () => {
      const { id, accessToken } = await createActiveWorkSessionBlock()

      const res = await authedReq(accessToken)
        .post(`/api/work-sessions/${id}/complete`)
        .set('Idempotency-Key', 'key-with-optionals-9876')
        .send(
          validCompleteBody({
            rpeCognitive: 4,
            frictionScore: 3,
            energyAfter: 3,
            perceivedFocus: 4,
            perceivedProgress: 3,
            frictionBlocker: 'distractions',
            notes: 'Ruido en casa',
            timeFit: 'mixed',
          }),
        )

      expect(res.status).toBe(200)
      expect(res.body.data.session.frictionBlocker).toBe('distractions')
      expect(res.body.data.session.notes).toBe('Ruido en casa')
      expect(res.body.data.session.timeFit).toBe('mixed')
    })
  })

  describe('POST /api/work-sessions/:id/abandon', () => {
    it('marks the block as abandoned and is idempotent', async () => {
      const { userId, accessToken } = await createAuthedUser()
      const task = await createTaskForUser(userId)
      await seedCheckinForToday(userId)
      const created = await authedReq(accessToken).post('/api/work-sessions').send({
        taskId: task.id,
        targetDurationSec: 1500,
        timerMode: 'pomodoro',
      })
      const { id } = created.body.data

      const first = await authedReq(accessToken).post(
        `/api/work-sessions/${id}/abandon`,
      )
      expect(first.status).toBe(200)
      expect(first.body.data.state).toBe('abandoned')

      const second = await authedReq(accessToken).post(
        `/api/work-sessions/${id}/abandon`,
      )
      expect(second.status).toBe(200)
      expect(second.body.data.state).toBe('abandoned')
    })
  })

  describe('GET /api/work-sessions', () => {
    it('filters by state and returns paginated items', async () => {
      const { userId, accessToken } = await createAuthedUser()
      const task = await createTaskForUser(userId)
      await seedCheckinForToday(userId)

      // Create and abandon one block to have a historical row
      const b1 = await authedReq(accessToken).post('/api/work-sessions').send({
        taskId: task.id,
        targetDurationSec: 1500,
        timerMode: 'pomodoro',
      })
      await authedReq(accessToken).post(`/api/work-sessions/${b1.body.data.id}/abandon`)

      const res = await authedReq(accessToken).get(
        '/api/work-sessions?state=abandoned&limit=10',
      )

      expect(res.status).toBe(200)
      expect(Array.isArray(res.body.data.items)).toBe(true)
      expect(res.body.data.items.length).toBeGreaterThan(0)
      expect(res.body.data.items[0].state).toBe('abandoned')
    })

    it('rejects invalid state filter with 400', async () => {
      const { accessToken } = await createAuthedUser()
      const res = await authedReq(accessToken).get('/api/work-sessions?state=bogus')
      expect(res.status).toBe(400)
    })
  })

  describe('GET /api/work-sessions from/to timezone boundaries', () => {
    it('America/Mexico_City: from=to filters by civil day in user TZ', async () => {
      const tz = 'America/Mexico_City'
      const { userId, accessToken } = await createAuthedUser({ timezone: tz })
      const task = await createTaskForUser(userId)
      const ymd = '2024-06-15'
      const inside = DateTime.fromObject(
        { year: 2024, month: 6, day: 15, hour: 14 },
        { zone: tz },
      )
        .toUTC()
        .toJSDate()
      const outside = DateTime.fromObject(
        { year: 2024, month: 6, day: 16, hour: 1 },
        { zone: tz },
      )
        .toUTC()
        .toJSDate()
      const inRow = await seedCompletedSession(userId, task.id, inside)
      const outRow = await seedCompletedSession(userId, task.id, outside)

      const res = await authedReq(accessToken).get(
        `/api/work-sessions?from=${ymd}&to=${ymd}&limit=50`,
      )
      expect(res.status).toBe(200)
      const ids = (res.body.data.items as Array<{ id: string }>).map(i => i.id)
      expect(ids).toContain(inRow.id)
      expect(ids).not.toContain(outRow.id)
    })

    it('UTC: from=to filters by civil day in UTC for that user', async () => {
      const { userId, accessToken } = await createAuthedUser({ timezone: 'UTC' })
      const task = await createTaskForUser(userId)
      const ymd = '2024-06-15'
      const insideUtc = DateTime.fromObject(
        { year: 2024, month: 6, day: 15, hour: 12 },
        { zone: 'utc' },
      ).toJSDate()
      const outsideUtc = DateTime.fromObject(
        { year: 2024, month: 6, day: 16, hour: 1 },
        { zone: 'utc' },
      ).toJSDate()
      const inRow = await seedCompletedSession(userId, task.id, insideUtc)
      const outRow = await seedCompletedSession(userId, task.id, outsideUtc)

      const res = await authedReq(accessToken).get(
        `/api/work-sessions?from=${ymd}&to=${ymd}&limit=50`,
      )
      expect(res.status).toBe(200)
      const ids = (res.body.data.items as Array<{ id: string }>).map(i => i.id)
      expect(ids).toContain(inRow.id)
      expect(ids).not.toContain(outRow.id)
    })
  })

  describe('Critical journey (API / Supertest)', () => {
    it('412 → PUT check-in → start → 409 → abandon → active null → start again', async () => {
      const { userId, accessToken } = await createAuthedUser()
      const task = await createTaskForUser(userId)

      const blocked = await authedReq(accessToken).post('/api/work-sessions').send({
        taskId: task.id,
        targetDurationSec: 1500,
        timerMode: 'pomodoro',
      })
      expect(blocked.status).toBe(412)
      expect(blocked.body.error.code).toBe('checkin_required')

      const saved = await authedReq(accessToken).put('/api/checkins/daily').send({
        energy: 3,
        stress: 3,
      })
      expect(saved.status).toBe(200)

      const first = await authedReq(accessToken).post('/api/work-sessions').send({
        taskId: task.id,
        targetDurationSec: 1500,
        timerMode: 'pomodoro',
      })
      expect(first.status).toBe(201)
      const sessionA = first.body.data.id as string

      const active1 = await authedReq(accessToken).get('/api/work-sessions/active')
      expect(active1.status).toBe(200)
      expect(active1.body.data.data?.id).toBe(sessionA)

      const conflict = await authedReq(accessToken).post('/api/work-sessions').send({
        taskId: task.id,
        targetDurationSec: 1500,
        timerMode: 'pomodoro',
      })
      expect(conflict.status).toBe(409)
      expect(conflict.body.error.activeSessionId).toBe(sessionA)

      const abandoned = await authedReq(accessToken).post(
        `/api/work-sessions/${sessionA}/abandon`,
      )
      expect(abandoned.status).toBe(200)
      expect(abandoned.body.data.state).toBe('abandoned')

      const active2 = await authedReq(accessToken).get('/api/work-sessions/active')
      expect(active2.status).toBe(200)
      expect(active2.body.data.data).toBeNull()

      const second = await authedReq(accessToken).post('/api/work-sessions').send({
        taskId: task.id,
        targetDurationSec: 1500,
        timerMode: 'pomodoro',
      })
      expect(second.status).toBe(201)
      expect(second.body.data.id).not.toBe(sessionA)
      expect(second.body.data.state).toBe('running')
    })

    it('412 → PUT check-in → start → 409 → complete → active null → start again', async () => {
      const { userId, accessToken } = await createAuthedUser()
      const task = await createTaskForUser(userId)

      const blocked = await authedReq(accessToken).post('/api/work-sessions').send({
        taskId: task.id,
        targetDurationSec: 1500,
        timerMode: 'pomodoro',
      })
      expect(blocked.status).toBe(412)

      await authedReq(accessToken).put('/api/checkins/daily').send({
        energy: 3,
        stress: 3,
      })

      const first = await authedReq(accessToken).post('/api/work-sessions').send({
        taskId: task.id,
        targetDurationSec: 1500,
        timerMode: 'pomodoro',
      })
      expect(first.status).toBe(201)
      const sessionA = first.body.data.id as string

      const conflict = await authedReq(accessToken).post('/api/work-sessions').send({
        taskId: task.id,
        targetDurationSec: 1500,
        timerMode: 'pomodoro',
      })
      expect(conflict.status).toBe(409)

      const pf = await authedReq(accessToken)
        .patch(`/api/work-sessions/${sessionA}`)
        .send({
          state: 'pending_feedback',
        })
      expect(pf.status).toBe(200)

      const done = await authedReq(accessToken)
        .post(`/api/work-sessions/${sessionA}/complete`)
        .set('Idempotency-Key', `journey-complete-${Date.now()}`)
        .send(validCompleteBody({ notes: 'journey' }))
      expect(done.status).toBe(200)
      expect(done.body.data.session.state).toBe('completed')

      const active = await authedReq(accessToken).get('/api/work-sessions/active')
      expect(active.status).toBe(200)
      expect(active.body.data.data).toBeNull()

      const second = await authedReq(accessToken).post('/api/work-sessions').send({
        taskId: task.id,
        targetDurationSec: 1500,
        timerMode: 'pomodoro',
      })
      expect(second.status).toBe(201)
      expect(second.body.data.state).toBe('running')
    })
  })
})
