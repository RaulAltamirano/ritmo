import { beforeEach, describe, expect, it } from 'vitest'

import { seedTrainingCatalog } from '../../../scripts/database/seeds/trainingSeed.js'
import { TrainingLogService } from '../../../src/modules/training/services/TrainingLogService.js'
import { workerPrisma } from '../../setup/worker-context.ts'

let sequence = 0

async function createUser() {
  sequence += 1
  const suffix = `training-log-${Date.now()}-${sequence}`
  return workerPrisma.user.create({
    data: {
      email: `${suffix}@example.com`,
      username: suffix,
      passwordHash: 'hash',
      timezone: 'UTC',
    },
  })
}

const firstSets = [
  {
    id: 'set-1',
    index: 0,
    reps: 10,
    rpe: 8,
    load: 40,
    unit: 'kg' as const,
    completed: true,
  },
]

describe('TrainingLogService', () => {
  beforeEach(async () => {
    await seedTrainingCatalog(workerPrisma)
  })

  it('upserts one exercise log per user, day, and exercise', async () => {
    const service = new TrainingLogService()
    const user = await createUser()
    const exercise = await workerPrisma.exercise.findFirstOrThrow()

    await service.upsertLog(user.id, {
      dayKey: '2026-08-17',
      exerciseId: exercise.id,
      note: 'First note',
      sets: firstSets,
    })
    const updated = await service.upsertLog(user.id, {
      dayKey: '2026-08-17',
      exerciseId: exercise.id,
      note: 'Updated note',
      sets: [{ ...firstSets[0], reps: 12 }],
    })

    expect(updated).toEqual({
      dayKey: '2026-08-17',
      exerciseId: exercise.id,
      note: 'Updated note',
      sets: [{ ...firstSets[0], reps: 12 }],
    })
    await expect(
      workerPrisma.exerciseSetLog.count({
        where: { userId: user.id, dayKey: '2026-08-17', exerciseId: exercise.id },
      }),
    ).resolves.toBe(1)
  })

  it('lists only owned logs in the inclusive day range', async () => {
    const service = new TrainingLogService()
    const user = await createUser()
    const otherUser = await createUser()
    const exercise = await workerPrisma.exercise.findFirstOrThrow()

    await Promise.all([
      service.upsertLog(user.id, {
        dayKey: '2026-08-17',
        exerciseId: exercise.id,
        note: null,
        sets: firstSets,
      }),
      service.upsertLog(user.id, {
        dayKey: '2026-08-24',
        exerciseId: exercise.id,
        note: null,
        sets: firstSets,
      }),
      service.upsertLog(otherUser.id, {
        dayKey: '2026-08-18',
        exerciseId: exercise.id,
        note: null,
        sets: firstSets,
      }),
    ])

    await expect(
      service.listLogs(user.id, '2026-08-17', '2026-08-23'),
    ).resolves.toEqual([
      {
        dayKey: '2026-08-17',
        exerciseId: exercise.id,
        note: null,
        sets: firstSets,
      },
    ])
  })

  it('upserts session check phases without duplicate day rows', async () => {
    const service = new TrainingLogService()
    const user = await createUser()
    const start = { preparation: 4, motivation: 3, strength: 5 } as const
    const end = { fatigue: 2, pain: 1, strength: 4 } as const

    await service.upsertCheck(user.id, {
      dayKey: '2026-08-17',
      startStatus: 'saved',
      endStatus: 'none',
      start,
      end: null,
    })
    const updated = await service.upsertCheck(user.id, {
      dayKey: '2026-08-17',
      startStatus: 'saved',
      endStatus: 'saved',
      start,
      end,
    })

    expect(updated).toEqual({
      dayKey: '2026-08-17',
      startStatus: 'saved',
      endStatus: 'saved',
      start,
      end,
    })
    await expect(
      workerPrisma.trainingSessionCheck.count({
        where: { userId: user.id, dayKey: '2026-08-17' },
      }),
    ).resolves.toBe(1)
  })

  it('gets checks by day key without leaking another user', async () => {
    const service = new TrainingLogService()
    const user = await createUser()
    const otherUser = await createUser()

    await service.upsertCheck(user.id, {
      dayKey: '2026-08-17',
      startStatus: 'skipped',
      endStatus: 'none',
      start: null,
      end: null,
    })
    await service.upsertCheck(otherUser.id, {
      dayKey: '2026-08-18',
      startStatus: 'saved',
      endStatus: 'none',
      start: { preparation: 5, motivation: 5, strength: 5 },
      end: null,
    })

    await expect(
      service.getChecks(user.id, ['2026-08-17', '2026-08-18']),
    ).resolves.toEqual([
      {
        dayKey: '2026-08-17',
        startStatus: 'skipped',
        endStatus: 'none',
        start: null,
        end: null,
      },
    ])
  })
})
