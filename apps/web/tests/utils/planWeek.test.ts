import { describe, expect, it } from 'vitest'
import type { Task } from '~/types/task'
import {
  canGoToNextWeek,
  defaultSelectedDay,
  isSameCalendarDay,
  isTaskScheduled,
  splitPlanTasks,
  startOfWeekMonday,
  tasksForDay,
} from '~/utils/planWeek'

function task(partial: Partial<Task> & Pick<Task, 'id' | 'name'>): Task {
  return {
    createdAt: new Date('2026-08-01'),
    ...partial,
  }
}

describe('planWeek', () => {
  it('starts week on Monday', () => {
    // Wednesday Aug 5, 2026
    const start = startOfWeekMonday(new Date(2026, 7, 5))
    expect(start.getDay()).toBe(1)
    expect(start.getDate()).toBe(3)
  })

  it('treats tasks without startTime as unscheduled', () => {
    const scheduled = task({
      id: '1',
      name: 'Study',
      startTime: new Date(2026, 7, 5, 9, 0),
      duration: '30m',
    })
    const unscheduled = task({
      id: '2',
      name: 'Inbox',
      duration: '25m',
      estimatedTime: '25',
    })
    expect(isTaskScheduled(scheduled)).toBe(true)
    expect(isTaskScheduled(unscheduled)).toBe(false)
    const split = splitPlanTasks([scheduled, unscheduled])
    expect(split.scheduled).toHaveLength(1)
    expect(split.unscheduled).toHaveLength(1)
  })

  it('filters and sorts tasks for a day', () => {
    const day = new Date(2026, 7, 5)
    const a = task({
      id: 'a',
      name: 'Later',
      startTime: new Date(2026, 7, 5, 11, 0),
      duration: '30m',
    })
    const b = task({
      id: 'b',
      name: 'Earlier',
      startTime: new Date(2026, 7, 5, 8, 0),
      duration: '30m',
    })
    const other = task({
      id: 'c',
      name: 'Other day',
      startTime: new Date(2026, 7, 6, 8, 0),
      duration: '30m',
    })
    const list = tasksForDay([a, b, other], day)
    expect(list.map(t => t.id)).toEqual(['b', 'a'])
  })

  it('blocks next week when on current week', () => {
    const now = new Date(2026, 7, 5)
    const current = startOfWeekMonday(now)
    expect(canGoToNextWeek(current, now)).toBe(false)
    const past = new Date(2026, 6, 27) // week of Jul 27
    expect(canGoToNextWeek(startOfWeekMonday(past), now)).toBe(true)
  })

  it('defaults selected day to today on current week', () => {
    const now = new Date(2026, 7, 5, 15, 0)
    const weekStart = startOfWeekMonday(now)
    const selected = defaultSelectedDay(weekStart, now)
    expect(isSameCalendarDay(selected, now)).toBe(true)
  })
})
