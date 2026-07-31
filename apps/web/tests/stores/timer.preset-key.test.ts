import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
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
})
