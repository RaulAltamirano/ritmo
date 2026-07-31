import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const startTaskMock = vi.fn()
const showNotificationMock = vi.fn()
const tryStartRemoteMock = vi.fn()

const timerState = {
  activeTask: null as { id: string; name: string; timeLeft?: number; totalTime?: number } | null,
  isPaused: false,
  remoteWorkSessionId: null as string | null,
  startTask: startTaskMock,
  showNotification: showNotificationMock,
  pauseTimer: vi.fn(),
  resumeTimer: vi.fn(),
  stopTimer: vi.fn(),
  getFormattedTimeLeft: '25:00',
}

vi.mock('@/stores/timer', () => ({
  useTimerStore: () => timerState,
}))

vi.mock('@/composables/timer/useRemoteWorkSession', () => ({
  tryStartRemoteWorkSession: (...args: unknown[]) => tryStartRemoteMock(...args),
}))

const mode = {
  id: 'pomodoro-25-5',
  name: 'Pomodoro',
  description: '',
  duration: '25m',
  time: 1500,
  color: '',
  icon: '',
  minutes: 25,
  presetKey: '25_5',
}

describe('useTaskTimer', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    timerState.activeTask = null
    timerState.remoteWorkSessionId = null
    timerState.isPaused = false
    tryStartRemoteMock.mockResolvedValue(undefined)
  })

  it('preserves task duration instead of hardcoding 25m', async () => {
    vi.resetModules()
    const { useTaskTimer } = await import('@/composables/tasks/useTaskTimer')
    const { convertToTaskItemFormat } = useTaskTimer()
    const formatted = convertToTaskItemFormat({
      id: 't1',
      name: 'Deep work',
      createdAt: new Date(),
      duration: '45m',
    })
    expect(formatted.duration).toBe('45m')
  })

  it('omits duration when the task has none', async () => {
    vi.resetModules()
    const { useTaskTimer } = await import('@/composables/tasks/useTaskTimer')
    const { convertToTaskItemFormat } = useTaskTimer()
    const formatted = convertToTaskItemFormat({
      id: 't2',
      name: 'Quick',
      createdAt: new Date(),
    })
    expect(formatted.duration).toBeUndefined()
  })

  it('warns and starts local timer when remote start fails generically', async () => {
    vi.resetModules()
    tryStartRemoteMock.mockRejectedValue(new Error('network down'))
    const { useTaskTimer } = await import('@/composables/tasks/useTaskTimer')
    const { startTask } = useTaskTimer()
    await startTask({ id: 't1', name: 'Deep work', createdAt: new Date() }, mode)

    expect(showNotificationMock).toHaveBeenCalled()
    const [title, , type] = showNotificationMock.mock.calls[0]!
    expect(String(title)).toMatch(/sesión remota/i)
    expect(type).toBe('warning')
    expect(startTaskMock).toHaveBeenCalled()
  })

  it('does not start local timer on CHECKIN_REQUIRED', async () => {
    vi.resetModules()
    tryStartRemoteMock.mockRejectedValue(new Error('CHECKIN_REQUIRED'))
    const { useTaskTimer } = await import('@/composables/tasks/useTaskTimer')
    const { startTask } = useTaskTimer()
    await startTask({ id: 't1', name: 'Deep work', createdAt: new Date() }, mode)

    expect(startTaskMock).not.toHaveBeenCalled()
  })
})
