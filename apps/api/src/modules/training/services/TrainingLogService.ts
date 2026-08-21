import { Prisma } from '@prisma/client'

import prisma from '../../../core/database/prisma.js'
import { parseCalendarDateString } from '../../../core/utils/calendarDate.js'
import { InvalidInputException } from '../../../shared/exceptions/app.exceptions.js'

export type LoadUnit = 'kg' | 'lbs' | 'plates' | 'bw'
export type TrainingCheckPhaseStatus = 'none' | 'skipped' | 'saved'

export interface SetLog {
  id: string
  index: number
  reps: number | null
  rpe: number | null
  load: number | null
  unit: LoadUnit
  completed: boolean
}

export interface ExerciseLog {
  exerciseId: string
  dayKey: string
  note: string | null
  sets: SetLog[]
}

export interface TrainingSessionStartCheck {
  preparation: number
  motivation: number
  strength: number
}

export interface TrainingSessionEndCheck {
  fatigue: number
  pain: number
  strength: number
}

export interface TrainingSessionCheck {
  dayKey: string
  startStatus: TrainingCheckPhaseStatus
  endStatus: TrainingCheckPhaseStatus
  start: TrainingSessionStartCheck | null
  end: TrainingSessionEndCheck | null
}

const logSelect = {
  dayKey: true,
  exerciseId: true,
  note: true,
  sets: true,
} as const

const checkSelect = {
  dayKey: true,
  startStatus: true,
  endStatus: true,
  start: true,
  end: true,
} as const

const MIN_CHECK_SCALE = 1
const MAX_CHECK_SCALE = 5

export class TrainingLogService {
  async listLogs(
    userId: string,
    fromDayKey: string,
    toDayKey: string,
  ): Promise<ExerciseLog[]> {
    this.assertDayKey(fromDayKey)
    this.assertDayKey(toDayKey)
    if (fromDayKey > toDayKey) {
      throw new InvalidInputException('from must not be after to')
    }

    const rows = await prisma.exerciseSetLog.findMany({
      where: {
        userId,
        dayKey: { gte: fromDayKey, lte: toDayKey },
      },
      orderBy: [{ dayKey: 'asc' }, { exerciseId: 'asc' }],
      select: logSelect,
    })
    return rows.map(row => ({ ...row, sets: row.sets as unknown as SetLog[] }))
  }

  async upsertLog(userId: string, log: ExerciseLog): Promise<ExerciseLog> {
    this.assertLog(log)
    const row = await prisma.exerciseSetLog.upsert({
      where: {
        userId_dayKey_exerciseId: {
          userId,
          dayKey: log.dayKey,
          exerciseId: log.exerciseId,
        },
      },
      create: {
        userId,
        dayKey: log.dayKey,
        exerciseId: log.exerciseId,
        note: log.note,
        sets: log.sets as unknown as Prisma.InputJsonValue,
      },
      update: {
        note: log.note,
        sets: log.sets as unknown as Prisma.InputJsonValue,
      },
      select: logSelect,
    })
    return { ...row, sets: row.sets as unknown as SetLog[] }
  }

  async getChecks(userId: string, dayKeys: string[]): Promise<TrainingSessionCheck[]> {
    dayKeys.forEach(dayKey => this.assertDayKey(dayKey))
    if (dayKeys.length === 0) return []

    const rows = await prisma.trainingSessionCheck.findMany({
      where: { userId, dayKey: { in: [...new Set(dayKeys)] } },
      orderBy: { dayKey: 'asc' },
      select: checkSelect,
    })
    return rows.map(row => this.toCheck(row))
  }

  async upsertCheck(
    userId: string,
    check: TrainingSessionCheck,
  ): Promise<TrainingSessionCheck> {
    this.assertCheck(check)
    const start = check.start
      ? (check.start as unknown as Prisma.InputJsonValue)
      : Prisma.DbNull
    const end = check.end ? (check.end as unknown as Prisma.InputJsonValue) : Prisma.DbNull
    const row = await prisma.trainingSessionCheck.upsert({
      where: { userId_dayKey: { userId, dayKey: check.dayKey } },
      create: {
        userId,
        dayKey: check.dayKey,
        startStatus: check.startStatus,
        endStatus: check.endStatus,
        start,
        end,
      },
      update: {
        startStatus: check.startStatus,
        endStatus: check.endStatus,
        start,
        end,
      },
      select: checkSelect,
    })
    return this.toCheck(row)
  }

  private assertLog(log: ExerciseLog): void {
    this.assertDayKey(log.dayKey)
    if (typeof log.exerciseId !== 'string' || log.exerciseId.length === 0) {
      throw new InvalidInputException('exerciseId is required')
    }
    if (log.note !== null && typeof log.note !== 'string') {
      throw new InvalidInputException('note must be a string or null')
    }
    if (!Array.isArray(log.sets) || !log.sets.every(set => this.isSetLog(set))) {
      throw new InvalidInputException('sets must match the SetLog shape')
    }
  }

  private assertCheck(check: TrainingSessionCheck): void {
    this.assertDayKey(check.dayKey)
    const statuses = ['none', 'skipped', 'saved']
    if (!statuses.includes(check.startStatus) || !statuses.includes(check.endStatus)) {
      throw new InvalidInputException('Invalid session check status')
    }
    if (!this.matchesPhase(check.startStatus, check.start, 'start')) {
      throw new InvalidInputException('start check does not match its status')
    }
    if (!this.matchesPhase(check.endStatus, check.end, 'end')) {
      throw new InvalidInputException('end check does not match its status')
    }
  }

  private matchesPhase(
    status: TrainingCheckPhaseStatus,
    value: TrainingSessionStartCheck | TrainingSessionEndCheck | null,
    phase: 'start' | 'end',
  ): boolean {
    if (status !== 'saved') return value === null
    if (!value || typeof value !== 'object') return false
    const keys =
      phase === 'start'
        ? (['preparation', 'motivation', 'strength'] as const)
        : (['fatigue', 'pain', 'strength'] as const)
    const fields = value as unknown as Record<string, unknown>
    return keys.every(key => this.isScale(fields[key]))
  }

  private isSetLog(value: unknown): value is SetLog {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false
    const set = value as Record<string, unknown>
    return (
      typeof set.id === 'string' &&
      Number.isInteger(set.index) &&
      this.isNullableNumber(set.reps) &&
      this.isNullableNumber(set.rpe) &&
      this.isNullableNumber(set.load) &&
      ['kg', 'lbs', 'plates', 'bw'].includes(set.unit as string) &&
      typeof set.completed === 'boolean'
    )
  }

  private isNullableNumber(value: unknown): boolean {
    return value === null || (typeof value === 'number' && Number.isFinite(value))
  }

  private isScale(value: unknown): boolean {
    return (
      Number.isInteger(value) &&
      Number(value) >= MIN_CHECK_SCALE &&
      Number(value) <= MAX_CHECK_SCALE
    )
  }

  private assertDayKey(value: string): void {
    try {
      parseCalendarDateString(value)
    } catch {
      throw new InvalidInputException('dayKey must use YYYY-MM-DD format')
    }
  }

  private toCheck(row: {
    dayKey: string
    startStatus: string
    endStatus: string
    start: Prisma.JsonValue
    end: Prisma.JsonValue
  }): TrainingSessionCheck {
    return row as unknown as TrainingSessionCheck
  }
}
