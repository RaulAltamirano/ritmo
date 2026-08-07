import type { WeekDraft } from '@/types/generateWeek'
import type { Task } from '@/types/task'
import { addDays, isTaskScheduled } from '@/utils/planWeek'

function parseWeekStart(isoDate: string): Date {
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Date(y!, m! - 1, d!)
}

function isInWeek(date: Date, weekStart: Date): boolean {
  const end = addDays(weekStart, 6)
  const t = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  return t >= weekStart && t <= end
}

export function weekDraftToTasks(draft: WeekDraft, planId: string): Task[] {
  const weekStart = parseWeekStart(draft.weekStart)
  const now = Date.now()
  const byDay = new Map<number, number>()

  return draft.sessions.map((session, index) => {
    const day = addDays(weekStart, session.dayOffset)
    const dayCursor = byDay.get(session.dayOffset) ?? 9 * 60
    const startHour = Math.floor(dayCursor / 60)
    const startMin = dayCursor % 60
    const startTime = new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate(),
      startHour,
      startMin,
      0,
      0,
    )
    const endTime = new Date(
      startTime.getTime() + session.durationMin * 60_000,
    )
    byDay.set(session.dayOffset, dayCursor + session.durationMin + 15)

    return {
      id: `ai-week-${planId}-${draft.weekStart}-${index}`,
      name: session.title,
      title: session.title,
      createdAt: new Date(now),
      projectId: planId,
      category: 'Study',
      priority: 'media' as const,
      completed: false,
      startTime,
      endTime,
      duration: `${session.durationMin}m`,
      estimatedTime: String(session.durationMin),
      description: session.notes,
      status: 'pendiente',
    }
  })
}

export function weekHasScheduledTasks(tasks: Task[], weekStart: Date): boolean {
  return tasks.some(
    t =>
      isTaskScheduled(t) && t.startTime && isInWeek(t.startTime, weekStart),
  )
}

export function mergeWeekDraftTasks(
  existing: Task[],
  draftTasks: Task[],
  weekStart: Date,
): Task[] {
  const kept = existing.filter(t => {
    if (!t.startTime || !isTaskScheduled(t)) return true
    return !isInWeek(t.startTime, weekStart)
  })
  return [...kept, ...draftTasks]
}
