/**
 * DB-level regression test for B1 (race condition in POST /work-sessions).
 */

import { type WorkSessionState } from '@prisma/client'
import { describe, expect, it } from 'vitest'

import { workerPrisma } from '../../setup/worker-context.ts'

async function seedUserAndTask(suffix: string) {
  const user = await workerPrisma.user.create({
    data: {
      email: `ws-race-${suffix}@example.com`,
      username: `ws-race-${suffix}`,
      passwordHash: 'hash',
      firstName: 'R',
      lastName: 'U',
    },
  })
  const task = await workerPrisma.task.create({
    data: { userId: user.id, title: 'Concurrency' },
  })
  return { user, task }
}

async function insertActiveBlock(userId: string, taskId: string) {
  return workerPrisma.workSession.create({
    data: {
      userId,
      taskId,
      startTime: new Date(),
      state: 'running',
      timerMode: 'pomodoro',
      targetDurationSec: 1500,
    },
  })
}

describe('work_sessions_active_per_user partial unique index (B1)', () => {
  it('rejects a second active INSERT for the same user', async () => {
    const { user, task } = await seedUserAndTask('1')
    await insertActiveBlock(user.id, task.id)

    await expect(insertActiveBlock(user.id, task.id)).rejects.toMatchObject({
      code: 'P2002',
    })
  })

  it.each<WorkSessionState>(['paused', 'on_break', 'pending_feedback'])(
    'also rejects when existing row is %s',
    async state => {
      const { user, task } = await seedUserAndTask(`state-${state}`)
      await workerPrisma.workSession.create({
        data: {
          userId: user.id,
          taskId: task.id,
          startTime: new Date(),
          state,
          timerMode: 'pomodoro',
          targetDurationSec: 1500,
        },
      })

      await expect(insertActiveBlock(user.id, task.id)).rejects.toMatchObject({
        code: 'P2002',
      })
    },
  )

  it('allows a new active block after the previous one is completed', async () => {
    const { user, task } = await seedUserAndTask('2')
    const first = await insertActiveBlock(user.id, task.id)
    await workerPrisma.workSession.update({
      where: { id: first.id },
      data: { state: 'completed', endTime: new Date() },
    })

    const second = await insertActiveBlock(user.id, task.id)
    expect(second.state).toBe('running')
  })

  it('allows a new active block after the previous one is soft-deleted', async () => {
    const { user, task } = await seedUserAndTask('3')
    const first = await insertActiveBlock(user.id, task.id)
    await workerPrisma.workSession.update({
      where: { id: first.id },
      data: { isDeleted: true },
    })

    const second = await insertActiveBlock(user.id, task.id)
    expect(second.state).toBe('running')
  })

  it('allows two concurrent users each to have an active block', async () => {
    const a = await seedUserAndTask('user-a')
    const b = await seedUserAndTask('user-b')

    const [resA, resB] = await Promise.all([
      insertActiveBlock(a.user.id, a.task.id),
      insertActiveBlock(b.user.id, b.task.id),
    ])
    expect(resA.userId).toBe(a.user.id)
    expect(resB.userId).toBe(b.user.id)
  })

  it('on truly concurrent INSERTs for the same user, exactly one wins', async () => {
    const { user, task } = await seedUserAndTask('concurrent')

    const results = await Promise.allSettled([
      insertActiveBlock(user.id, task.id),
      insertActiveBlock(user.id, task.id),
    ])

    const fulfilled = results.filter(r => r.status === 'fulfilled')
    const rejected = results.filter(r => r.status === 'rejected')
    expect(fulfilled).toHaveLength(1)
    expect(rejected).toHaveLength(1)
    const rejection = rejected[0]
    expect(rejection.reason).toMatchObject({ code: 'P2002' })
  })
})
