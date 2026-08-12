import type { ExerciseLog, LoadUnit, SetLog } from '~/types/training'
import { parsePlannedSetCount } from '~/utils/parsePlannedSetCount'

export type DayLogStatus = 'none' | 'incomplete' | 'logged'

const REPS_ERROR = 'Reps must be a whole number of 1 or more'
const RPE_ERROR = 'RPE is 1–10 in 0.5 steps'
const LOAD_ERROR = 'Load must be 0 or more'

export function emptySetLog(index: number, unit: LoadUnit): SetLog {
  return {
    id: `set-${index}`,
    index,
    reps: null,
    rpe: null,
    load: null,
    unit,
    completed: false,
  }
}

export function ensureSetRows(
  log: ExerciseLog | null,
  setsReps: string,
  unit: LoadUnit,
): SetLog[] {
  if (log?.sets.length && log.sets.length > 0) {
    return log.sets
  }
  const count = parsePlannedSetCount(setsReps)
  return Array.from({ length: count }, (_, i) => emptySetLog(i + 1, unit))
}

export function validateReps(value: number | null): string | null {
  if (value === null) return null
  if (!Number.isInteger(value) || value < 1) return REPS_ERROR
  return null
}

export function validateRpe(value: number | null): string | null {
  if (value === null) return null
  if (value < 1 || value > 10 || Math.round(value * 2) !== value * 2) {
    return RPE_ERROR
  }
  return null
}

export function validateLoad(value: number | null, _unit: LoadUnit): string | null {
  if (value === null) return null
  if (value < 0) return LOAD_ERROR
  return null
}

export function isSetStarted(set: SetLog): boolean {
  return (
    set.reps !== null
    || set.rpe !== null
    || set.load !== null
    || set.completed
  )
}

export function isSetComplete(set: SetLog): boolean {
  if (validateReps(set.reps) !== null) return false
  if (validateRpe(set.rpe) !== null) return false

  if (set.unit === 'bw') {
    if (set.reps === null || set.rpe === null) return false
    if (set.load !== null && validateLoad(set.load, set.unit) !== null) return false
    return true
  }

  if (set.reps === null || set.rpe === null || set.load === null) return false
  return validateLoad(set.load, set.unit) === null
}

export function dayLogStatus(logs: ExerciseLog[]): DayLogStatus {
  const startedSets = logs.flatMap(log => log.sets).filter(isSetStarted)
  if (startedSets.length === 0) return 'none'
  if (startedSets.every(isSetComplete)) return 'logged'
  return 'incomplete'
}
