import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const startTaskMock = vi.fn()
const showNotificationMock = vi.fn()
const tryStartRemoteMock = vi.fn()
const applyRemoteMock = vi.fn()
const openPromptMock = vi.fn()
const closePromptMock = vi.fn()
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
    presetKey?: string
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

vi.mock('@/composables/timer/applyRemoteTaskSwitch', () => ({
  applyRemoteTaskSwitch: (...a: unknown[]) => applyRemoteMock(...a),
}))

vi.mock('@/stores/sessionGate', () => ({
  useSessionGateStore: () => ({
    openTaskSwitchPrompt: openPromptMock,
    closeTaskSwitchPrompt: closePromptMock,
  }),
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
    applyRemoteMock.mockReset()
    applyRemoteMock.mockResolvedValue(undefined)
    openPromptMock.mockReset()
    closePromptMock.mockReset()
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

  it('switches remote with remaining time when presets match', async () => {
    vi.resetModules()
    timerState.activeTask = {
      id: 'task-a',
      name: 'A',
      timeLeft: 597,
      totalTime: 1500,
      totalPausedTime: 5,
      presetKey: '25_5',
    }
    timerState.remoteWorkSessionId = 'ws_old'
    timerState.isPaused = false
    const { useTaskTimer } = await import('@/composables/tasks/useTaskTimer')
    const { startTask } = useTaskTimer()
    await startTask({ id: 'task-b', name: 'B', createdAt: new Date() }, mode)

    expect(applyRemoteMock).toHaveBeenCalledWith({
      toTask: { id: 'task-b', name: 'B', category: undefined },
      mode: expect.objectContaining({ minutes: 25, presetKey: '25_5' }),
      durationPolicy: 'remaining',
    })
    expect(openPromptMock).not.toHaveBeenCalled()
  })

  it('pauses and prompts when presets differ and remaining time is too long', async () => {
    vi.resetModules()
    timerState.activeTask = {
      id: 'task-a',
      name: 'A',
      timeLeft: 3000,
      totalTime: 5400,
      totalPausedTime: 0,
    }
    timerState.remoteWorkSessionId = 'ws_old'
    timerState.isPaused = false
    const { useTaskTimer } = await import('@/composables/tasks/useTaskTimer')
    const { startTask } = useTaskTimer()
    await startTask({ id: 'task-b', name: 'B', createdAt: new Date() }, mode)

    expect(timerState.pauseTimer).toHaveBeenCalled()
    expect(openPromptMock).toHaveBeenCalledWith({
      toTask: { id: 'task-b', name: 'B', category: undefined },
      mode: expect.objectContaining({ minutes: 25, presetKey: '25_5' }),
      remainingSec: 3000,
      canContinueRemaining: false,
      fromTaskName: 'A',
    })
    expect(applyRemoteMock).not.toHaveBeenCalled()
  })

  it('allows continuing remaining time when it fits the new preset', async () => {
    vi.resetModules()
    timerState.activeTask = {
      id: 'task-a',
      name: 'A',
      timeLeft: 600,
      totalTime: 5400,
      totalPausedTime: 0,
    }
    timerState.remoteWorkSessionId = 'ws_old'
    const { useTaskTimer } = await import('@/composables/tasks/useTaskTimer')
    const { startTask } = useTaskTimer()
    await startTask({ id: 'task-b', name: 'B', createdAt: new Date() }, mode)

    expect(openPromptMock).toHaveBeenCalledWith(
      expect.objectContaining({
        remainingSec: 600,
        canContinueRemaining: true,
      }),
    )
    expect(applyRemoteMock).not.toHaveBeenCalled()
  })
})
