import type { ExerciseEntry } from '~/types/training'

export function groupExercisesByBlock(exercises: ExerciseEntry[]): ExerciseEntry[][] {
  const result: ExerciseEntry[][] = []
  let current: ExerciseEntry[] = []

  for (const exercise of exercises) {
    if (exercise.block === 'a' && current.length > 0) {
      result.push(current)
      current = []
    }
    current.push(exercise)
  }

  if (current.length > 0) {
    result.push(current)
  }

  return result
}
