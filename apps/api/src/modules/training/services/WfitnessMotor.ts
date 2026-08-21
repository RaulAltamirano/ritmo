import type { BlockPhase, TrainingLevel } from '@prisma/client'

const PROGRAM_MATRIX: Record<TrainingLevel, Partial<Record<number, string>>> = {
  basic: {
    3: 'basic_1_0',
    4: 'basic_1_0',
    5: 'basic_2_0',
    6: 'basic_2_0',
  },
  intermediate: {
    3: 'intermediate_1_0',
    4: 'intermediate_2_0',
    5: 'intermediate_2_0',
    6: 'intermediate_2_0',
  },
  advanced: {
    3: 'intermediate_1_0',
    4: 'advanced_1_1',
    5: 'advanced_1_3',
    6: 'advanced_3_2',
  },
}

const WEEKDAY_OFFSETS: Partial<Record<number, number[]>> = {
  1: [0],
  2: [0, 3],
  3: [0, 2, 4],
  4: [0, 1, 3, 4],
  5: [0, 1, 2, 3, 4],
  6: [0, 1, 2, 3, 4, 5],
  7: [0, 1, 2, 3, 4, 5, 6],
}

export function selectProgramCode(level: TrainingLevel, daysPerWeek: number): string {
  const code = PROGRAM_MATRIX[level][daysPerWeek]
  if (!code) {
    throw new RangeError('daysPerWeek must be between 3 and 6')
  }
  return code
}

export function advanceBlock(profile: {
  blockPhase: BlockPhase
  weekInBlock: number
  blockLengthWeeks: number
}): { blockPhase: BlockPhase; weekInBlock: number } {
  if (profile.blockPhase === 'deload') {
    return { blockPhase: 'accumulation', weekInBlock: 1 }
  }
  if (profile.weekInBlock >= profile.blockLengthWeeks) {
    return { blockPhase: 'deload', weekInBlock: 1 }
  }
  return {
    blockPhase: 'accumulation',
    weekInBlock: profile.weekInBlock + 1,
  }
}

export function applyDeloadToSlot<
  T extends {
    setsReps: string
    targetRir: string
    targetRpe: string
  },
>(slot: T): T {
  return {
    ...slot,
    targetRir: '3–4',
    targetRpe: '6–7',
  }
}

export function weekdayOffsetsForDays(daysPerWeek: number): number[] {
  const offsets = WEEKDAY_OFFSETS[daysPerWeek]
  if (!offsets) {
    throw new RangeError('daysPerWeek must be between 1 and 7')
  }
  return [...offsets]
}
