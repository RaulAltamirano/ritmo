/**
 * DB-level tests — WorkSessionService.getTodaySummary
 *
 * Exercises the timezone-aware aggregation that powers
 * GET /api/work-sessions/today-summary. Pure service test: no Express/auth.
 */

import { WorkSessionState } from '@prisma/client'
import { DateTime } from 'luxon'
import { describe, expect, it } from 'vitest'

import { WorkSessionService } from '../../../src/modules/work-sessions/services/WorkSessionService.js'
import { workerPrisma } from '../../setup/worker-context.ts'

const service = new WorkSessionService()

let uniqSeq = 0
function uniq(prefix: string): string {
  uniqSeq += 1
  return `${prefix}-${Date.now()}-${uniqSeq}`
}

async function createUser(timezone = 'UTC') {
  const suffix = uniq('tsum-user')
  return workerPrisma.user.create({
    data: {
      email: `${suffix}@example.com`,
      username: suffix,
      passwordHash: 'hash',
      firstName: 'T',
      lastName: 'U',
      timezone,
    },
  })
}

async function createTaskFor(userId: string, title?: string) {
  return workerPrisma.task.create({
    data: { userId, title: title ?? uniq('task') },
  })
}

describe('WorkSessionService.getTodaySummary', () => {
  it('returns zeros and null when the user has no sessions today', async () => {
    const user = await createUser('UTC')

    const out = await service.getTodaySummary(user.id, user.timezone)

    expect(out.totalSeconds).toBe(0)
    expect(out.perTask).toEqual({})
    expect(out.lastSessionEndedAt).toBeNull()
    expect(out.calendarDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('sums a completed session and subtracts paused time', async () => {
    const user = await createUser('UTC')
    const task = await createTaskFor(user.id)

    // Today 10:00–10:30 UTC, with 5m paused → 25m billable
    const today = DateTime.utc().startOf('day')
    const start = today.plus({ hours: 10 }).toJSDate()
    const end = today.plus({ hours: 10, minutes: 30 }).toJSDate()
    await workerPrisma.workSession.create({
      data: {
        userId: user.id,
        taskId: task.id,
        startTime: start,
        endTime: end,
        state: WorkSessionState.completed,
        timerMode: 'pomodoro',
        targetDurationSec: 1500,
        pausedDurationSec: 300,
        duration: 25,
      },
    })

    const out = await service.getTodaySummary(user.id, user.timezone)

    expect(out.perTask[task.id]).toBe(25 * 60)
    expect(out.totalSeconds).toBe(25 * 60)
    expect(out.lastSessionEndedAt).toBe(end.toISOString())
  })

  it('includes abandoned sessions in the total', async () => {
    const user = await createUser('UTC')
    const task = await createTaskFor(user.id)

    const today = DateTime.utc().startOf('day')
    const start = today.plus({ hours: 8 }).toJSDate()
    const end = today.plus({ hours: 8, minutes: 10 }).toJSDate()
    await workerPrisma.workSession.create({
      data: {
        userId: user.id,
        taskId: task.id,
        startTime: start,
        endTime: end,
        state: WorkSessionState.abandoned,
        timerMode: 'pomodoro',
        targetDurationSec: 1500,
        pausedDurationSec: 0,
      },
    })

    const out = await service.getTodaySummary(user.id, user.timezone)

    expect(out.totalSeconds).toBe(10 * 60)
    expect(out.perTask[task.id]).toBe(10 * 60)
  })

  it.each([
    WorkSessionState.running,
    WorkSessionState.paused,
    WorkSessionState.pending_feedback,
  ])('excludes %s sessions (not yet terminal)', async state => {
    // Partial unique index `work_sessions_active_per_user` allows only one
    // non-terminal session per user; isolate each state in its own user.
    const user = await createUser('UTC')
    const task = await createTaskFor(user.id)

    const today = DateTime.utc().startOf('day')
    await workerPrisma.workSession.create({
      data: {
        userId: user.id,
        taskId: task.id,
        startTime: today.plus({ hours: 9 }).toJSDate(),
        state,
        timerMode: 'pomodoro',
        targetDurationSec: 1500,
        pausedDurationSec: 0,
      },
    })

    const out = await service.getTodaySummary(user.id, user.timezone)

    expect(out.totalSeconds).toBe(0)
    expect(out.perTask).toEqual({})
    expect(out.lastSessionEndedAt).toBeNull()
  })

  it('excludes soft-deleted completed sessions', async () => {
    const user = await createUser('UTC')
    const task = await createTaskFor(user.id)

    const today = DateTime.utc().startOf('day')
    await workerPrisma.workSession.create({
      data: {
        userId: user.id,
        taskId: task.id,
        startTime: today.plus({ hours: 9 }).toJSDate(),
        endTime: today.plus({ hours: 9, minutes: 15 }).toJSDate(),
        state: WorkSessionState.completed,
        timerMode: 'pomodoro',
        targetDurationSec: 1500,
        pausedDurationSec: 0,
        isDeleted: true,
      },
    })

    const out = await service.getTodaySummary(user.id, user.timezone)

    expect(out.totalSeconds).toBe(0)
    expect(out.perTask).toEqual({})
    expect(out.lastSessionEndedAt).toBeNull()
  })

  it('groups seconds per task and surfaces the latest endTime', async () => {
    const user = await createUser('UTC')
    const taskA = await createTaskFor(user.id, 'A')
    const taskB = await createTaskFor(user.id, 'B')

    const today = DateTime.utc().startOf('day')
    const t0 = today.plus({ hours: 9 })
    const endA = t0.plus({ minutes: 10 }).toJSDate()
    const endB = t0.plus({ minutes: 30 }).toJSDate() // latest

    await workerPrisma.workSession.createMany({
      data: [
        {
          userId: user.id,
          taskId: taskA.id,
          startTime: t0.toJSDate(),
          endTime: endA,
          state: WorkSessionState.completed,
          timerMode: 'pomodoro',
          targetDurationSec: 600,
          pausedDurationSec: 0,
        },
        {
          userId: user.id,
          taskId: taskB.id,
          startTime: t0.plus({ minutes: 10 }).toJSDate(),
          endTime: endB,
          state: WorkSessionState.completed,
          timerMode: 'pomodoro',
          targetDurationSec: 1200,
          pausedDurationSec: 0,
        },
      ],
    })

    const out = await service.getTodaySummary(user.id, user.timezone)

    expect(out.perTask[taskA.id]).toBe(10 * 60)
    expect(out.perTask[taskB.id]).toBe(20 * 60)
    expect(out.totalSeconds).toBe(30 * 60)
    expect(out.lastSessionEndedAt).toBe(endB.toISOString())
  })

  it('scopes the window to the user timezone: includes today-local and excludes yesterday-local', async () => {
    const tz = 'Pacific/Auckland' // UTC+12/+13
    const user = await createUser(tz)
    const task = await createTaskFor(user.id)

    const todayLocal = DateTime.now().setZone(tz).startOf('day')
    const yestLocal = todayLocal.minus({ days: 1 })

    // Included: 10:00–10:25 Auckland today
    const inStart = todayLocal.plus({ hours: 10 }).toUTC().toJSDate()
    const inEnd = todayLocal.plus({ hours: 10, minutes: 25 }).toUTC().toJSDate()

    // Excluded: same window, but yesterday Auckland
    const outStart = yestLocal.plus({ hours: 10 }).toUTC().toJSDate()
    const outEnd = yestLocal.plus({ hours: 10, minutes: 25 }).toUTC().toJSDate()

    await workerPrisma.workSession.createMany({
      data: [
        {
          userId: user.id,
          taskId: task.id,
          startTime: inStart,
          endTime: inEnd,
          state: WorkSessionState.completed,
          timerMode: 'pomodoro',
          targetDurationSec: 1500,
          pausedDurationSec: 0,
        },
        {
          userId: user.id,
          taskId: task.id,
          startTime: outStart,
          endTime: outEnd,
          state: WorkSessionState.completed,
          timerMode: 'pomodoro',
          targetDurationSec: 1500,
          pausedDurationSec: 0,
        },
      ],
    })

    const out = await service.getTodaySummary(user.id, tz)

    expect(out.totalSeconds).toBe(25 * 60)
    expect(out.perTask[task.id]).toBe(25 * 60)
    expect(out.calendarDate).toBe(todayLocal.toISODate())
    expect(out.lastSessionEndedAt).toBe(inEnd.toISOString())
  })

  it('ignores sessions belonging to other users', async () => {
    const userA = await createUser('UTC')
    const userB = await createUser('UTC')
    const taskB = await createTaskFor(userB.id)

    const today = DateTime.utc().startOf('day')
    await workerPrisma.workSession.create({
      data: {
        userId: userB.id,
        taskId: taskB.id,
        startTime: today.plus({ hours: 9 }).toJSDate(),
        endTime: today.plus({ hours: 9, minutes: 20 }).toJSDate(),
        state: WorkSessionState.completed,
        timerMode: 'pomodoro',
        targetDurationSec: 1200,
        pausedDurationSec: 0,
      },
    })

    const out = await service.getTodaySummary(userA.id, userA.timezone)

    expect(out.totalSeconds).toBe(0)
    expect(out.perTask).toEqual({})
    expect(out.lastSessionEndedAt).toBeNull()
  })
})
