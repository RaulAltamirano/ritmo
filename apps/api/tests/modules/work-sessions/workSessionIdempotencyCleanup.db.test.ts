import { describe, expect, it } from 'vitest'

import { runWorkSessionIdempotencyCleanup } from '../../../src/jobs/maintenance/workSessionIdempotencyCleanup.js'
import { workerPrisma } from '../../setup/worker-context.ts'

describe('runWorkSessionIdempotencyCleanup', () => {
  it('removes idempotency rows older than 24h', async () => {
    const user = await workerPrisma.user.create({
      data: {
        email: `idem-clean-${Date.now()}@example.com`,
        username: `idem-clean-${Date.now()}`,
        passwordHash: 'x',
        firstName: 'I',
        lastName: 'D',
      },
    })
    const task = await workerPrisma.task.create({
      data: { userId: user.id, title: 'x' },
    })
    const ws = await workerPrisma.workSession.create({
      data: {
        userId: user.id,
        taskId: task.id,
        startTime: new Date(),
        state: 'completed',
        timerMode: 'pomodoro',
        targetDurationSec: 60,
        endTime: new Date(),
      },
    })

    const old = new Date(Date.now() - 48 * 60 * 60 * 1000)
    await workerPrisma.workSessionIdempotency.create({
      data: {
        userId: user.id,
        idempotencyKey: `old-key-${Date.now()}`,
        workSessionId: ws.id,
        createdAt: old,
      },
    })

    const r = await runWorkSessionIdempotencyCleanup()
    expect(r.deleted).toBeGreaterThanOrEqual(1)

    const remaining = await workerPrisma.workSessionIdempotency.count({
      where: { workSessionId: ws.id },
    })
    expect(remaining).toBe(0)
  })

  it('preserves idempotency rows newer than 24h', async () => {
    const user = await workerPrisma.user.create({
      data: {
        email: `idem-keep-${Date.now()}@example.com`,
        username: `idem-keep-${Date.now()}`,
        passwordHash: 'x',
        firstName: 'I',
        lastName: 'K',
      },
    })
    const task = await workerPrisma.task.create({
      data: { userId: user.id, title: 'keep' },
    })
    const ws = await workerPrisma.workSession.create({
      data: {
        userId: user.id,
        taskId: task.id,
        startTime: new Date(),
        state: 'completed',
        timerMode: 'pomodoro',
        targetDurationSec: 60,
        endTime: new Date(),
      },
    })

    const recent = new Date(Date.now() - 60 * 60 * 1000)
    await workerPrisma.workSessionIdempotency.create({
      data: {
        userId: user.id,
        idempotencyKey: `recent-key-${Date.now()}`,
        workSessionId: ws.id,
        createdAt: recent,
      },
    })

    await runWorkSessionIdempotencyCleanup()

    const remaining = await workerPrisma.workSessionIdempotency.count({
      where: { workSessionId: ws.id },
    })
    expect(remaining).toBe(1)
  })
})
