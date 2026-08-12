export type ExerciseBlock = 'a' | 'b' | 'c'

/** Visual category for day chrome (icon + accent), not inferred from name. */
export type TrainingDayFocus = 'upper' | 'lower'

/** JS `Date.getDay()`: 0 Sunday … 6 Saturday. */
export type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface ExerciseEntry {
  id: string
  block: ExerciseBlock
  name: string
  setsReps: string
  targetRir: string
  rpe: string
  emphasis?: 'main' | 'accessory'
}

export interface TrainingDay {
  id: string
  dayNumber: number
  name: string
  focus: TrainingDayFocus
  /** JS `Date.getDay()` index for the calendar day this session maps to (weeks displayed Mon–Sun). */
  weekday: WeekdayIndex
  exercises: ExerciseEntry[]
}

export interface WeeklyPlan {
  id: string
  title: string
  programLabel: string
  days: TrainingDay[]
}

export interface WeekColumn {
  key: string
  date: Date
  weekday: WeekdayIndex
  trainingDay: TrainingDay | null
}

export type LoadUnit = 'kg' | 'lbs' | 'plates' | 'bw'

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

export interface ExerciseLoadSettings {
  exerciseId: string
  plateKg: number | null
  lastUnit: LoadUnit
}
