import { describe, expect, it } from 'vitest'
import {
  mergeWeekDraftTasks,
  weekDraftToTasks,
  weekHasScheduledTasks,
} from '@/utils/applyWeekDraft'
import type { WeekDraft } from '@/types/generateWeek'
import type { Task } from '@/types/task'

const weekStart = new Date(2026, 7, 3) // Mon Aug 3 2026 local

function task(partial: Partial<Task> & Pick<Task, 'id' | 'name'>): Task {
  return {
    createdAt: new Date('2026-08-01'),
    ...partial,
  }
}

const draft: WeekDraft = {
  weekStart: '2026-08-03',
  summary: 'Focus speaking',
  sessions: [
    { dayOffset: 0, title: 'Speaking A', durationMin: 45 },
    { dayOffset: 2, title: 'Speaking B', durationMin: 45 },
  ],
}

describe('applyWeekDraft', () => {
  it('maps sessions to scheduled tasks on correct calendar days', () => {
    const tasks = weekDraftToTasks(draft, 'plan-1')
    expect(tasks).toHaveLength(2)
    expect(tasks[0]?.projectId).toBe('plan-1')
    expect(tasks[0]?.startTime?.getFullYear()).toBe(2026)
    expect(tasks[0]?.startTime?.getMonth()).toBe(7)
    expect(tasks[0]?.startTime?.getDate()).toBe(3)
    expect(tasks[0]?.duration).toBe('45m')
    expect(tasks[0]?.id).toMatch(/^ai-week-/)
  })

  it('detects scheduled tasks inside the week', () => {
    const existing = [
      task({
        id: 'a',
        name: 'Old',
        startTime: new Date(2026, 7, 4, 9, 0),
        duration: '30m',
      }),
      task({
        id: 'b',
        name: 'Other week',
        startTime: new Date(2026, 6, 28, 9, 0),
        duration: '30m',
      }),
    ]
    expect(weekHasScheduledTasks(existing, weekStart)).toBe(true)
    expect(
      weekHasScheduledTasks([task({ id: 'c', name: 'Unsched' })], weekStart),
    ).toBe(false)
  })

  it('replaces only scheduled tasks in the target week', () => {
    const existing = [
      task({
        id: 'keep-unsched',
        name: 'Inbox',
      }),
      task({
        id: 'replace-me',
        name: 'Old session',
        startTime: new Date(2026, 7, 3, 10, 0),
        duration: '30m',
      }),
      task({
        id: 'other-week',
        name: 'Prev week',
        startTime: new Date(2026, 6, 28, 10, 0),
        duration: '30m',
      }),
    ]
    const draftTasks = weekDraftToTasks(draft, 'plan-1')
    const merged = mergeWeekDraftTasks(existing, draftTasks, weekStart)
    expect(merged.map(t => t.id)).toContain('keep-unsched')
    expect(merged.map(t => t.id)).toContain('other-week')
    expect(merged.map(t => t.id)).not.toContain('replace-me')
    expect(merged.filter(t => t.id.startsWith('ai-week-'))).toHaveLength(2)
  })
})
