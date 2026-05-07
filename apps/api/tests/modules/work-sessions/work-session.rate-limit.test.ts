/**
 * Límites express-rate-limit en rutas /work-sessions (spec §10: 20 POST/h, 6 PATCH/min).
 */

import type { Application } from 'express'
import { DateTime } from 'luxon'
import { beforeAll, describe, expect, it } from 'vitest'
import { createAuthedUser as makeAuthed } from '../../helpers/auth.ts'
import { app, authedHttp, workerPrisma } from '../../helpers/index.ts'

let expressApp: Application

beforeAll(async () => {
  expressApp = await app()
})

async function createAuthedUser() {
  const { user, accessToken } = await makeAuthed()
  return { userId: user.id, accessToken }
}

async function seedCheckinToday(userId: string) {
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

describe('Work-session route rate limits', () => {
  it('returns 429 on the 21st POST /api/work-sessions within the hourly window', async () => {
    const { userId, accessToken } = await createAuthedUser()
    await seedCheckinToday(userId)
    const task = await workerPrisma.task.create({
      data: { userId, title: 'Rate limit task' },
    })

    let sessionId: string | null = null
    let saw429 = false

    for (let i = 0; i < 22; i++) {
      if (sessionId) {
        await authedReq(accessToken).post(`/api/work-sessions/${sessionId}/abandon`)
        sessionId = null
      }

      const res = await authedReq(accessToken).post('/api/work-sessions').send({
        taskId: task.id,
        targetDurationSec: 120,
        timerMode: 'pomodoro',
      })

      if (res.status === 429) {
        saw429 = true
        expect(i).toBeGreaterThanOrEqual(20)
        break
      }

      expect(res.status).toBe(201)
      sessionId = res.body.data.id as string
    }

    expect(saw429).toBe(true)
  })

  it('returns 429 on the 7th PATCH /api/work-sessions/:id within one minute', async () => {
    const { userId, accessToken } = await createAuthedUser()
    await seedCheckinToday(userId)
    const task = await workerPrisma.task.create({
      data: { userId, title: 'Patch RL' },
    })

    const created = await authedReq(accessToken).post('/api/work-sessions').send({
      taskId: task.id,
      targetDurationSec: 600,
      timerMode: 'pomodoro',
    })
    expect(created.status).toBe(201)
    const id = created.body.data.id as string

    let lastStatus = 200
    for (let k = 0; k < 7; k++) {
      const patch = await authedReq(accessToken)
        .patch(`/api/work-sessions/${id}`)
        .send({
          lastClientSeenAt: new Date().toISOString(),
          pausedDurationSec: 0,
        })
      lastStatus = patch.status
      if (patch.status === 429) break
    }

    expect(lastStatus).toBe(429)
  })
})
