import { useTimerStore } from '@/stores/timer'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

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

describe('timer store — onTimerNaturalFinished heartbeat race', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    // @ts-expect-error jsdom/node: inject a global $fetch
    globalThis.$fetch = vi.fn().mockResolvedValue({ data: {} })
    // @ts-expect-error mock minimal Nuxt `process.client`
    globalThis.process = { ...globalThis.process, client: true }
  })

  afterEach(() => {
    // @ts-expect-error cleanup
    delete globalThis.$fetch
  })

  it('cancels the pending heartbeat timer synchronously before dispatching pending_feedback', () => {
    const store = useTimerStore()
    store.remoteWorkSessionId = 'ws_123'
    store.activeTask = {
      id: 'task-A',
      name: 'Task A',
      timeLeft: 0,
      totalTime: 1500,
      type: 'Pomodoro',
      totalPausedTime: 0,
      startedAt: new Date(),
    }
    // Simulate a scheduled heartbeat (any non-null timeout handle)
    store.remoteHeartbeatTimer = setTimeout(() => {}, 60_000) as unknown as ReturnType<
      typeof setTimeout
    >

    store.onTimerNaturalFinished()

    // Synchronous assertion: the timer handle must be cleared
    // BEFORE any microtask/await can run a stale heartbeat PATCH.
    expect(store.remoteHeartbeatTimer).toBeNull()
  })

  it('sends exactly one PATCH with state=pending_feedback (no heartbeat race)', async () => {
    const store = useTimerStore()
    store.remoteWorkSessionId = 'ws_456'
    store.activeTask = {
      id: 'task-B',
      name: 'Task B',
      timeLeft: 0,
      totalTime: 1500,
      type: 'Pomodoro',
      totalPausedTime: 0,
      startedAt: new Date(),
    }
    store.remoteHeartbeatTimer = setTimeout(() => {}, 60_000) as unknown as ReturnType<
      typeof setTimeout
    >

    store.onTimerNaturalFinished()
    // Flush the IIFE (dynamic imports + awaited $fetch)
    await new Promise(resolve => setTimeout(resolve, 0))
    await new Promise(resolve => setTimeout(resolve, 0))

    // @ts-expect-error accessing the mock
    const { calls } = (globalThis.$fetch as ReturnType<typeof vi.fn>).mock
    const patchBodies = calls
      .filter(([_, opts]) => opts?.method === 'PATCH')
      .map(([, opts]) => opts.body)
    expect(patchBodies.length).toBe(1)
    expect(patchBodies[0].state).toBe('pending_feedback')
  })
})
