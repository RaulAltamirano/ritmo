import type {
  TrainingDay,
  WeekColumn,
  WeekdayIndex,
  WeeklyPlan,
} from '~/types/training'

/** Sunday-start week, local timezone (calendar date only). */
export function startOfWeekSunday(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  d.setDate(d.getDate() - d.getDay())
  return d
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  d.setDate(d.getDate() + days)
  return d
}

export function formatWeekLabel(start: Date, end: Date): string {
  const sameMonth =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()
  const sameYear = start.getFullYear() === end.getFullYear()

  const monthDay = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  })
  const dayOnly = new Intl.DateTimeFormat('en-US', { day: 'numeric' })
  const monthDayYear = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  if (sameMonth) {
    return `${monthDay.format(start)} – ${dayOnly.format(end)}, ${end.getFullYear()}`
  }

  if (sameYear) {
    return `${monthDay.format(start)} – ${monthDayYear.format(end)}`
  }

  return `${monthDayYear.format(start)} – ${monthDayYear.format(end)}`
}

export function buildWeekColumns(weekStart: Date, plan: WeeklyPlan): WeekColumn[] {
  const byWeekday = new Map<WeekdayIndex, TrainingDay>()
  for (const day of plan.days) {
    byWeekday.set(day.weekday, day)
  }

  return Array.from({ length: 7 }, (_, offset) => {
    const date = addDays(weekStart, offset)
    const weekday = date.getDay() as WeekdayIndex
    return {
      key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
      date,
      weekday,
      trainingDay: byWeekday.get(weekday) ?? null,
    }
  })
}
