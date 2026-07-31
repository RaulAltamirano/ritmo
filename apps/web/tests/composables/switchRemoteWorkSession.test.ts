import { beforeEach, describe, expect, it, vi } from 'vitest'

const patchMock = vi.fn()
const abandonMock = vi.fn()
const createMock = vi.fn()

vi.mock('@/services/workSessionsApi', () => ({
  patchWorkSession: (...a: unknown[]) => patchMock(...a),
  abandonWorkSession: (...a: unknown[]) => abandonMock(...a),
  createWorkSession: (...a: unknown[]) => createMock(...a),
}))

vi.mock('@/composables/timer/timerPresets', () => ({
  mapPresetKeyToTimerMode: () => 'pomodoro',
  mapModeLabelToTimerMode: () => 'pomodoro',
}))

describe('switchRemoteWorkSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    patchMock.mockResolvedValue({})
    abandonMock.mockResolvedValue({})
    createMock.mockResolvedValue({ data: { id: 'ws_new' } })
  })

  it('patches, abandons, then creates with timeLeft when >= 60', async () => {
    const { switchRemoteWorkSession } = await import(
      '@/composables/timer/switchRemoteWorkSession'
    )
    const order: string[] = []
    patchMock.mockImplementation(async () => {
      order.push('patch')
    })
    abandonMock.mockImplementation(async () => {
      order.push('abandon')
    })
    createMock.mockImplementation(async () => {
      order.push('create')
      return { data: { id: 'ws_new' } }
    })

    const res = await switchRemoteWorkSession({
      fromSessionId: 'ws_old',
      toTask: { id: 'task-b', name: 'B' },
      timeLeftSec: 597,
      pausedDurationSec: 10,
      isPaused: false,
      mode: { minutes: 25, name: 'Pomodoro', presetKey: '25_5' },
    })

    expect(order).toEqual(['patch', 'abandon', 'create'])
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        taskId: 'task-b',
        targetDurationSec: 597,
        presetKey: '25_5',
      }),
    )
    expect(res).toEqual({
      newSessionId: 'ws_new',
      targetDurationSec: 597,
      usedFullPreset: false,
    })
  })

  it('uses full preset minutes*60 when timeLeft < 60', async () => {
    const { switchRemoteWorkSession } = await import(
      '@/composables/timer/switchRemoteWorkSession'
    )
    const res = await switchRemoteWorkSession({
      fromSessionId: 'ws_old',
      toTask: { id: 'task-b', name: 'B' },
      timeLeftSec: 45,
      pausedDurationSec: 0,
      isPaused: false,
      mode: { minutes: 25, name: 'Pomodoro', presetKey: '25_5' },
    })
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({ targetDurationSec: 1500 }),
    )
    expect(res.usedFullPreset).toBe(true)
    expect(res.targetDurationSec).toBe(1500)
  })

  it('does not create when abandon fails', async () => {
    abandonMock.mockRejectedValue(new Error('network'))
    const { switchRemoteWorkSession } = await import(
      '@/composables/timer/switchRemoteWorkSession'
    )
    await expect(
      switchRemoteWorkSession({
        fromSessionId: 'ws_old',
        toTask: { id: 'task-b', name: 'B' },
        timeLeftSec: 120,
        pausedDurationSec: 0,
        isPaused: false,
        mode: { minutes: 25, name: 'Pomodoro', presetKey: '25_5' },
      }),
    ).rejects.toThrow(/ABANDON_FAILED/)
    expect(createMock).not.toHaveBeenCalled()
  })
})
