import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const startTaskMock = vi.fn()
const showNotificationMock = vi.fn()
const tryStartRemoteMock = vi.fn()
const switchRemoteMock = vi.fn()
const clearRemoteMock = vi.fn()
const bindRemoteMock = vi.fn()
const refreshSummaryMock = vi.fn()

const timerState = {
  activeTask: null as {
    id: string
    name: string
    timeLeft: number
    totalTime?: number
    totalPausedTime?: number
    startedAt?: Date
  } | null,
  isPaused: false,
  remoteWorkSessionId: null as string | null,
  startTask: startTaskMock,
  showNotification: showNotificationMock,
  pauseTimer: vi.fn(),
  resumeTimer: vi.fn(),
  stopTimer: vi.fn(),
  clearRemoteWorkSession: clearRemoteMock,
  bindRemoteWorkSession: bindRemoteMock,
  getFormattedTimeLeft: '25:00',
}

vi.mock('@/stores/timer', () => ({
  useTimerStore: () => timerState,
}))

vi.mock('@/composables/timer/useRemoteWorkSession', () => ({
  tryStartRemoteWorkSession: (...args: unknown[]) => tryStartRemoteMock(...args),
}))

vi.mock('@/composables/timer/switchRemoteWorkSession', () => ({
  switchRemoteWorkSession: (...a: unknown[]) => switchRemoteMock(...a),
}))

vi.mock('@/stores/workSessionSummary', () => ({
  useWorkSessionSummaryStore: () => ({ refresh: refreshSummaryMock }),
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
    switchRemoteMock.mockReset()
    clearRemoteMock.mockReset()
    bindRemoteMock.mockReset()
    refreshSummaryMock.mockReset()
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

  it('warns on WORK_SESSION_CONFLICT_UNRESOLVED and does not start local timer', async () => {
    vi.resetModules()
    tryStartRemoteMock.mockRejectedValue(new Error('WORK_SESSION_CONFLICT_UNRESOLVED'))
    const { useTaskTimer } = await import('@/composables/tasks/useTaskTimer')
    const { startTask } = useTaskTimer()
    await startTask({ id: 't1', name: 'Deep work', createdAt: new Date() }, mode)

    expect(showNotificationMock).toHaveBeenCalled()
    const [title, , type] = showNotificationMock.mock.calls[0]!
    expect(String(title)).toMatch(/iniciar/i)
    expect(type).toBe('warning')
    expect(startTaskMock).not.toHaveBeenCalled()
  })

  it('does not start local timer on WORK_SESSION_CONFLICT (gate handles UI)', async () => {
    vi.resetModules()
    tryStartRemoteMock.mockRejectedValue(new Error('WORK_SESSION_CONFLICT'))
    const { useTaskTimer } = await import('@/composables/tasks/useTaskTimer')
    const { startTask } = useTaskTimer()
    await startTask({ id: 't1', name: 'Deep work', createdAt: new Date() }, mode)

    expect(showNotificationMock).not.toHaveBeenCalled()
    expect(startTaskMock).not.toHaveBeenCalled()
  })

  it('switches remote: abandon helper then local startTask with same timeLeft path', async () => {
    vi.resetModules()
    timerState.activeTask = {
      id: 'task-a',
      name: 'A',
      timeLeft: 597,
      totalTime: 1500,
      totalPausedTime: 5,
    }
    timerState.remoteWorkSessionId = 'ws_old'
    timerState.isPaused = false
    switchRemoteMock.mockResolvedValue({
      newSessionId: 'ws_new',
      targetDurationSec: 597,
      usedFullPreset: false,
    })
    const { useTaskTimer } = await import('@/composables/tasks/useTaskTimer')
    const { startTask } = useTaskTimer()
    await startTask({ id: 'task-b', name: 'B', createdAt: new Date() }, mode)

    expect(switchRemoteMock).toHaveBeenCalledWith(
      expect.objectContaining({
        fromSessionId: 'ws_old',
        toTask: expect.objectContaining({ id: 'task-b' }),
        timeLeftSec: 597,
      }),
    )
    expect(clearRemoteMock).toHaveBeenCalled()
    expect(bindRemoteMock).toHaveBeenCalledWith('ws_new')
    expect(startTaskMock).toHaveBeenCalled()
    expect(showNotificationMock).not.toHaveBeenCalledWith(
      expect.stringMatching(/No se puede cambiar/i),
      expect.anything(),
      expect.anything(),
    )
    expect(refreshSummaryMock).toHaveBeenCalled()
  })

  it('does not switch local when abandon fails', async () => {
    vi.resetModules()
    timerState.activeTask = {
      id: 'task-a',
      name: 'A',
      timeLeft: 100,
      totalTime: 1500,
      totalPausedTime: 0,
    }
    timerState.remoteWorkSessionId = 'ws_old'
    switchRemoteMock.mockRejectedValue(new Error('WORK_SESSION_ABANDON_FAILED'))
    const { useTaskTimer } = await import('@/composables/tasks/useTaskTimer')
    const { startTask } = useTaskTimer()
    await startTask({ id: 'task-b', name: 'B', createdAt: new Date() }, mode)

    expect(startTaskMock).not.toHaveBeenCalled()
    expect(bindRemoteMock).not.toHaveBeenCalled()
    expect(showNotificationMock).toHaveBeenCalled()
  })
})
