import type {
  ExerciseBlock,
  TrainingDayFocus,
  WeekdayIndex,
  WeeklyPlan,
} from '@/types/training'

export interface TrainingWeekSubstitution {
  fromExerciseId: string
  toExerciseId: string
  reason: string
}

export interface FrontendTrainingWeek {
  id: string
  weekStart: string
  status: 'draft' | 'applied'
  blockPhase: 'accumulation' | 'deload'
  weekInBlock: number
  programTemplateCode: string
  summary: string | null
  warning: string | null
  substitutions: TrainingWeekSubstitution[]
  days: Array<{
    id: string
    dayNumber: number
    name: string
    focus: TrainingDayFocus
    weekday: number
    date: string
    exercises: Array<{
      id: string
      exerciseId: string
      name: string
      block: ExerciseBlock
      setsReps: string
      targetRir: string
      targetRpe: string
      emphasis?: 'main' | 'accessory'
    }>
  }>
}

export function mapTrainingWeekToPlan(week: FrontendTrainingWeek): WeeklyPlan {
  return {
    id: week.id,
    title: 'Weekly plan',
    programLabel: week.programTemplateCode,
    days: week.days.map(d => ({
      id: d.id,
      dayNumber: d.dayNumber,
      name: d.name,
      focus: d.focus,
      weekday: d.weekday as WeekdayIndex,
      exercises: d.exercises.map(e => ({
        id: e.id,
        block: e.block,
        name: e.name,
        setsReps: e.setsReps,
        targetRir: e.targetRir,
        rpe: e.targetRpe,
        emphasis: e.emphasis,
      })),
    })),
  }
}
