/**
 * DB-level tests — PlanService
 */

import { Priority, TaskStatus } from '@prisma/client'
import { describe, expect, it } from 'vitest'

import { ResourceNotFoundException } from '../../../src/shared/exceptions/app.exceptions.js'
import { PlanService } from '../../../src/modules/plans/services/PlanService.js'
import { TaskService } from '../../../src/modules/tasks/services/TaskService.js'
import { workerPrisma } from '../../setup/worker-context.ts'

const planService = new PlanService()
const taskService = new TaskService()

let uniqSeq = 0
function uniq(prefix: string): string {
  uniqSeq += 1
  return `${prefix}-${Date.now()}-${uniqSeq}`
}

async function createUser() {
  const suffix = uniq('plan-user')
  return workerPrisma.user.create({
    data: {
      email: `${suffix}@example.com`,
      username: suffix,
      passwordHash: 'hash',
      firstName: 'P',
      lastName: 'U',
      timezone: 'UTC',
    },
  })
}

describe('PlanService.createPlan / getPlans', () => {
  it('creates a plan and lists it with zero stats', async () => {
    const user = await createUser()
    const plan = await planService.createPlan(
      { name: 'Estudiar oratoria', description: 'Meta B2 speaking' },
      user.id,
    )
    expect(plan.name).toBe('Estudiar oratoria')
    expect(plan.status).toBe('planned')
    expect(plan.totalTasks).toBe(0)
    expect(plan.pendingTasks).toBe(0)
    expect(plan.progress).toBe(0)

    const list = await planService.getPlans(user.id)
    expect(list.some(p => p.id === plan.id)).toBe(true)
  })
})

describe('PlanService stats', () => {
  it('computes total, pending, and progress from non-deleted tasks', async () => {
    const user = await createUser()
    const plan = await planService.createPlan({ name: uniq('stats') }, user.id)

    await workerPrisma.task.create({
      data: {
        userId: user.id,
        planId: plan.id,
        title: uniq('done'),
        status: TaskStatus.completed,
        priority: Priority.medium,
        startTime: new Date(),
      },
    })
    await workerPrisma.task.create({
      data: {
        userId: user.id,
        planId: plan.id,
        title: uniq('todo'),
        status: TaskStatus.todo,
        priority: Priority.medium,
        startTime: new Date(),
      },
    })
    await workerPrisma.task.create({
      data: {
        userId: user.id,
        planId: plan.id,
        title: uniq('gone'),
        status: TaskStatus.todo,
        priority: Priority.medium,
        startTime: new Date(),
        isDeleted: true,
        deletedAt: new Date(),
      },
    })

    const detail = await planService.getPlan(plan.id, user.id)
    expect(detail.totalTasks).toBe(2)
    expect(detail.pendingTasks).toBe(1)
    expect(detail.progress).toBe(50)
  })
})

describe('PlanService.deletePlan cascade', () => {
  it('soft-deletes plan and its tasks; tasks disappear from TaskService.getTasks', async () => {
    const user = await createUser()
    const plan = await planService.createPlan({ name: uniq('cascade') }, user.id)
    const task = await workerPrisma.task.create({
      data: {
        userId: user.id,
        planId: plan.id,
        title: uniq('child'),
        status: TaskStatus.todo,
        priority: Priority.medium,
        startTime: new Date(),
      },
    })

    await planService.deletePlan(plan.id, user.id)

    await expect(planService.getPlan(plan.id, user.id)).rejects.toBeInstanceOf(
      ResourceNotFoundException,
    )

    const row = await workerPrisma.task.findUniqueOrThrow({ where: { id: task.id } })
    expect(row.isDeleted).toBe(true)
    expect(row.deletedAt).not.toBeNull()

    const tasks = await taskService.getTasks(user.id)
    expect(tasks.some(t => t.id === task.id)).toBe(false)
  })
})

describe('PlanService ownership', () => {
  it('returns 404-shaped error for another user plan', async () => {
    const owner = await createUser()
    const other = await createUser()
    const plan = await planService.createPlan({ name: uniq('owned') }, owner.id)

    await expect(planService.getPlan(plan.id, other.id)).rejects.toBeInstanceOf(
      ResourceNotFoundException,
    )
    await expect(planService.deletePlan(plan.id, other.id)).rejects.toBeInstanceOf(
      ResourceNotFoundException,
    )
  })
})

describe('PlanService.getPlanTasks', () => {
  it('lists only non-deleted tasks for the plan', async () => {
    const user = await createUser()
    const plan = await planService.createPlan({ name: uniq('tasks') }, user.id)
    const keep = await workerPrisma.task.create({
      data: {
        userId: user.id,
        planId: plan.id,
        title: uniq('keep'),
        status: TaskStatus.todo,
        priority: Priority.medium,
        startTime: new Date(),
      },
    })
    await workerPrisma.task.create({
      data: {
        userId: user.id,
        planId: plan.id,
        title: uniq('drop'),
        status: TaskStatus.todo,
        priority: Priority.medium,
        startTime: new Date(),
        isDeleted: true,
        deletedAt: new Date(),
      },
    })

    const out = await planService.getPlanTasks(plan.id, user.id)
    expect(out.map(t => t.id)).toEqual([keep.id])
  })
})

describe('PlanService.updatePlan', () => {
  it('updates name and status', async () => {
    const user = await createUser()
    const plan = await planService.createPlan({ name: uniq('old') }, user.id)
    const updated = await planService.updatePlan(
      plan.id,
      { name: 'Oratoria avanzada', status: 'active' },
      user.id,
    )
    expect(updated.name).toBe('Oratoria avanzada')
    expect(updated.status).toBe('active')
  })
})
