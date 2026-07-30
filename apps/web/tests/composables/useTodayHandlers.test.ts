import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const createMock = vi.fn()
const updateMock = vi.fn()
const removeMock = vi.fn()
const markCompletedMock = vi.fn()
const stopTimerMock = vi.fn()
const closeTimerMock = vi.fn()
const completeWorkSessionMock = vi.fn()

const timerState = {
  activeTask: { id: 'task-1', name: 'Task One' } as { id: string; name: string } | null,
  remoteWorkSessionId: 'ws-1' as string | null,
  stopTimer: stopTimerMock,
  closeTimer: closeTimerMock,
}

vi.mock('@/stores/tasks', () => ({
  useTasksStore: () => ({
    create: createMock,
    update: updateMock,
    remove: removeMock,
    markCompleted: markCompletedMock,
  }),
}))

vi.mock('@/stores/timer', () => ({
  useTimerStore: () => timerState,
}))

vi.mock('@/services/workSessionsApi', () => ({
  completeWorkSession: (...args: unknown[]) => completeWorkSessionMock(...args),
  abandonWorkSession: vi.fn(),
}))

vi.mock('@/utils/idempotency', () => ({
  newIdempotencyKey: () => 'idem-key-1',
}))

describe('useTodayHandlers', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    timerState.activeTask = { id: 'task-1', name: 'Task One' }
    timerState.remoteWorkSessionId = 'ws-1'
    markCompletedMock.mockResolvedValue({ success: true })
    completeWorkSessionMock.mockResolvedValue({ success: true })
    stopTimerMock.mockResolvedValue(undefined)
  })

  it('marks the task completed and sends feedback to the work session', async () => {
    vi.resetModules()
    const { useTodayHandlers } = await import('@/composables/tasks/useTodayHandlers')
    const handlers = useTodayHandlers()
    const resolve = vi.fn()
    const reject = vi.fn()

    await handlers.handleCompleteTaskWithFeedback(
      { id: 'task-1', name: 'Task One', createdAt: new Date() },
      {
        energyAfter: 4,
        focusScore: 5,
        progressScore: 3,
        mentalDemand: 2,
        timeFit: 'yes',
        mainBlocker: 'none',
      },
      resolve,
      reject,
    )

    expect(markCompletedMock).toHaveBeenCalledWith('task-1', true)
    expect(completeWorkSessionMock).toHaveBeenCalledWith(
      'ws-1',
      { 'Idempotency-Key': 'idem-key-1' },
      {
        rpeCognitive: 2,
        frictionScore: 2,
        energyAfter: 4,
        perceivedFocus: 5,
        perceivedProgress: 3,
        timeFit: 'yes',
      },
    )
    expect(updateMock).not.toHaveBeenCalled()
    expect(closeTimerMock).toHaveBeenCalled()
    expect(resolve).toHaveBeenCalled()
    expect(reject).not.toHaveBeenCalled()
  })

  it('stops a local-only timer when completing the active task', async () => {
    vi.resetModules()
    timerState.remoteWorkSessionId = null
    const { useTodayHandlers } = await import('@/composables/tasks/useTodayHandlers')
    const handlers = useTodayHandlers()

    await handlers.handleCompleteTaskWithFeedback(
      { id: 'task-1', name: 'Task One', createdAt: new Date() },
      {
        energyAfter: 4,
        focusScore: 5,
        progressScore: 3,
        mentalDemand: 2,
        timeFit: 'yes',
        mainBlocker: 'none',
      },
      vi.fn(),
      vi.fn(),
    )

    expect(completeWorkSessionMock).not.toHaveBeenCalled()
    expect(stopTimerMock).toHaveBeenCalled()
  })

  it('does not write feedback into the task description', async () => {
    vi.resetModules()
    timerState.remoteWorkSessionId = null
    timerState.activeTask = null
    const { useTodayHandlers } = await import('@/composables/tasks/useTodayHandlers')
    const handlers = useTodayHandlers()

    await handlers.handleCompleteTaskWithFeedback(
      { id: 'task-2', name: 'Task Two', createdAt: new Date() },
      {
        energyAfter: 4,
        focusScore: 5,
        progressScore: 3,
        mentalDemand: 2,
        timeFit: 'yes',
        mainBlocker: 'none',
      },
      vi.fn(),
      vi.fn(),
    )

    expect(updateMock).not.toHaveBeenCalled()
    expect(completeWorkSessionMock).not.toHaveBeenCalled()
    expect(stopTimerMock).not.toHaveBeenCalled()
  })
})
