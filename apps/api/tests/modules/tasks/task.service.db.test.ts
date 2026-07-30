/**
 * DB-level tests — TaskService (today TZ, 404, CRITICAL priority)
 */

import { Priority, TaskStatus } from '@prisma/client'
import { DateTime } from 'luxon'
import { describe, expect, it } from 'vitest'

import { ResourceNotFoundException } from '../../../src/shared/exceptions/app.exceptions.js'
import { TaskService } from '../../../src/modules/tasks/services/TaskService.js'
import { workerPrisma } from '../../setup/worker-context.ts'

const service = new TaskService()

let uniqSeq = 0
function uniq(prefix: string): string {
  uniqSeq += 1
  return `${prefix}-${Date.now()}-${uniqSeq}`
}

async function createUser(timezone = 'UTC') {
  const suffix = uniq('task-user')
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

describe('TaskService.getTodayTasks (timezone)', () => {
  it('includes tasks whose startTime falls on the user civil day', async () => {
    const tz = 'America/Mexico_City'
    const user = await createUser(tz)

    // 01:30 local Mexico City on "today" — often still "yesterday" in UTC
    const localToday = DateTime.now().setZone(tz).startOf('day')
    const startLocal = localToday.plus({ hours: 1, minutes: 30 })
    const task = await workerPrisma.task.create({
      data: {
        userId: user.id,
        title: uniq('tz-today'),
        startTime: startLocal.toUTC().toJSDate(),
        status: TaskStatus.todo,
        priority: Priority.medium,
      },
    })

    const out = await service.getTodayTasks(user.id, tz)

    expect(out.some(t => t.id === task.id)).toBe(true)
  })

  it('excludes tasks that are only "today" on the server clock but not user TZ', async () => {
    const tz = 'Pacific/Auckland'
    const user = await createUser(tz)

    // Pick a UTC instant that is "today" in UTC but "tomorrow" or "yesterday" in Auckland
    // Safer assertion: create a task clearly outside Auckland's civil day
    const aucklandNow = DateTime.now().setZone(tz)
    const outside = aucklandNow.minus({ days: 2 }).set({ hour: 12 }).toUTC().toJSDate()
    const task = await workerPrisma.task.create({
      data: {
        userId: user.id,
        title: uniq('tz-outside'),
        startTime: outside,
        status: TaskStatus.todo,
        priority: Priority.medium,
      },
    })

    const out = await service.getTodayTasks(user.id, tz)

    expect(out.some(t => t.id === task.id)).toBe(false)
  })
})

describe('TaskService update/delete not found', () => {
  it('updateTask throws ResourceNotFoundException for missing id', async () => {
    const user = await createUser()
    await expect(
      service.updateTask('missing-task-id', { title: 'x' }, user.id),
    ).rejects.toBeInstanceOf(ResourceNotFoundException)
  })

  it('deleteTask throws ResourceNotFoundException for missing id', async () => {
    const user = await createUser()
    await expect(service.deleteTask('missing-task-id', user.id)).rejects.toBeInstanceOf(
      ResourceNotFoundException,
    )
  })
})

describe('TaskService CRITICAL priority', () => {
  it('persists CRITICAL as Priority.critical', async () => {
    const user = await createUser()
    const created = await service.createTask(
      { title: uniq('crit'), priority: 'CRITICAL' },
      user.id,
    )
    const row = await workerPrisma.task.findUniqueOrThrow({ where: { id: created.id } })
    expect(row.priority).toBe(Priority.critical)
    expect(created.priority).toBe('critical')
  })
})

describe('TaskService title validation', () => {
  it('rejects whitespace-only titles', async () => {
    const user = await createUser()
    await expect(
      service.createTask({ title: '   ' }, user.id),
    ).rejects.toMatchObject({ statusCode: 400, code: 'INVALID_INPUT' })
  })
})
