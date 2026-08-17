import type {
  ExerciseLog,
  TrainingCheckScale,
  TrainingDay,
  TrainingSessionCheck,
  TrainingSessionEndCheck,
  TrainingSessionStartCheck,
} from '~/types/training'
import { findExerciseLog } from '~/utils/trainingLogLookup'
import { parsePlannedSetCount } from '~/utils/parsePlannedSetCount'

const STRENGTH_LABELS = ['Very low', 'Low', 'Medium', 'High', 'Very high'] as const

export function emptySessionCheck(dayKey: string): TrainingSessionCheck {
  return {
    dayKey,
    startStatus: 'none',
    endStatus: 'none',
    start: null,
    end: null,
  }
}

export function findSessionCheck(
  checks: TrainingSessionCheck[],
  dayKey: string,
): TrainingSessionCheck {
  return checks.find(item => item.dayKey === dayKey) ?? emptySessionCheck(dayKey)
}

export function upsertSessionCheck(
  checks: TrainingSessionCheck[],
  next: TrainingSessionCheck,
): TrainingSessionCheck[] {
  const index = checks.findIndex(item => item.dayKey === next.dayKey)
  if (index === -1) return [...checks, next]
  return checks.map((item, i) => (i === index ? next : item))
}

export function skipSessionCheckPhase(
  check: TrainingSessionCheck,
  phase: 'start' | 'end',
): TrainingSessionCheck {
  if (phase === 'start') {
    return { ...check, startStatus: 'skipped', start: null }
  }
  return { ...check, endStatus: 'skipped', end: null }
}

export function saveSessionCheckStart(
  check: TrainingSessionCheck,
  start: TrainingSessionStartCheck,
): TrainingSessionCheck {
  return { ...check, startStatus: 'saved', start }
}

export function saveSessionCheckEnd(
  check: TrainingSessionCheck,
  end: TrainingSessionEndCheck,
): TrainingSessionCheck {
  return { ...check, endStatus: 'saved', end }
}

export function strengthLabel(value: TrainingCheckScale): string {
  return STRENGTH_LABELS[value - 1] ?? STRENGTH_LABELS[2]
}

export function isPlannedSessionComplete(
  trainingDay: TrainingDay | null,
  logs: ExerciseLog[],
  dayKey: string,
): boolean {
  if (!trainingDay || trainingDay.exercises.length === 0) return false
  return trainingDay.exercises.every(exercise => {
    const log = findExerciseLog(logs, exercise.id, dayKey)
    const planned = parsePlannedSetCount(exercise.setsReps)
    const completedCount = (log?.sets ?? []).filter(set => set.completed).length
    return completedCount >= planned
  })
}
