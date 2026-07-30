import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const abandonWorkSessionMock = vi.fn()

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
  abandonWorkSession: (...args: unknown[]) => abandonWorkSessionMock(...args),
  patchWorkSession: vi.fn(),
}))

describe('timer store — stopTimer abandons remote session', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    abandonWorkSessionMock.mockResolvedValue({ success: true })
    // @ts-expect-error jsdom/node: inject a global $fetch
    globalThis.$fetch = vi.fn().mockResolvedValue({ data: {} })
  })

  it('abandons the remote work session when stopping the timer', async () => {
    const { useTimerStore } = await import('@/stores/timer')
    const store = useTimerStore()
    store.remoteWorkSessionId = 'ws_123'
    store.activeTask = {
      id: 'task-A',
      name: 'Task A',
      timeLeft: 100,
      totalTime: 1500,
      type: 'Pomodoro',
      startedAt: new Date(),
      totalPausedTime: 0,
    }
    store.isRunning = true

    await store.stopTimer()

    expect(store.activeTask).toBeNull()
    expect(store.remoteWorkSessionId).toBeNull()
    expect(abandonWorkSessionMock).toHaveBeenCalledWith('ws_123')
  })

  it('does not abandon when closeTimer is used after a successful complete', async () => {
    const { useTimerStore } = await import('@/stores/timer')
    const store = useTimerStore()
    store.remoteWorkSessionId = 'ws_123'
    store.activeTask = {
      id: 'task-A',
      name: 'Task A',
      timeLeft: 0,
      totalTime: 1500,
      type: 'Pomodoro',
      startedAt: new Date(),
      totalPausedTime: 0,
    }

    store.closeTimer()

    expect(store.activeTask).toBeNull()
    expect(store.remoteWorkSessionId).toBeNull()
    expect(abandonWorkSessionMock).not.toHaveBeenCalled()
  })
})
