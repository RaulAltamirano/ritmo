import type { ExerciseLoadSettings, ExerciseLog } from '~/types/training'
import {
  bestCompletedSet,
  formatLastSessionLine,
} from '~/utils/trainingSessionMetrics'

export function findExerciseLog(
  logs: ExerciseLog[],
  exerciseId: string,
  dayKey: string,
): ExerciseLog | null {
  return logs.find(log => log.exerciseId === exerciseId && log.dayKey === dayKey) ?? null
}

export function findLoadSettings(
  settings: ExerciseLoadSettings[],
  exerciseId: string,
): ExerciseLoadSettings {
  return (
    settings.find(s => s.exerciseId === exerciseId) ?? {
      exerciseId,
      plateKg: null,
      lastUnit: 'kg',
    }
  )
}

export function findLastSessionLine(
  logs: ExerciseLog[],
  exerciseId: string,
  beforeDayKey: string,
  plateKg: number | null,
  bodyweightKg: number | null,
): string | null {
  const prior = logs
    .filter(log => log.exerciseId === exerciseId && log.dayKey < beforeDayKey)
    .sort((a, b) => b.dayKey.localeCompare(a.dayKey))

  for (const log of prior) {
    const best = bestCompletedSet(log.sets, plateKg, bodyweightKg)
    if (best) return formatLastSessionLine(best)
  }

  return null
}
