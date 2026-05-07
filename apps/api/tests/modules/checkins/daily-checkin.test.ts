/**
 * Integration tests — DailyCheckin module (spec §9, §12 post-B2)
 */

import type { Application } from 'express'
import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'
import { DateTime } from 'luxon'

import { createAuthedUser as makeAuthed } from '../../helpers/auth.ts'
import { app, authedHttp, getAuthHeaders } from '../../helpers/index.ts'

let expressApp: Application

beforeAll(async () => {
  expressApp = await app()
})

async function createAuthedUser(timezone = 'UTC') {
  const { user, accessToken } = await makeAuthed(
    timezone === 'UTC' ? undefined : { timezone },
  )
  return { userId: user.id, accessToken }
}

function authedReq(token: string) {
  return authedHttp(expressApp, token)
}

describe('DailyCheckin API', () => {
  it('GET returns 404 when no check-in exists for the date', async () => {
    const { accessToken } = await createAuthedUser()
    const today = DateTime.utc().toISODate()

    const res = await authedReq(accessToken).get(`/api/checkins/daily/${today}`)

    expect(res.status).toBe(404)
    expect(res.body.success).toBe(false)
  })

  it('PUT creates a check-in (server-authoritative date) and GET returns it', async () => {
    const { accessToken } = await createAuthedUser()
    const todayUtc = DateTime.utc().toISODate()

    const putRes = await authedReq(accessToken).put('/api/checkins/daily').send({
      energy: 4,
      stress: 2,
    })
    expect(putRes.status).toBe(200)
    expect(putRes.body.data.energy).toBe(4)
    expect(putRes.body.data.stress).toBe(2)
    expect(putRes.body.data.calendarDate).toBe(todayUtc)

    const getRes = await authedReq(accessToken).get(`/api/checkins/daily/${todayUtc}`)
    expect(getRes.status).toBe(200)
    expect(getRes.body.data.energy).toBe(4)
    expect(getRes.body.data.stress).toBe(2)
  })

  it('PUT upserts existing row (idempotent per calendar date)', async () => {
    const { accessToken } = await createAuthedUser()

    const first = await authedReq(accessToken).put('/api/checkins/daily').send({
      energy: 3,
      stress: 3,
    })
    expect(first.status).toBe(200)
    const firstId = first.body.data.id

    const second = await authedReq(accessToken).put('/api/checkins/daily').send({
      energy: 5,
      stress: 1,
    })
    expect(second.status).toBe(200)
    expect(second.body.data.id).toBe(firstId)
    expect(second.body.data.energy).toBe(5)
    expect(second.body.data.stress).toBe(1)
  })

  it('PUT rejects values out of 1–5 range', async () => {
    const { accessToken } = await createAuthedUser()

    const tooHigh = await authedReq(accessToken).put('/api/checkins/daily').send({
      energy: 6,
      stress: 3,
    })
    expect(tooHigh.status).toBe(400)

    const zero = await authedReq(accessToken).put('/api/checkins/daily').send({
      energy: 3,
      stress: 0,
    })
    expect(zero.status).toBe(400)
  })

  it('PUT derives calendarDate from the user timezone (not UTC)', async () => {
    const { accessToken } = await createAuthedUser('Europe/Madrid')
    const expected = DateTime.now().setZone('Europe/Madrid').toISODate()!

    const res = await authedReq(accessToken).put('/api/checkins/daily').send({
      energy: 3,
      stress: 3,
    })
    expect(res.status).toBe(200)
    expect(res.body.data.calendarDate).toBe(expected)
  })

  it('GET rejects calendarDate with bad format', async () => {
    const { accessToken } = await createAuthedUser()

    const res = await authedReq(accessToken).get('/api/checkins/daily/not-a-date')
    expect(res.status).toBe(400)
  })

  it('requires authentication', async () => {
    const today = DateTime.utc().toISODate()
    const res = await request(expressApp)
      .get(`/api/checkins/daily/${today}`)
      .set(getAuthHeaders())
    expect(res.status).toBe(401)
  })
})
