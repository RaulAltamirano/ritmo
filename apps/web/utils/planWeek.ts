import type { Task } from '~/types/task'
import { calendarDayKey } from '~/utils/calendarDayKey'
import { addDays, formatWeekLabel } from '~/utils/trainingWeek'

export { addDays, formatWeekLabel, calendarDayKey }

/** Monday-start week, local timezone (calendar date only). */
export function startOfWeekMonday(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/** Client heuristic: scheduled if endTime or duration/estimatedTime is present. */
export function isTaskScheduled(task: Task): boolean {
  if (task.endTime) return true
  if (task.duration) return true
  if (task.estimatedTime) return true
  return false
}

export function splitPlanTasks(tasks: Task[]): {
  scheduled: Task[]
  unscheduled: Task[]
} {
  const scheduled: Task[] = []
  const unscheduled: Task[] = []
  for (const task of tasks) {
    if (isTaskScheduled(task)) scheduled.push(task)
    else unscheduled.push(task)
  }
  return { scheduled, unscheduled }
}

export function tasksForDay(scheduled: Task[], day: Date): Task[] {
  return scheduled
    .filter(t => t.startTime && isSameCalendarDay(t.startTime, day))
    .sort((a, b) => {
      const aMs = a.startTime?.getTime() ?? 0
      const bMs = b.startTime?.getTime() ?? 0
      return aMs - bMs
    })
}

export function scheduledCountByDayKey(
  scheduled: Task[],
  weekStart: Date,
): Record<string, number> {
  const counts: Record<string, number> = {}
  for (let i = 0; i < 7; i++) {
    const day = addDays(weekStart, i)
    counts[calendarDayKey(day)] = 0
  }
  for (const task of scheduled) {
    if (!task.startTime) continue
    const key = calendarDayKey(task.startTime)
    if (key in counts) counts[key] += 1
  }
  return counts
}

export function isCurrentWeek(weekStart: Date, now = new Date()): boolean {
  return calendarDayKey(weekStart) === calendarDayKey(startOfWeekMonday(now))
}

export function canGoToNextWeek(weekStart: Date, now = new Date()): boolean {
  return !isCurrentWeek(weekStart, now)
}

export interface WeekDayCell {
  key: string
  date: Date
  weekdayShort: string
  dayNumber: number
  taskCount: number
}

const WEEKDAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

export function buildWeekDayCells(
  weekStart: Date,
  scheduled: Task[],
  dayCounts?: Record<string, number>,
): WeekDayCell[] {
  const counts = dayCounts ?? scheduledCountByDayKey(scheduled, weekStart)
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i)
    const key = calendarDayKey(date)
    const weekdayShort = WEEKDAY_SHORT[i] ?? 'Mon'
    return {
      key,
      date,
      weekdayShort,
      dayNumber: date.getDate(),
      taskCount: counts[key] ?? 0,
    }
  })
}

export function defaultSelectedDay(weekStart: Date, now = new Date()): Date {
  if (isCurrentWeek(weekStart, now)) {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  }
  return addDays(weekStart, 0)
}

export function formatTaskTimeRange(task: Task): string {
  if (!task.startTime) return ''
  const timeFmt = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const start = timeFmt.format(task.startTime)
  if (task.endTime) {
    return `${start} – ${timeFmt.format(task.endTime)}`
  }
  const minutes = parseDurationMinutes(task)
  if (minutes != null) {
    const end = new Date(task.startTime.getTime() + minutes * 60_000)
    return `${start} – ${timeFmt.format(end)} (${minutes} min)`
  }
  return start
}

function parseDurationMinutes(task: Task): number | null {
  if (task.estimatedTime) {
    const n = parseInt(task.estimatedTime, 10)
    if (!Number.isNaN(n)) return n
  }
  if (task.duration) {
    const n = parseInt(task.duration, 10)
    if (!Number.isNaN(n)) return n
  }
  return null
}
