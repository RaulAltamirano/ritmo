import { describe, expect, it } from 'vitest'
import { useActivityAdapter } from '@/composables/tasks/useActivityAdapter'
import type { Activity } from '@/types/activity'
import type { Task } from '@/types/task'

const makeActivity = (overrides: Partial<Activity> = {}): Activity => ({
  id: 'act-1',
  title: 'Test',
  type: 'TASK',
  priority: 'medium',
  isCompleted: false,
  startTime: new Date('2026-04-20T10:00:00').toISOString(),
  endTime: new Date('2026-04-20T10:25:00').toISOString(),
  duration: 25,
  tags: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'act-1',
  name: 'Test',
  createdAt: new Date(),
  ...overrides,
})

describe('useActivityAdapter', () => {
  const { activityToTask, taskToActivity, activitiesToTasks } = useActivityAdapter()

  describe('activityToTask', () => {
    it('maps "urgent" priority to "alta"', () => {
      const task = activityToTask(makeActivity({ priority: 'urgent' }))
      expect(task.priority).toBe('alta')
    })

    it('maps "high" priority to "alta"', () => {
      const task = activityToTask(makeActivity({ priority: 'high' }))
      expect(task.priority).toBe('alta')
    })

    it('maps "medium" priority to "media"', () => {
      const task = activityToTask(makeActivity({ priority: 'medium' }))
      expect(task.priority).toBe('media')
    })

    it('maps "low" priority to "baja"', () => {
      const task = activityToTask(makeActivity({ priority: 'low' }))
      expect(task.priority).toBe('baja')
    })

    it('falls back to "media" for unknown priority', () => {
      const task = activityToTask(makeActivity({ priority: 'unknown' as any }))
      expect(task.priority).toBe('media')
    })

    it('sets notes to empty string when description is absent', () => {
      const task = activityToTask(makeActivity({ description: undefined }))
      expect(task.notes).toBe('')
    })

    it('sets notes to empty string when description is null', () => {
      const task = activityToTask(makeActivity({ description: null as any }))
      expect(task.notes).toBe('')
    })

    it('preserves description when present', () => {
      const task = activityToTask(makeActivity({ description: 'My notes' }))
      expect(task.notes).toBe('My notes')
    })
  })

  describe('taskToActivity', () => {
    it('parses duration string "25m" to number 25', () => {
      const result = taskToActivity(makeTask({ duration: '25m' }))
      expect(result.duration).toBe(25)
    })

    it('parses estimatedTime "45" to number 45', () => {
      const result = taskToActivity(makeTask({ estimatedTime: '45' }))
      expect(result.duration).toBe(45)
    })

    it('uses fallback 25 for invalid estimatedTime', () => {
      const result = taskToActivity(
        makeTask({ estimatedTime: 'abc', duration: undefined }),
      )
      expect(result.duration).toBe(25)
    })

    it('uses fallback 25 when both duration and estimatedTime are absent', () => {
      const result = taskToActivity(
        makeTask({ duration: undefined, estimatedTime: undefined }),
      )
      expect(result.duration).toBe(25)
    })

    it('maps Spanish "alta" to uppercase "HIGH"', () => {
      const result = taskToActivity(makeTask({ priority: 'alta' }))
      expect(result.priority).toBe('HIGH')
    })

    it('maps Spanish "baja" to uppercase "LOW"', () => {
      const result = taskToActivity(makeTask({ priority: 'baja' }))
      expect(result.priority).toBe('LOW')
    })
  })

  describe('activitiesToTasks', () => {
    it('returns empty array for empty input', () => {
      expect(activitiesToTasks([])).toEqual([])
    })

    it('maps each activity without crashing on minimal data', () => {
      const activities = [makeActivity(), makeActivity({ id: 'act-2' })]
      expect(activitiesToTasks(activities)).toHaveLength(2)
    })
  })
})
