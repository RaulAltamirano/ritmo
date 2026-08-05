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

function seedFocusThenBreak(store: ReturnType<typeof import('@/stores/timer').useTimerStore>) {
  store.activeTask = {
    id: 't1',
    name: 'Task',
    timeLeft: 300,
    totalTime: 300,
    type: 'Pomodoro',
    totalPausedTime: 0,
    startedAt: new Date(),
  }
  store.enterBreakPhase(300)
}

describe('timer store — break modal flag', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    patchWorkSessionMock.mockResolvedValue({ data: {} })
    globalThis.process = { ...globalThis.process, client: true }
  })

  it('enterBreakPhase sets breakModalOpen true', async () => {
    const { useTimerStore } = await import('@/stores/timer')
    const store = useTimerStore()
    seedFocusThenBreak(store)
    expect(store.breakModalOpen).toBe(true)
    expect(store.phase).toBe('break')
  })

  it('dismissBreakModal closes flag without ending break', async () => {
    const { useTimerStore } = await import('@/stores/timer')
    const store = useTimerStore()
    seedFocusThenBreak(store)
    store.dismissBreakModal()
    expect(store.breakModalOpen).toBe(false)
    expect(store.phase).toBe('break')
    expect(store.isRunning).toBe(true)
  })

  it('openBreakModal only works in break phase', async () => {
    const { useTimerStore } = await import('@/stores/timer')
    const store = useTimerStore()
    store.activeTask = {
      id: 't1',
      name: 'Task',
      timeLeft: 100,
      totalTime: 1500,
      type: 'Pomodoro',
      totalPausedTime: 0,
      startedAt: new Date(),
    }
    store.phase = 'focus'
    store.openBreakModal()
    expect(store.breakModalOpen).toBe(false)
    store.enterBreakPhase(120)
    store.dismissBreakModal()
    store.openBreakModal()
    expect(store.breakModalOpen).toBe(true)
  })

  it('finishBreak clears breakModalOpen', async () => {
    const { useTimerStore } = await import('@/stores/timer')
    const store = useTimerStore()
    seedFocusThenBreak(store)
    await store.finishBreak()
    expect(store.breakModalOpen).toBe(false)
  })

  it('hydrateFromActiveRemoteSession on_break opens modal when break still running', async () => {
    const { useTimerStore } = await import('@/stores/timer')
    const store = useTimerStore()
    store.hydrateFromActiveRemoteSession({
      id: 'ws_1',
      state: 'on_break',
      startTime: new Date(Date.now() - 30 * 60_000).toISOString(),
      targetDurationSec: 1500,
      pausedDurationSec: 0,
      breakDurationSec: 300,
      breakStartedAt: new Date().toISOString(),
      breakPausedDurationSec: 0,
      task: { id: 't1', title: 'Task' },
      timerMode: 'pomodoro',
      presetKey: '25_5',
    })
    expect(store.phase).toBe('break')
    expect(store.breakModalOpen).toBe(true)
  })
})
