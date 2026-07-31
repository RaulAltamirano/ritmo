import { beforeEach, describe, expect, it, vi } from 'vitest'

const gate = {
  setPendingStart: vi.fn(),
  requestDailyCheckinForPendingStart: vi.fn(),
  openConflict: vi.fn(),
}

const timerStore = {
  bindRemoteWorkSession: vi.fn(),
}

vi.mock('@/config/environment', () => ({
  loadConfig: () => ({
    api: { baseUrl: 'http://localhost:3001/api' },
  }),
}))

vi.mock('@/composables/timer/timerPresets', () => ({
  mapModeLabelToTimerMode: (name: string) =>
    name === 'Pomodoro' ? 'pomodoro' : 'pomodoro',
  mapPresetKeyToTimerMode: (key: string) =>
    key === '25_5' ? 'pomodoro' : 'custom',
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    user: { timezone: 'UTC' },
  }),
}))

vi.mock('@/stores/sessionGate', () => ({
  useSessionGateStore: () => gate,
}))

vi.mock('@/stores/timer', () => ({
  useTimerStore: () => timerStore,
}))

describe('tryStartRemoteWorkSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fails when backend create response does not include session id', async () => {
    const fetchMock = vi.fn()
    fetchMock.mockResolvedValueOnce({ data: { id: 'checkin-exists' } })
    fetchMock.mockResolvedValueOnce({ data: {} })
    ;(globalThis as any).$fetch = fetchMock

    const { tryStartRemoteWorkSession } = await import(
      '@/composables/timer/useRemoteWorkSession'
    )

    await expect(
      tryStartRemoteWorkSession(
        { id: 'task-1', name: 'Write tests' },
        { minutes: 25, name: 'Pomodoro' },
      ),
    ).rejects.toThrow('WORK_SESSION_CREATE_INVALID_RESPONSE')
  })

  it('binds remote id when check-in exists and create returns id', async () => {
    const fetchMock = vi.fn()
    fetchMock.mockResolvedValueOnce({ data: { id: 'check' } })
    fetchMock.mockResolvedValueOnce({ data: { id: 'ws-99' } })
    ;(globalThis as any).$fetch = fetchMock

    const { tryStartRemoteWorkSession } = await import(
      '@/composables/timer/useRemoteWorkSession'
    )

    await tryStartRemoteWorkSession(
      { id: 'task-1', name: 'T' },
      { minutes: 25, name: 'Pomodoro' },
    )
    expect(timerStore.bindRemoteWorkSession).toHaveBeenCalledWith('ws-99')
    const createCall = fetchMock.mock.calls[1] as [string, { body: Record<string, unknown> }]
    expect(createCall[1].body).toMatchObject({ breakDurationSec: 0 })
  })

  it('forwards breakDurationSec from mode.breakSec on create', async () => {
    const fetchMock = vi.fn()
    fetchMock.mockResolvedValueOnce({ data: { id: 'check' } })
    fetchMock.mockResolvedValueOnce({ data: { id: 'ws-99' } })
    ;(globalThis as any).$fetch = fetchMock

    const { tryStartRemoteWorkSession } = await import(
      '@/composables/timer/useRemoteWorkSession'
    )

    await tryStartRemoteWorkSession(
      { id: 'task-1', name: 'T' },
      { minutes: 25, name: 'Pomodoro', breakSec: 300, presetKey: '25_5' },
    )
    const createCall = fetchMock.mock.calls[1] as [string, { body: Record<string, unknown> }]
    expect(createCall[1].body).toMatchObject({
      targetDurationSec: 1500,
      breakDurationSec: 300,
      presetKey: '25_5',
      timerMode: 'pomodoro',
    })
  })

  it('on 404 for daily check-in, sets pending and throws CHECKIN_REQUIRED', async () => {
    const fetchMock = vi.fn().mockRejectedValueOnce({ status: 404, data: {} })
    ;(globalThis as any).$fetch = fetchMock

    const { tryStartRemoteWorkSession } = await import(
      '@/composables/timer/useRemoteWorkSession'
    )

    await expect(
      tryStartRemoteWorkSession(
        { id: 'task-1', name: 'T' },
        { minutes: 25, name: 'Pomodoro' },
      ),
    ).rejects.toThrow('CHECKIN_REQUIRED')
    expect(gate.setPendingStart).toHaveBeenCalled()
    expect(gate.requestDailyCheckinForPendingStart).toHaveBeenCalled()
  })

  it('on 409 for create, opens conflict with active session and throws', async () => {
    const fetchMock = vi.fn()
    fetchMock.mockResolvedValueOnce({ data: { id: 'c' } })
    fetchMock.mockRejectedValueOnce({
      status: 409,
      data: { error: { activeSessionId: 'act-1', state: 'running' } },
    })
    ;(globalThis as any).$fetch = fetchMock

    const { tryStartRemoteWorkSession } = await import(
      '@/composables/timer/useRemoteWorkSession'
    )

    await expect(
      tryStartRemoteWorkSession(
        { id: 'task-1', name: 'T' },
        { minutes: 25, name: 'Pomodoro' },
      ),
    ).rejects.toThrow('WORK_SESSION_CONFLICT')
    expect(gate.openConflict).toHaveBeenCalledWith('act-1', 'running')
  })

  it('on 409 without session ids, throws unresolved conflict', async () => {
    const fetchMock = vi.fn()
    fetchMock.mockResolvedValueOnce({ data: { id: 'c' } })
    fetchMock.mockRejectedValueOnce({
      status: 409,
      data: { error: { code: 'ACTIVE_SESSION_EXISTS' } },
    })
    ;(globalThis as any).$fetch = fetchMock

    const { tryStartRemoteWorkSession } = await import(
      '@/composables/timer/useRemoteWorkSession'
    )

    await expect(
      tryStartRemoteWorkSession(
        { id: 'task-1', name: 'T' },
        { minutes: 25, name: 'Pomodoro' },
      ),
    ).rejects.toThrow('WORK_SESSION_CONFLICT_UNRESOLVED')
    expect(gate.openConflict).not.toHaveBeenCalled()
  })
})
