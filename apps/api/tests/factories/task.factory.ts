import { faker } from '@faker-js/faker'

import type { Task } from '@prisma/client'

import { workerPrisma } from '../setup/worker-context.ts'

export type TaskCreateInput = {
  userId: string
} & Partial<Pick<Task, 'title' | 'startTime'>>

export function buildTask(overrides: TaskCreateInput): {
  userId: string
  title: string
  startTime: Date
} {
  return {
    userId: overrides.userId,
    title: overrides.title ?? faker.lorem.words({ min: 2, max: 5 }),
    startTime: overrides.startTime ?? new Date(),
  }
}

async function createTask(overrides: TaskCreateInput): Promise<Task> {
  const data = buildTask(overrides)
  return workerPrisma.task.create({
    data: {
      userId: data.userId,
      title: data.title,
      startTime: data.startTime,
    },
  })
}

export const taskFactory = {
  build: buildTask,
  create: createTask,
}
