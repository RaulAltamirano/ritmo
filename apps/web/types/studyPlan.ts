/**
 * Study plan intake — goal is the plan name; learning types/tags are deduced later.
 */

export interface StudyPlanIntake {
  goal: string
  description: string
  color: string
  daysPerWeek: number
  minutesPerSession: number
  targetDate: string | null
}

export const STUDY_SESSION_MINUTE_PRESETS = [25, 45, 60, 90] as const

export const STUDY_DAYS_PER_WEEK_OPTIONS = [1, 2, 3, 4, 5, 6, 7] as const

export const STUDY_PLAN_COLOR_OPTIONS = [
  { value: 'blue', class: 'bg-gradient-to-br from-blue-500 to-blue-600' },
  { value: 'purple', class: 'bg-gradient-to-br from-purple-500 to-purple-600' },
  { value: 'green', class: 'bg-gradient-to-br from-green-500 to-green-600' },
  { value: 'red', class: 'bg-gradient-to-br from-red-500 to-red-600' },
  { value: 'yellow', class: 'bg-gradient-to-br from-yellow-500 to-yellow-600' },
  { value: 'pink', class: 'bg-gradient-to-br from-pink-500 to-pink-600' },
  { value: 'indigo', class: 'bg-gradient-to-br from-indigo-500 to-indigo-600' },
  { value: 'teal', class: 'bg-gradient-to-br from-teal-500 to-teal-600' },
  { value: 'orange', class: 'bg-gradient-to-br from-orange-500 to-orange-600' },
  { value: 'cyan', class: 'bg-gradient-to-br from-cyan-500 to-cyan-600' },
  { value: 'emerald', class: 'bg-gradient-to-br from-emerald-500 to-emerald-600' },
  { value: 'rose', class: 'bg-gradient-to-br from-rose-500 to-rose-600' },
] as const
