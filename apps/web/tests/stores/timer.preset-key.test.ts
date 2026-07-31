import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useTimerStore } from '@/stores/timer'

vi.mock('@/utils/secureStorage', () => ({
  secureSet: vi.fn(),
  secureGet: vi.fn().mockResolvedValue(null),
}))

describe('timer store preset key', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('stores the preset key when starting a task', () => {
    const store = useTimerStore()

    store.startTask(
      { id: 'task-a', name: 'A' },
      { minutes: 25, name: 'Pomodoro', presetKey: '25_5' },
    )

    expect(store.activeTask?.presetKey).toBe('25_5')
    store.cleanup()
  })

  it('updates the preset key when switching tasks', () => {
    const store = useTimerStore()
    store.startTask(
      { id: 'task-a', name: 'A' },
      { minutes: 25, name: 'Pomodoro', presetKey: '25_5' },
    )

    store.startTask(
      { id: 'task-b', name: 'B' },
      { minutes: 52, name: 'Ultradiano', presetKey: '52_17' },
    )

    expect(store.activeTask?.presetKey).toBe('52_17')
    store.cleanup()
  })

  it('preserves a 90-minute preset when hydrating a continued remote block', () => {
    vi.spyOn(Date, 'now').mockReturnValue(
      new Date('2026-07-31T10:40:00.000Z').getTime(),
    )
    // @ts-expect-error test $fetch
    globalThis.$fetch = vi.fn().mockResolvedValue({})
    const store = useTimerStore()

    store.hydrateFromActiveRemoteSession({
      id: 'ws-90',
      state: 'running',
      startTime: '2026-07-31T10:00:00.000Z',
      targetDurationSec: 90 * 60,
      pausedDurationSec: 0,
      timerMode: 'ultradian',
      presetKey: '90_20',
      task: { id: 'task-a', title: 'Deep work' },
    })

    expect(store.activeTask).toEqual(
      expect.objectContaining({
        totalTime: 90 * 60,
        timeLeft: 50 * 60,
        presetKey: '90_20',
      }),
    )
    store.clearRemoteWorkSession()
    store.cleanup()
  })

  it('infers a known preset from mode and target duration for legacy payloads', () => {
    vi.spyOn(Date, 'now').mockReturnValue(
      new Date('2026-07-31T10:40:00.000Z').getTime(),
    )
    // @ts-expect-error test $fetch
    globalThis.$fetch = vi.fn().mockResolvedValue({})
    const store = useTimerStore()

    store.hydrateFromActiveRemoteSession({
      id: 'ws-legacy-90',
      state: 'running',
      startTime: '2026-07-31T10:00:00.000Z',
      targetDurationSec: 90 * 60,
      pausedDurationSec: 0,
      timerMode: 'ultradian',
      task: { id: 'task-a', title: 'Deep work' },
    })

    expect(store.activeTask?.presetKey).toBe('90_20')
    store.clearRemoteWorkSession()
    store.cleanup()
  })
})
