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

const patchWorkSessionMock = vi.fn()

vi.mock('@/services/workSessionsApi', () => ({
  abandonWorkSession: vi.fn(),
  patchWorkSession: (...args: unknown[]) => patchWorkSessionMock(...args),
}))

describe('timer store — remote heartbeat terminal errors', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('clears the remote session after a 404 heartbeat', async () => {
    patchWorkSessionMock.mockRejectedValue({ status: 404, data: {} })
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

    await store.patchRemoteHeartbeat()

    expect(store.remoteWorkSessionId).toBeNull()
  })

  it('clears the remote session after consecutive transient heartbeat failures', async () => {
    patchWorkSessionMock.mockRejectedValue({ status: 500, data: {} })
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

    await store.patchRemoteHeartbeat()
    expect(store.remoteWorkSessionId).toBe('ws_flaky')
    await store.patchRemoteHeartbeat()
    expect(store.remoteWorkSessionId).toBe('ws_flaky')
    await store.patchRemoteHeartbeat()
    expect(store.remoteWorkSessionId).toBeNull()
  })

  it('sends on_break and breakPausedDurationSec during break phase', async () => {
    patchWorkSessionMock.mockResolvedValue({ data: {} })
    const { useTimerStore } = await import('@/stores/timer')
    const store = useTimerStore()
    store.remoteWorkSessionId = 'ws_break'
    store.phase = 'break'
    store.breakDurationSec = 300
    store.breakStartedAt = new Date(Date.now() - 60_000)
    store.breakPausedDurationSec = 10
    store.activeTask = {
      id: 't1',
      name: 'T',
      timeLeft: 230,
      totalTime: 300,
      type: 'Descanso',
      startedAt: new Date(),
      totalPausedTime: 0,
    }

    await store.patchRemoteHeartbeat()

    expect(patchWorkSessionMock).toHaveBeenCalledWith(
      'ws_break',
      expect.objectContaining({
        state: 'on_break',
        breakPausedDurationSec: expect.any(Number),
      }),
    )
    const body = patchWorkSessionMock.mock.calls[0][1] as {
      breakPausedDurationSec: number
    }
    expect(body.breakPausedDurationSec).toBeGreaterThanOrEqual(10)
  })
})
