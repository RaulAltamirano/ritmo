import type { ExerciseLog, LoadUnit, SetLog } from '~/types/training'
import { parsePlannedSetCount } from '~/utils/parsePlannedSetCount'

export type DayLogStatus = 'none' | 'incomplete' | 'logged'

const REPS_ERROR = 'Reps must be a whole number of 1 or more'
const RPE_ERROR = 'RPE is 1–10 in 0.5 steps'
const LOAD_ERROR = 'Load must be 0 or more'

export function nextSetLogId(sets: { id: string }[]): string {
  const max = sets.reduce((highest, set) => {
    const n = Number(/^set-(\d+)$/.exec(set.id)?.[1] ?? 0)
    return Number.isFinite(n) && n > highest ? n : highest
  }, 0)
  return `set-${max + 1}`
}

export function emptySetLog(
  index: number,
  unit: LoadUnit,
  id = `set-${index}`,
): SetLog {
  return {
    id,
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

export function completeSetErrors(set: SetLog): {
  reps: string | null
  rpe: string | null
  load: string | null
} {
  return {
    reps: set.reps === null ? REPS_ERROR : validateReps(set.reps),
    rpe: set.rpe === null ? RPE_ERROR : validateRpe(set.rpe),
    load: completeLoadError(set),
  }
}

function completeLoadError(set: SetLog): string | null {
  if (set.unit === 'bw') {
    return set.load === null ? null : validateLoad(set.load, set.unit)
  }
  if (set.load === null) return LOAD_ERROR
  return validateLoad(set.load, set.unit)
}

export function isSetStarted(set: SetLog): boolean {
  return set.reps !== null || set.rpe !== null || set.load !== null || set.completed
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
