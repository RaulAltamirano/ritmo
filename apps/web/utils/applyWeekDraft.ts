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

  return draft.sessions.map((session, index) => {
    const day = addDays(weekStart, session.dayOffset)
    const startTime = new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate(),
      9,
      0,
      0,
      0,
    )
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
