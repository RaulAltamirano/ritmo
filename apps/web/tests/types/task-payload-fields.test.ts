import { describe, expect, it } from 'vitest'
import {
  frontendTaskToUiTask,
  uiTaskToUpdatePayload,
  type FrontendTask,
  type Task,
} from '@/types/task'

function baseFrontend(overrides: Partial<FrontendTask> = {}): FrontendTask {
  return {
    id: '1',
    title: 'Task',
    status: 'todo',
    priority: 'medium',
    isCompleted: false,
    startTime: '2026-07-30T10:00:00.000Z',
    tags: [],
    createdAt: '2026-07-30T09:00:00.000Z',
    updatedAt: '2026-07-30T09:00:00.000Z',
    ...overrides,
  }
}

describe('uiTaskToUpdatePayload scheduling fields', () => {
  it('includes startTime, endTime, and dueDate from the UI task', () => {
    const ui = frontendTaskToUiTask(
      baseFrontend({
        endTime: '2026-07-30T11:00:00.000Z',
        dueDate: '2026-07-31T00:00:00.000Z',
      }),
    )
    const payload = uiTaskToUpdatePayload(ui)
    expect(payload.startTime).toEqual(ui.startTime)
    expect(payload.endTime).toEqual(ui.endTime)
    expect(payload.dueDate).toEqual(ui.dueDate)
  })
})

describe('frontendTaskToUiTask duration', () => {
  it('does not invent a 25-minute duration when unset', () => {
    const ui = frontendTaskToUiTask(baseFrontend())
    expect(ui.duration).toBeUndefined()
    expect(ui.estimatedTime).toBeUndefined()
  })

  it('uses estimatedDuration when present', () => {
    const ui = frontendTaskToUiTask(baseFrontend({ estimatedDuration: 40 }))
    expect(ui.duration).toBe('40m')
    expect(ui.estimatedTime).toBe('40')
  })
})

describe('uiTaskToUpdatePayload estimatedDuration', () => {
  it('omits estimatedDuration when the UI task has no estimate', () => {
    const ui: Task = {
      id: '1',
      name: 'T',
      createdAt: new Date(),
      priority: 'media',
      apiPriority: 'MEDIUM',
    }
    const payload = uiTaskToUpdatePayload(ui)
    expect(payload.estimatedDuration).toBeUndefined()
  })
})
