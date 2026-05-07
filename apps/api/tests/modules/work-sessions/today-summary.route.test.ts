/**
 * Integration tests — GET /api/work-sessions/today-summary
 */

import type { Application } from 'express'
import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'
import { DateTime } from 'luxon'

import { createAuthedUser as makeAuthed } from '../../helpers/auth.ts'
import { app, authedHttp, defaultHeaders, workerPrisma } from '../../helpers/index.ts'

let expressApp: Application

beforeAll(async () => {
  expressApp = await app()
})

async function createAuthedUser() {
  const { user, accessToken } = await makeAuthed()
  return { userId: user.id, accessToken }
}

async function createTaskForUser(userId: string, title = 'Deep work') {
  return workerPrisma.task.create({ data: { userId, title } })
}

function unauthedGet(url: string) {
  return request(expressApp).get(url).set(defaultHeaders())
}

// Endpoint not yet mounted in `modules/work-sessions` routes; unskip when implemented.
describe.skip('GET /api/work-sessions/today-summary', () => {
  it('returns 401 when unauthenticated', async () => {
    const res = await unauthedGet('/api/work-sessions/today-summary')
    expect(res.status).toBe(401)
  })

  it('returns an empty summary for a fresh user', async () => {
    const { accessToken } = await createAuthedUser()
    const res = await authedHttp(expressApp, accessToken).get(
      '/api/work-sessions/today-summary',
    )
    expect(res.status).toBe(200)
    expect(res.body.data.totalSeconds).toBe(0)
    expect(res.body.data.perTask).toEqual({})
    expect(res.body.data.lastSessionEndedAt).toBeNull()
    expect(res.body.data.calendarDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('returns aggregated totals when sessions exist for today', async () => {
    const { userId, accessToken } = await createAuthedUser()
    const task = await createTaskForUser(userId)

    const start = DateTime.utc().startOf('day').plus({ hours: 10 }).toJSDate()
    const end = new Date(start.getTime() + 25 * 60_000)
    await workerPrisma.workSession.create({
      data: {
        userId,
        taskId: task.id,
        startTime: start,
        endTime: end,
        state: 'completed',
        timerMode: 'pomodoro',
        targetDurationSec: 1500,
        pausedDurationSec: 0,
        duration: 25,
      },
    })

    const res = await authedHttp(expressApp, accessToken).get(
      '/api/work-sessions/today-summary',
    )
    expect(res.status).toBe(200)
    expect(res.body.data.totalSeconds).toBe(25 * 60)
    expect(res.body.data.perTask[task.id]).toBe(25 * 60)
    expect(res.body.data.lastSessionEndedAt).toBe(end.toISOString())
  })
})
