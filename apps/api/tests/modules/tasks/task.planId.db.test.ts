/**
 * DB-level tests — TaskService planId
 */

import { describe, expect, it } from 'vitest'

import { ResourceNotFoundException } from '../../../src/shared/exceptions/app.exceptions.js'
import { PlanService } from '../../../src/modules/plans/services/PlanService.js'
import { TaskService } from '../../../src/modules/tasks/services/TaskService.js'
import { workerPrisma } from '../../setup/worker-context.ts'

const taskService = new TaskService()
const planService = new PlanService()

let uniqSeq = 0
function uniq(prefix: string): string {
  uniqSeq += 1
  return `${prefix}-${Date.now()}-${uniqSeq}`
}

async function createUser() {
  const suffix = uniq('task-plan-user')
  return workerPrisma.user.create({
    data: {
      email: `${suffix}@example.com`,
      username: suffix,
      passwordHash: 'hash',
      firstName: 'T',
      lastName: 'P',
      timezone: 'UTC',
    },
  })
}

describe('TaskService planId', () => {
  it('creates a task linked to a plan and returns planId', async () => {
    const user = await createUser()
    const plan = await planService.createPlan({ name: uniq('link') }, user.id)
    const task = await taskService.createTask(
      { title: uniq('speech'), planId: plan.id },
      user.id,
    )
    expect(task.planId).toBe(plan.id)
  })

  it('rejects planId belonging to another user', async () => {
    const owner = await createUser()
    const other = await createUser()
    const plan = await planService.createPlan({ name: uniq('foreign') }, owner.id)

    await expect(
      taskService.createTask({ title: uniq('x'), planId: plan.id }, other.id),
    ).rejects.toBeInstanceOf(ResourceNotFoundException)
  })

  it('rejects soft-deleted plan', async () => {
    const user = await createUser()
    const plan = await planService.createPlan({ name: uniq('dead') }, user.id)
    await planService.deletePlan(plan.id, user.id)

    await expect(
      taskService.createTask({ title: uniq('x'), planId: plan.id }, user.id),
    ).rejects.toBeInstanceOf(ResourceNotFoundException)
  })

  it('clears planId on update with null', async () => {
    const user = await createUser()
    const plan = await planService.createPlan({ name: uniq('clear') }, user.id)
    const task = await taskService.createTask(
      { title: uniq('t'), planId: plan.id },
      user.id,
    )
    const updated = await taskService.updateTask(task.id, { planId: null }, user.id)
    expect(updated.planId == null).toBe(true)
  })

  it('getPlanTasks includes planId', async () => {
    const user = await createUser()
    const plan = await planService.createPlan({ name: uniq('list') }, user.id)
    const task = await taskService.createTask(
      { title: uniq('t'), planId: plan.id },
      user.id,
    )
    const list = await planService.getPlanTasks(plan.id, user.id)
    expect(list.find(t => t.id === task.id)?.planId).toBe(plan.id)
  })
})
