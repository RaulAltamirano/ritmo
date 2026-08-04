import {
  mapModeLabelToTimerMode,
  mapPresetKeyToTimerMode,
} from '@/composables/timer/timerPresets'
import {
  abandonWorkSession,
  createWorkSession,
  patchWorkSession,
} from '@/services/workSessionsApi'
import { parseFetchError } from '@/utils/parseFetchError'

export type SwitchDurationPolicy = 'remaining' | 'full_preset'

export type SwitchRemoteInput = {
  fromSessionId: string
  toTask: { id: string; name: string; category?: string }
  timeLeftSec: number
  pausedDurationSec: number
  isPaused: boolean
  mode: {
    minutes: number
    name: string
    presetKey?: string
    breakSec?: number
  }
  /** default 'remaining' — preserves <60s upgrade behavior */
  durationPolicy?: SwitchDurationPolicy
}

export type SwitchRemoteResult = {
  newSessionId: string
  /** Actual targetDurationSec sent to create (remaining or full preset). */
  targetDurationSec: number
  usedFullPreset: boolean
}

/**
 * Orquesta el "split silencioso" de un bloque remoto al cambiar de tarea:
 * heartbeat final → abandonar el bloque previo → crear uno nuevo con el tiempo
 * restante (o el preset completo si quedaba < 60s). No muta `activeTask`.
 */
export async function switchRemoteWorkSession(
  input: SwitchRemoteInput,
): Promise<SwitchRemoteResult> {
  const policy = input.durationPolicy ?? 'remaining'
  const usedFullPreset = policy === 'full_preset' || input.timeLeftSec < 60
  const targetDurationSec = usedFullPreset
    ? Math.max(60, input.mode.minutes * 60)
    : Math.floor(input.timeLeftSec)

  try {
    await patchWorkSession(input.fromSessionId, {
      lastClientSeenAt: new Date().toISOString(),
      state: input.isPaused ? 'paused' : 'running',
      pausedDurationSec: input.pausedDurationSec,
    })
  } catch {
    /* best-effort heartbeat before abandon */
  }

  try {
    await abandonWorkSession(input.fromSessionId)
  } catch {
    throw new Error('WORK_SESSION_ABANDON_FAILED')
  }

  const timerMode = input.mode.presetKey
    ? mapPresetKeyToTimerMode(input.mode.presetKey)
    : mapModeLabelToTimerMode(input.mode.name)

  try {
    const res = (await createWorkSession({
      taskId: input.toTask.id,
      targetDurationSec,
      timerMode,
      breakDurationSec: input.mode.breakSec ?? 0,
      ...(input.mode.presetKey ? { presetKey: input.mode.presetKey } : {}),
    })) as { data?: { id?: string } }
    const id = res?.data?.id
    if (!id) throw new Error('WORK_SESSION_CREATE_INVALID_RESPONSE')
    return { newSessionId: id, targetDurationSec, usedFullPreset }
  } catch (e: unknown) {
    const parsed = parseFetchError(e)
    const { status, code, activeSessionId: aid, state: st } = parsed
    if (status === 412 || code === 'checkin_required') {
      throw new Error('CHECKIN_REQUIRED')
    }
    if (status === 409) {
      if (aid && st) throw new Error('WORK_SESSION_CONFLICT')
      throw new Error('WORK_SESSION_CONFLICT_UNRESOLVED')
    }
    throw e
  }
}
