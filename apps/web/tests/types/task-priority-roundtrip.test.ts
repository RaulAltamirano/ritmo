import { describe, expect, it } from 'vitest'
import {
  frontendTaskToUiTask,
  uiTaskToUpdatePayload,
  type FrontendTask,
} from '@/types/task'

function baseFrontend(overrides: Partial<FrontendTask> = {}): FrontendTask {
  return {
    id: '1',
    title: 'Task',
    status: 'todo',
    priority: 'medium',
    isCompleted: false,
    startTime: new Date().toISOString(),
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

describe('task priority round-trip', () => {
  it('preserves urgent through UI conversion', () => {
    const ui = frontendTaskToUiTask(baseFrontend({ priority: 'urgent' }))
    expect(ui.apiPriority).toBe('URGENT')
    expect(ui.priority).toBe('alta')

    const payload = uiTaskToUpdatePayload(ui)
    expect(payload.priority).toBe('URGENT')
  })

  it('preserves critical through UI conversion', () => {
    const ui = frontendTaskToUiTask(baseFrontend({ priority: 'critical' }))
    expect(ui.apiPriority).toBe('CRITICAL')
    const payload = uiTaskToUpdatePayload(ui)
    expect(payload.priority).toBe('CRITICAL')
  })

  it('preserves high as HIGH (not upgraded from alta)', () => {
    const ui = frontendTaskToUiTask(baseFrontend({ priority: 'high' }))
    expect(ui.apiPriority).toBe('HIGH')
    expect(uiTaskToUpdatePayload(ui).priority).toBe('HIGH')
  })
})
