/**
 * Job `runWorkSessionStaleAbandon`: 2× target cap 6h; no `pending_feedback`.
 */

import { describe, expect, it, vi } from 'vitest'

import { runWorkSessionStaleAbandon } from '../../../src/jobs/maintenance/workSessionStaleAbandon.js'
import { workerPrisma } from '../../setup/worker-context.ts'

async function seedUserTask(suffix: string) {
  const user = await workerPrisma.user.create({
    data: {
      email: `abandon-job-${suffix}@example.com`,
      username: `abandon-job-${suffix}`,
      passwordHash: 'hash',
      firstName: 'A',
      lastName: 'B',
    },
  })
  const task = await workerPrisma.task.create({
    data: { userId: user.id, title: 'T' },
  })
  return { user, task }
}

describe('runWorkSessionStaleAbandon', () => {
  it('marks running session abandoned when stale beyond 2× target_duration_sec', async () => {
    const { user, task } = await seedUserTask('stale-run')
    const targetSec = 120
    const thresholdMs = Math.min(2 * targetSec * 1000, 6 * 60 * 60 * 1000)
    const old = new Date(Date.now() - thresholdMs - 60_000)

    const ws = await workerPrisma.workSession.create({
      data: {
        userId: user.id,
        taskId: task.id,
        startTime: old,
        state: 'running',
        timerMode: 'pomodoro',
        targetDurationSec: targetSec,
        lastClientSeenAt: old,
      },
    })

    const r = await runWorkSessionStaleAbandon()
    expect(r.abandoned).toBeGreaterThanOrEqual(1)

    const row = await workerPrisma.workSession.findUnique({ where: { id: ws.id } })
    expect(row?.state).toBe('abandoned')
  })

  it('does not touch pending_feedback even when timestamps are stale', async () => {
    const { user, task } = await seedUserTask('pf')
    const ancient = new Date(Date.now() - 48 * 60 * 60 * 1000)

    const ws = await workerPrisma.workSession.create({
      data: {
        userId: user.id,
        taskId: task.id,
        startTime: ancient,
        state: 'pending_feedback',
        timerMode: 'pomodoro',
        targetDurationSec: 1500,
        lastClientSeenAt: ancient,
      },
    })

    await runWorkSessionStaleAbandon()

    const row = await workerPrisma.workSession.findUnique({ where: { id: ws.id } })
    expect(row?.state).toBe('pending_feedback')
  })

  it('uses 6h cap when 2× target exceeds six hours', async () => {
    vi.useFakeTimers()
    const now = new Date('2026-06-01T12:00:00.000Z')
    vi.setSystemTime(now)

    const { user, task } = await seedUserTask('cap')
    const targetSec = 20_000
    const thresholdMs = Math.min(2 * targetSec * 1000, 6 * 60 * 60 * 1000)
    const old = new Date(now.getTime() - thresholdMs - 60_000)

    const ws = await workerPrisma.workSession.create({
      data: {
        userId: user.id,
        taskId: task.id,
        startTime: old,
        state: 'paused',
        timerMode: 'ultradian',
        targetDurationSec: targetSec,
        lastClientSeenAt: old,
      },
    })

    await runWorkSessionStaleAbandon()

    const row = await workerPrisma.workSession.findUnique({ where: { id: ws.id } })
    expect(row?.state).toBe('abandoned')

    vi.useRealTimers()
  })
})
