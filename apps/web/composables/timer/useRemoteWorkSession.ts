import {
  mapModeLabelToTimerMode,
  mapPresetKeyToTimerMode,
} from '@/composables/timer/timerPresets'
import { createWorkSession } from '@/services/workSessionsApi'
import { getDailyCheckin } from '@/services/checkinsApi'
import { useAuthStore } from '@/stores/auth'
import { useTimerStore } from '@/stores/timer'
import { useSessionGateStore } from '@/stores/sessionGate'
import { getCivilDateYmd } from '@/utils/civilDate'
import { parseFetchError } from '@/utils/parseFetchError'

function userCivilDateYmd(): string {
  const tz = useAuthStore().user?.timezone ?? 'UTC'
  return getCivilDateYmd(tz)
}

/**
 * Intenta crear bloque en servidor + iniciar heartbeat.
 * Si falta check-in (412), abre el modal vía sessionGate.
 */
export async function tryStartRemoteWorkSession(
  task: { id: string; name: string; category?: string },
  mode: { minutes: number; name: string; presetKey?: string },
): Promise<void> {
  const timerStore = useTimerStore()
  const gate = useSessionGateStore()

  const ymd = userCivilDateYmd()
  try {
    await getDailyCheckin(ymd)
  } catch (e: unknown) {
    const { status } = parseFetchError(e)
    if (status === 404) {
      gate.setPendingStart(task, mode)
      gate.requestDailyCheckinForPendingStart()
      throw new Error('CHECKIN_REQUIRED')
    }
    throw e
  }

  const timerMode = mode.presetKey
    ? mapPresetKeyToTimerMode(mode.presetKey)
    : mapModeLabelToTimerMode(mode.name)
  try {
    const res = (await createWorkSession({
      taskId: task.id,
      targetDurationSec: mode.minutes * 60,
      timerMode,
      ...(mode.presetKey ? { presetKey: mode.presetKey } : {}),
    })) as { data?: { id?: string } }
    const id = res?.data?.id
    if (!id) throw new Error('WORK_SESSION_CREATE_INVALID_RESPONSE')
    timerStore.bindRemoteWorkSession(id)
  } catch (e: unknown) {
    const parsed = parseFetchError(e)
    const { status, code, activeSessionId: aid, state: st } = parsed
    if (status === 412 || code === 'checkin_required') {
      gate.setPendingStart(task, mode)
      gate.requestDailyCheckinForPendingStart()
      throw new Error('CHECKIN_REQUIRED')
    }
    if (status === 409) {
      if (aid && st) {
        gate.setPendingStart(task, mode)
        gate.openConflict(aid, st)
      } else {
        console.warn(
          'Work session conflict: 409 sin activeSessionId/state válidos',
          parsed,
        )
      }
      return
    }
    throw e
  }
}
