import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

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
  abandonWorkSession: vi.fn(),
  patchWorkSession: vi.fn(),
}))

describe('timer store — remote heartbeat terminal errors', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('clears the remote session after a 404 heartbeat', async () => {
    const { useTimerStore } = await import('@/stores/timer')
    const store = useTimerStore()
    store.remoteWorkSessionId = 'ws_dead'
    store.activeTask = {
      id: 't1',
      name: 'T',
      timeLeft: 100,
      totalTime: 1500,
      type: 'Pomodoro',
      startedAt: new Date(),
      totalPausedTime: 0,
    }

    // @ts-expect-error test $fetch
    globalThis.$fetch = vi.fn().mockRejectedValue({ status: 404, data: {} })

    await store.patchRemoteHeartbeat()

    expect(store.remoteWorkSessionId).toBeNull()
  })

  it('clears the remote session after consecutive transient heartbeat failures', async () => {
    const { useTimerStore } = await import('@/stores/timer')
    const store = useTimerStore()
    store.remoteWorkSessionId = 'ws_flaky'
    store.activeTask = {
      id: 't1',
      name: 'T',
      timeLeft: 100,
      totalTime: 1500,
      type: 'Pomodoro',
      startedAt: new Date(),
      totalPausedTime: 0,
    }

    // @ts-expect-error test $fetch
    globalThis.$fetch = vi.fn().mockRejectedValue({ status: 500, data: {} })

    await store.patchRemoteHeartbeat()
    expect(store.remoteWorkSessionId).toBe('ws_flaky')
    await store.patchRemoteHeartbeat()
    expect(store.remoteWorkSessionId).toBe('ws_flaky')
    await store.patchRemoteHeartbeat()
    expect(store.remoteWorkSessionId).toBeNull()
  })
})
