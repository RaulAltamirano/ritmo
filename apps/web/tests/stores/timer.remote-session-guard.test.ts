import { useTimerStore } from '@/stores/timer'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/utils/secureStorage', () => ({
  secureSet: vi.fn(),
  secureGet: vi.fn().mockResolvedValue(null),
}))

describe('timer store remote-session guard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('does not switch active task locally when a remote session is bound', () => {
    const store = useTimerStore()
    store.activeTask = {
      id: 'task-A',
      name: 'Task A',
      timeLeft: 1200,
      totalTime: 1500,
      type: 'Pomodoro',
      category: 'Focus',
      totalPausedTime: 0,
      startedAt: new Date(),
    }
    store.isRunning = true
    store.remoteWorkSessionId = 'ws_123'

    store.startTask(
      { id: 'task-B', name: 'Task B', category: 'Deep work' },
      { minutes: 52, name: 'Ultradiano' },
    )

    expect(store.activeTask.id).toBe('task-A')
    expect(store.activeTask.name).toBe('Task A')
  })
})
