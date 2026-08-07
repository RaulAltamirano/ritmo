import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const switchRemoteMock = vi.fn()
const refreshSummaryMock = vi.fn()
const startTaskMock = vi.fn()
const clearRemoteMock = vi.fn()
const bindRemoteMock = vi.fn()
const resumeTimerMock = vi.fn()
const showNotificationMock = vi.fn()

const timerState = {
  activeTask: {
    id: 'task-a',
    name: 'A',
    timeLeft: 600,
    totalTime: 1500,
    totalPausedTime: 5,
    startedAt: new Date('2026-01-01T00:00:00Z'),
    pausedAt: undefined,
  } as {
    id: string
    name: string
    timeLeft: number
    totalTime: number
    totalPausedTime: number
    startedAt: Date
    pausedAt?: Date
  } | null,
  remoteWorkSessionId: 'ws_old' as string | null,
  isPaused: true,
  startTask: startTaskMock,
  clearRemoteWorkSession: clearRemoteMock,
  bindRemoteWorkSession: bindRemoteMock,
  resumeTimer: resumeTimerMock,
  showNotification: showNotificationMock,
}

vi.mock('@/stores/timer', () => ({
  useTimerStore: () => timerState,
}))

vi.mock('@/stores/workSessionSummary', () => ({
  useWorkSessionSummaryStore: () => ({ refresh: refreshSummaryMock }),
}))

vi.mock('@/composables/timer/switchRemoteWorkSession', () => ({
  switchRemoteWorkSession: (...args: unknown[]) => switchRemoteMock(...args),
}))

const input = {
  toTask: { id: 'task-b', name: 'B' },
  mode: { minutes: 25, name: 'Pomodoro', presetKey: '25_5' },
  durationPolicy: 'remaining' as const,
}

describe('applyRemoteTaskSwitch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    timerState.activeTask = {
      id: 'task-a',
      name: 'A',
      timeLeft: 600,
      totalTime: 1500,
      totalPausedTime: 5,
      startedAt: new Date('2026-01-01T00:00:00Z'),
    }
    timerState.remoteWorkSessionId = 'ws_old'
    timerState.isPaused = true
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('applies the remote switch and resumes the new task', async () => {
    switchRemoteMock.mockResolvedValue({
      newSessionId: 'ws_new',
      targetDurationSec: 600,
      usedFullPreset: false,
    })
    const { applyRemoteTaskSwitch } = await import(
      '@/composables/timer/applyRemoteTaskSwitch'
    )

    await applyRemoteTaskSwitch(input)

    expect(switchRemoteMock).toHaveBeenCalledWith(
      expect.objectContaining({
        fromSessionId: 'ws_old',
        timeLeftSec: 600,
        pausedDurationSec: 5,
        isPaused: true,
        durationPolicy: 'remaining',
      }),
    )
    expect(clearRemoteMock).toHaveBeenCalled()
    expect(startTaskMock).toHaveBeenCalledWith(input.toTask, input.mode)
    expect(bindRemoteMock).toHaveBeenCalledWith('ws_new', {
      immediateHeartbeat: false,
    })
    expect(refreshSummaryMock).toHaveBeenCalled()
    expect(resumeTimerMock).toHaveBeenCalled()
  })

  it('does not attribute the switch prompt pause to the new task', async () => {
    const promptOpenedAt = new Date('2026-01-01T00:10:00Z')
    timerState.activeTask!.pausedAt = promptOpenedAt
    vi.spyOn(Date, 'now').mockReturnValue(new Date('2026-01-01T00:12:00Z').getTime())
    resumeTimerMock.mockImplementation(() => {
      const activeTask = timerState.activeTask
      if (!activeTask?.pausedAt) return
      activeTask.totalPausedTime += 120
      activeTask.pausedAt = undefined
    })
    switchRemoteMock.mockResolvedValue({
      newSessionId: 'ws_new',
      targetDurationSec: 600,
      usedFullPreset: false,
    })
    const { applyRemoteTaskSwitch } = await import(
      '@/composables/timer/applyRemoteTaskSwitch'
    )

    await applyRemoteTaskSwitch(input)

    expect(switchRemoteMock).toHaveBeenCalledWith(
      expect.objectContaining({ pausedDurationSec: 125 }),
    )
    expect(timerState.activeTask?.pausedAt).toBeUndefined()
    expect(timerState.activeTask?.totalPausedTime).toBe(5)
  })

  it('resets the local clock when a full preset is selected', async () => {
    switchRemoteMock.mockResolvedValue({
      newSessionId: 'ws_new',
      targetDurationSec: 1500,
      usedFullPreset: true,
    })
    const { applyRemoteTaskSwitch } = await import(
      '@/composables/timer/applyRemoteTaskSwitch'
    )

    await applyRemoteTaskSwitch({ ...input, durationPolicy: 'full_preset' })

    expect(timerState.activeTask).toEqual(
      expect.objectContaining({
        timeLeft: 1500,
        totalTime: 1500,
        totalPausedTime: 0,
      }),
    )
    expect(timerState.activeTask?.startedAt.getTime()).toBeGreaterThan(
      new Date('2026-01-01T00:00:00Z').getTime(),
    )
    expect(showNotificationMock).not.toHaveBeenCalledWith(
      'Nuevo bloque iniciado',
      expect.stringContaining('menos de un minuto'),
      'info',
    )
  })

  it('leaves the current task paused when abandon fails', async () => {
    switchRemoteMock.mockRejectedValue(new Error('WORK_SESSION_ABANDON_FAILED'))
    const { applyRemoteTaskSwitch } = await import(
      '@/composables/timer/applyRemoteTaskSwitch'
    )

    await applyRemoteTaskSwitch(input)

    expect(startTaskMock).not.toHaveBeenCalled()
    expect(resumeTimerMock).not.toHaveBeenCalled()
    expect(showNotificationMock).toHaveBeenCalledWith(
      'No se pudo cambiar de tarea',
      expect.any(String),
      'error',
    )
  })

  it('falls back to a running local switch when remote creation fails', async () => {
    switchRemoteMock.mockRejectedValue(new Error('network down'))
    const { applyRemoteTaskSwitch } = await import(
      '@/composables/timer/applyRemoteTaskSwitch'
    )

    await applyRemoteTaskSwitch(input)

    expect(clearRemoteMock).toHaveBeenCalled()
    expect(startTaskMock).toHaveBeenCalledWith(input.toTask, input.mode)
    expect(refreshSummaryMock).toHaveBeenCalled()
    expect(resumeTimerMock).toHaveBeenCalled()
    expect(showNotificationMock).toHaveBeenCalledWith(
      'Sesión remota no iniciada',
      expect.any(String),
      'warning',
    )
  })
})
