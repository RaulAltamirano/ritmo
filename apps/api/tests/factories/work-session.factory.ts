import type { WorkSession } from '@prisma/client'
import { WorkSessionState } from '@prisma/client'

import { workerPrisma } from '../setup/worker-context.ts'

export type WorkSessionCreateInput = {
  userId: string
  taskId: string
} & Partial<Pick<WorkSession, 'state' | 'startTime' | 'pausedDurationSec'>>

export function buildWorkSession(overrides: WorkSessionCreateInput): {
  userId: string
  taskId: string
  state: WorkSessionState
  startTime: Date
  pausedDurationSec: number
} {
  return {
    userId: overrides.userId,
    taskId: overrides.taskId,
    state: overrides.state ?? WorkSessionState.running,
    startTime: overrides.startTime ?? new Date(),
    pausedDurationSec: overrides.pausedDurationSec ?? 0,
  }
}

async function createWorkSession(
  overrides: WorkSessionCreateInput,
): Promise<WorkSession> {
  const data = buildWorkSession(overrides)
  return workerPrisma.workSession.create({
    data: {
      userId: data.userId,
      taskId: data.taskId,
      state: data.state,
      startTime: data.startTime,
      pausedDurationSec: data.pausedDurationSec,
    },
  })
}

export const workSessionFactory = {
  build: buildWorkSession,
  create: createWorkSession,
}
