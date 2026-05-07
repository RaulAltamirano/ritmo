import type { DailyCheckin } from '@prisma/client'

import { workerPrisma } from '../setup/worker-context.ts'

export type DailyCheckinCreateInput = {
  userId: string
} & Partial<Pick<DailyCheckin, 'calendarDate' | 'energy' | 'stress'>>

export function buildDailyCheckin(overrides: DailyCheckinCreateInput): {
  userId: string
  calendarDate: Date
  energy: number
  stress: number
} {
  return {
    userId: overrides.userId,
    calendarDate: overrides.calendarDate ?? new Date('2024-06-15T00:00:00.000Z'),
    energy: overrides.energy ?? 3,
    stress: overrides.stress ?? 2,
  }
}

async function createDailyCheckin(
  overrides: DailyCheckinCreateInput,
): Promise<DailyCheckin> {
  const data = buildDailyCheckin(overrides)
  return workerPrisma.dailyCheckin.create({
    data: {
      userId: data.userId,
      calendarDate: data.calendarDate,
      energy: data.energy,
      stress: data.stress,
    },
  })
}

export const dailyCheckinFactory = {
  build: buildDailyCheckin,
  create: createDailyCheckin,
}
