import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useNotify } from '@/composables/shared/useNotify'

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
    const { dismiss, state } = useNotify()
    ;[...state.messages].forEach(m => dismiss(m.id))
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

  it('keeps remoteWorkSessionId and notifies when abandon fails', async () => {
    abandonWorkSessionMock.mockRejectedValue(new Error('network'))
    const { useTimerStore } = await import('@/stores/timer')
    const store = useTimerStore()
    store.remoteWorkSessionId = 'ws_fail'
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

    await expect(store.stopTimer()).rejects.toThrow(/ABANDON_FAILED/)

    expect(store.activeTask).toBeNull()
    expect(store.isRunning).toBe(false)
    expect(store.remoteWorkSessionId).toBe('ws_fail')
    expect(useNotify().state.messages.some(m => m.type === 'error')).toBe(true)
  })

  it('showNotification routes through useNotify', async () => {
    const { useTimerStore } = await import('@/stores/timer')
    const store = useTimerStore()
    store.showNotification('Hola', 'detalle', 'warning')
    const msgs = useNotify().state.messages
    expect(msgs.some(m => m.title === 'Hola' && m.type === 'warning')).toBe(true)
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
