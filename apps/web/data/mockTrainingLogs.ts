import type { ExerciseLoadSettings, ExerciseLog, SetLog } from '~/types/training'
import { calendarDayKey } from '~/utils/calendarDayKey'
import { addDays } from '~/utils/trainingWeek'

export const MOCK_BODYWEIGHT_KG = 80

function completedKgSets(load: number): SetLog[] {
  return [1, 2, 3].map(index => ({
    id: `set-${index}`,
    index,
    reps: 10,
    rpe: 8,
    load,
    unit: 'kg' as const,
    completed: true,
  }))
}

export function buildMockLoadSettings(): ExerciseLoadSettings[] {
  return [
    { exerciseId: 'd1-e1', plateKg: null, lastUnit: 'kg' },
    { exerciseId: 'd1-e2', plateKg: null, lastUnit: 'plates' },
  ]
}

export function buildMockTrainingLogs(anchorMonday: Date): ExerciseLog[] {
  const logs: ExerciseLog[] = []

  for (let n = 1; n <= 5; n++) {
    const day = addDays(anchorMonday, -7 * n)
    logs.push({
      exerciseId: 'd1-e1',
      dayKey: calendarDayKey(day),
      note: null,
      sets: completedKgSets(65 + n),
    })
  }

  const pullDownDay = addDays(anchorMonday, -7)
  logs.push({
    exerciseId: 'd1-e2',
    dayKey: calendarDayKey(pullDownDay),
    note: null,
    sets: [
      {
        id: 'set-1',
        index: 1,
        reps: 12,
        rpe: 8,
        load: 4,
        unit: 'plates',
        completed: true,
      },
    ],
  })

  return logs
}
