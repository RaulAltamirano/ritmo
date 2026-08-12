export type ExerciseGroupKind = 'single' | 'superset' | 'triset' | 'giant'

/** Design-system tone for group chrome (not raw hex). */
export type ExerciseGroupTone = 'neutral' | 'brand' | 'warning' | 'success'

export interface ExerciseGroupMeta {
  kind: ExerciseGroupKind
  tone: ExerciseGroupTone
  /** Short label on the card (e.g. "Superset"). */
  title: string
  /** Plain-language how-to for anyone, not just coaches. */
  hint: string
  /** Compact count chip for multi-exercise groups. */
  countLabel: string | null
  exerciseCount: number
}

/**
 * Labels a consecutive a→b→c block group so supersets are obvious in the UI.
 */
export function getExerciseGroupMeta(exerciseCount: number): ExerciseGroupMeta {
  const count = Math.max(0, exerciseCount)

  if (count <= 1) {
    return {
      kind: 'single',
      tone: 'neutral',
      title: 'Straight set',
      hint: 'One exercise. Rest when you finish the sets.',
      countLabel: null,
      exerciseCount: count,
    }
  }

  if (count === 2) {
    return {
      kind: 'superset',
      tone: 'brand',
      title: 'Superset',
      hint: 'Do both back-to-back with little rest. Rest after the pair.',
      countLabel: '2 exercises · back-to-back',
      exerciseCount: count,
    }
  }

  if (count === 3) {
    return {
      kind: 'triset',
      tone: 'warning',
      title: 'Triset',
      hint: 'Do all three back-to-back with little rest. Rest after the circuit.',
      countLabel: '3 exercises · back-to-back',
      exerciseCount: count,
    }
  }

  return {
    kind: 'giant',
    tone: 'success',
    title: 'Giant set',
    hint: `Do all ${count} back-to-back with little rest. Rest after the circuit.`,
    countLabel: `${count} exercises · back-to-back`,
    exerciseCount: count,
  }
}
