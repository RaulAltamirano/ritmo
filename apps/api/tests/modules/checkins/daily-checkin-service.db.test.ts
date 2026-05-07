/**
 * DB-level tests for DailyCheckinService (B2: server-authoritative).
 */

import { DateTime } from 'luxon'
import { describe, expect, it } from 'vitest'

import { DailyCheckinService } from '../../../src/modules/checkins/services/DailyCheckinService.js'
import { workerPrisma } from '../../setup/worker-context.ts'

const service = new DailyCheckinService()

async function createUser(suffix: string, timezone = 'UTC') {
  return workerPrisma.user.create({
    data: {
      email: `checkin-${suffix}@example.com`,
      username: `checkin-${suffix}`,
      passwordHash: 'hash',
      firstName: 'C',
      lastName: 'U',
      timezone,
    },
  })
}

describe('DailyCheckinService.upsert — server-authoritative date', () => {
  it('creates a row using the user timezone civil date', async () => {
    const user = await createUser('new', 'UTC')
    const row = await service.upsert(user.id, 'UTC', { energy: 4, stress: 2 })

    const expectedYmd = DateTime.utc().toISODate()
    expect(row.calendarDate.toISOString().slice(0, 10)).toBe(expectedYmd)
    expect(row.energy).toBe(4)
    expect(row.stress).toBe(2)
  })

  it('is idempotent: second call updates the same row for the same civil day', async () => {
    const user = await createUser('idem', 'UTC')
    const first = await service.upsert(user.id, 'UTC', { energy: 3, stress: 3 })
    const second = await service.upsert(user.id, 'UTC', { energy: 5, stress: 1 })

    expect(second.id).toBe(first.id)
    expect(second.energy).toBe(5)
    expect(second.stress).toBe(1)

    const count = await workerPrisma.dailyCheckin.count({ where: { userId: user.id } })
    expect(count).toBe(1)
  })

  it('uses the user timezone (not UTC) to derive the civil date', async () => {
    const user = await createUser('tz', 'Pacific/Auckland')
    const row = await service.upsert(user.id, 'Pacific/Auckland', {
      energy: 3,
      stress: 3,
    })
    const expected = DateTime.now().setZone('Pacific/Auckland').toISODate()
    expect(row.calendarDate.toISOString().slice(0, 10)).toBe(expected)
  })
})

describe('DailyCheckinService.getByCalendarDate — historical read', () => {
  it('returns null when no check-in exists', async () => {
    const user = await createUser('empty')
    const ymd = DateTime.utc().toISODate()
    const row = await service.getByCalendarDate(user.id, ymd)
    expect(row).toBeNull()
  })

  it('returns the row when it exists', async () => {
    const user = await createUser('existing')
    await service.upsert(user.id, 'UTC', { energy: 2, stress: 4 })
    const ymd = DateTime.utc().toISODate()
    const row = await service.getByCalendarDate(user.id, ymd)
    expect(row?.energy).toBe(2)
    expect(row?.stress).toBe(4)
  })
})
