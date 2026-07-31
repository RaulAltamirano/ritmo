import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const patchWorkSessionMock = vi.fn()
const openFeedbackMock = vi.fn()
const notifyMock = vi.fn()

vi.mock('@/utils/secureStorage', () => ({
  secureSet: vi.fn(),
  secureGet: vi.fn().mockResolvedValue(null),
}))

vi.mock('@/config/environment', () => ({
  loadConfig: () => ({
    api: { baseUrl: 'http://localhost:3001/api' },
    timer: { reflectionModalRequired: true },
  }),
}))

vi.mock('@/services/workSessionsApi', () => ({
  patchWorkSession: (...args: unknown[]) => patchWorkSessionMock(...args),
  abandonWorkSession: vi.fn(),
}))

vi.mock('@/stores/sessionGate', () => ({
  useSessionGateStore: () => ({
    openFeedback: openFeedbackMock,
  }),
}))

vi.mock('@/composables/shared/useNotify', () => ({
  useNotify: () => ({
    notify: notifyMock,
  }),
}))

describe('timer store — break cycle', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    patchWorkSessionMock.mockResolvedValue({ data: {} })
    // @ts-expect-error mock minimal Nuxt `process.client`
    globalThis.process = { ...globalThis.process, client: true }
  })

  it('focus end with remote + breakDurationSec>0 PATCHes on_break and enters break phase', async () => {
    const { useTimerStore } = await import('@/stores/timer')
    const store = useTimerStore()
    store.remoteWorkSessionId = 'ws_123'
    store.breakDurationSec = 300
    store.activeTask = {
      id: 'task-A',
      name: 'Task A',
      timeLeft: 0,
      totalTime: 1500,
      type: 'Pomodoro',
      totalPausedTime: 30,
      startedAt: new Date(),
    }

    store.onTimerNaturalFinished()
    await new Promise(resolve => setTimeout(resolve, 0))
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(patchWorkSessionMock).toHaveBeenCalledTimes(2)
    expect(patchWorkSessionMock).toHaveBeenNthCalledWith(
      1,
      'ws_123',
      expect.objectContaining({ state: 'on_break', pausedDurationSec: 30 }),
    )
    expect(patchWorkSessionMock).toHaveBeenNthCalledWith(
      2,
      'ws_123',
      expect.objectContaining({ state: 'on_break' }),
    )
    expect(store.phase).toBe('break')
    expect(store.breakStartedAt).toBeInstanceOf(Date)
    expect(store.activeTask?.timeLeft).toBe(300)
  })

  it('focus end with breakDurationSec=0 PATCHes pending_feedback and opens feedback', async () => {
    const { useTimerStore } = await import('@/stores/timer')
    const store = useTimerStore()
    store.remoteWorkSessionId = 'ws_456'
    store.breakDurationSec = 0
    store.activeTask = {
      id: 'task-B',
      name: 'Task B',
      timeLeft: 0,
      totalTime: 1500,
      type: 'Pomodoro',
      totalPausedTime: 0,
      startedAt: new Date(),
    }

    store.onTimerNaturalFinished()
    await new Promise(resolve => setTimeout(resolve, 0))
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(patchWorkSessionMock).toHaveBeenCalledWith(
      'ws_456',
      expect.objectContaining({ state: 'pending_feedback' }),
    )
    expect(openFeedbackMock).toHaveBeenCalledWith('ws_456')
  })

  it('skipBreak PATCHes pending_feedback and opens feedback', async () => {
    const { useTimerStore } = await import('@/stores/timer')
    const store = useTimerStore()
    store.remoteWorkSessionId = 'ws_789'
    store.phase = 'break'
    store.breakDurationSec = 300
    store.breakStartedAt = new Date()
    store.activeTask = {
      id: 'task-C',
      name: 'Task C',
      timeLeft: 180,
      totalTime: 300,
      type: 'Descanso',
      totalPausedTime: 0,
      startedAt: new Date(),
    }

    await store.skipBreak()

    expect(patchWorkSessionMock).toHaveBeenCalledWith(
      'ws_789',
      expect.objectContaining({ state: 'pending_feedback' }),
    )
    expect(openFeedbackMock).toHaveBeenCalledWith('ws_789')
  })

  it('local-only focus end with break enters break phase without patch', async () => {
    const { useTimerStore } = await import('@/stores/timer')
    const store = useTimerStore()
    store.breakDurationSec = 300
    store.activeTask = {
      id: 'task-D',
      name: 'Task D',
      timeLeft: 0,
      totalTime: 1500,
      type: 'Pomodoro',
      totalPausedTime: 0,
      startedAt: new Date(),
    }

    store.onTimerNaturalFinished()

    expect(patchWorkSessionMock).not.toHaveBeenCalled()
    expect(store.phase).toBe('break')
    expect(store.activeTask?.timeLeft).toBe(300)
  })

  it('local-only break end completes the task', async () => {
    const { useTimerStore } = await import('@/stores/timer')
    const store = useTimerStore()
    store.breakDurationSec = 2
    store.activeTask = {
      id: 'task-E',
      name: 'Task E',
      timeLeft: 1,
      totalTime: 2,
      type: 'Descanso',
      totalPausedTime: 0,
      startedAt: new Date(),
    }
    store.phase = 'break'
    store.breakStartedAt = new Date(Date.now() - 2_000)
    store.breakPausedDurationSec = 0
    store.isRunning = true

    store.startTimerInterval()
    await new Promise(resolve => setTimeout(resolve, 1_500))

    expect(store.activeTask).toBeNull()
    expect(store.phase).toBe('focus')
  })
})
