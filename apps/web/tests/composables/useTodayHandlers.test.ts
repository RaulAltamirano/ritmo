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

  const sampleFeedback = {
    energyAfter: 4 as const,
    focusScore: 5 as const,
    progressScore: 3 as const,
    mentalDemand: 2 as const,
    timeFit: 'yes' as const,
    mainBlocker: 'none' as const,
  }

  it('remote complete: closes session before markCompleted', async () => {
    vi.resetModules()
    const { useTodayHandlers } = await import('@/composables/tasks/useTodayHandlers')
    const handlers = useTodayHandlers()
    const resolve = vi.fn()
    const reject = vi.fn()
    const order: string[] = []
    completeWorkSessionMock.mockImplementation(async () => {
      order.push('completeWorkSession')
      return { success: true }
    })
    closeTimerMock.mockImplementation(() => {
      order.push('closeTimer')
    })
    markCompletedMock.mockImplementation(async () => {
      order.push('markCompleted')
      return { success: true }
    })

    await handlers.handleCompleteTaskWithFeedback(
      { id: 'task-1', name: 'Task One', createdAt: new Date() },
      sampleFeedback,
      resolve,
      reject,
    )

    expect(order).toEqual(['completeWorkSession', 'closeTimer', 'markCompleted'])
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
    expect(resolve).toHaveBeenCalled()
    expect(reject).not.toHaveBeenCalled()
  })

  it('remote complete: does not markCompleted when session complete fails', async () => {
    vi.resetModules()
    completeWorkSessionMock.mockRejectedValue(new Error('session boom'))
    const { useTodayHandlers } = await import('@/composables/tasks/useTodayHandlers')
    const handlers = useTodayHandlers()
    const resolve = vi.fn()
    const reject = vi.fn()

    await handlers.handleCompleteTaskWithFeedback(
      { id: 'task-1', name: 'Task One', createdAt: new Date() },
      sampleFeedback,
      resolve,
      reject,
    )

    expect(markCompletedMock).not.toHaveBeenCalled()
    expect(closeTimerMock).not.toHaveBeenCalled()
    expect(resolve).not.toHaveBeenCalled()
    expect(reject).toHaveBeenCalled()
  })

  it('remote complete: rejects when remote gate is missing', async () => {
    vi.resetModules()
    timerState.remoteWorkSessionId = null
    const { useTodayHandlers } = await import('@/composables/tasks/useTodayHandlers')
    const handlers = useTodayHandlers()
    const resolve = vi.fn()
    const reject = vi.fn()

    await handlers.handleCompleteTaskWithFeedback(
      { id: 'task-1', name: 'Task One', createdAt: new Date() },
      sampleFeedback,
      resolve,
      reject,
    )

    expect(completeWorkSessionMock).not.toHaveBeenCalled()
    expect(markCompletedMock).not.toHaveBeenCalled()
    expect(reject).toHaveBeenCalled()
    expect(resolve).not.toHaveBeenCalled()
  })

  it('simple complete: markCompleted only when no active timer', async () => {
    vi.resetModules()
    timerState.activeTask = null
    timerState.remoteWorkSessionId = null
    const { useTodayHandlers } = await import('@/composables/tasks/useTodayHandlers')
    const handlers = useTodayHandlers()

    await handlers.handleCompleteTask({
      id: 'task-2',
      name: 'Task Two',
      createdAt: new Date(),
    })

    expect(stopTimerMock).not.toHaveBeenCalled()
    expect(markCompletedMock).toHaveBeenCalledWith('task-2', true)
    expect(completeWorkSessionMock).not.toHaveBeenCalled()
  })

  it('simple complete: stopTimer then markCompleted for local active task', async () => {
    vi.resetModules()
    timerState.remoteWorkSessionId = null
    timerState.activeTask = { id: 'task-1', name: 'Task One' }
    const order: string[] = []
    stopTimerMock.mockImplementation(async () => {
      order.push('stopTimer')
    })
    markCompletedMock.mockImplementation(async () => {
      order.push('markCompleted')
      return { success: true }
    })
    const { useTodayHandlers } = await import('@/composables/tasks/useTodayHandlers')
    const handlers = useTodayHandlers()

    await handlers.handleCompleteTask({
      id: 'task-1',
      name: 'Task One',
      createdAt: new Date(),
    })

    expect(order).toEqual(['stopTimer', 'markCompleted'])
    expect(completeWorkSessionMock).not.toHaveBeenCalled()
  })

  it('simple complete: throws when markCompleted fails', async () => {
    vi.resetModules()
    timerState.activeTask = null
    timerState.remoteWorkSessionId = null
    markCompletedMock.mockResolvedValue({ success: false, error: 'nope' })
    const { useTodayHandlers } = await import('@/composables/tasks/useTodayHandlers')
    const handlers = useTodayHandlers()

    await expect(
      handlers.handleCompleteTask({
        id: 'task-2',
        name: 'Task Two',
        createdAt: new Date(),
      }),
    ).rejects.toThrow(/nope|completar/i)
  })
})
