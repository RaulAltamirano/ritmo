import { getActiveWorkSession, listWorkSessions, patchWorkSession } from '@/services/workSessionsApi'
import { useAuthStore } from '@/stores/auth'
import { useSessionGateStore } from '@/stores/sessionGate'
import { useTimerStore } from '@/stores/timer'
import { useWorkSessionRecoveryStore } from '@/stores/workSessionRecovery'
import { getLastTrackedWorkSessionId } from '@/utils/lastTrackedWorkSession'
import { getCivilDateYmd } from '@/utils/civilDate'
import { needsWorkSessionFeedback } from '@/utils/workSessionFeedback'

export interface ActiveWorkSessionApi {
  id: string
  state: 'running' | 'paused' | 'on_break' | 'pending_feedback'
  startTime: string
  targetDurationSec: number
  pausedDurationSec: number
  breakDurationSec?: number | null
  breakStartedAt?: string | null
  breakPausedDurationSec?: number | null
  timerMode: string | null
  presetKey?: string
  task: { id: string; title: string }
}

/** Tests / hot reload: limpia deduplicación en vuelo. */
export function __resetRestoreActiveWorkSessionCache(): void {
  restoreInFlight = null
}

let restoreInFlight: Promise<void> | null = null

export function parseActivePayload(raw: unknown): ActiveWorkSessionApi | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const id = typeof o.id === 'string' ? o.id : null
  const state = o.state as ActiveWorkSessionApi['state']
  const task = o.task as { id?: string; title?: string } | undefined
  if (!id || !task?.id || typeof task.title !== 'string') return null
  if (
    state !== 'running' &&
    state !== 'paused' &&
    state !== 'on_break' &&
    state !== 'pending_feedback'
  )
    return null

  let startTime: string | null = null
  const { startTime: rawStartTime } = o
  if (typeof rawStartTime === 'string') startTime = rawStartTime
  else if (rawStartTime instanceof Date) startTime = rawStartTime.toISOString()
  if (!startTime) return null

  const targetDurationSec = o.targetDurationSec
  if (
    typeof targetDurationSec !== 'number' ||
    !Number.isFinite(targetDurationSec) ||
    targetDurationSec < 1
  ) {
    return null
  }

  const breakStartedAt =
    typeof o.breakStartedAt === 'string'
      ? o.breakStartedAt
      : o.breakStartedAt instanceof Date
        ? o.breakStartedAt.toISOString()
        : null

  return {
    id,
    state,
    startTime,
    targetDurationSec,
    pausedDurationSec:
      typeof o.pausedDurationSec === 'number' ? o.pausedDurationSec : 0,
    breakDurationSec:
      typeof o.breakDurationSec === 'number' ? o.breakDurationSec : null,
    breakStartedAt,
    breakPausedDurationSec:
      typeof o.breakPausedDurationSec === 'number' ? o.breakPausedDurationSec : 0,
    timerMode: typeof o.timerMode === 'string' ? o.timerMode : null,
    presetKey: typeof o.presetKey === 'string' ? o.presetKey : undefined,
    task: { id: task.id, title: task.title },
  }
}

function unwrapActiveEnvelope(res: unknown): unknown {
  if (!res || typeof res !== 'object') return null
  const r = res as Record<string, unknown>
  const inner = r.data
  if (!inner || typeof inner !== 'object') return null
  const mid = inner as Record<string, unknown>
  if ('data' in mid) return mid.data
  if ('id' in mid) return mid
  return null
}

function extractListIds(res: unknown): string[] {
  if (!res || typeof res !== 'object') return []
  const r = res as Record<string, unknown>
  const payload = r.data as Record<string, unknown> | undefined
  if (!payload || typeof payload !== 'object') return []
  const { items } = payload
  if (!Array.isArray(items)) return []
  return items
    .map(it => {
      if (!it || typeof it !== 'object') return null
      const { id } = it as { id?: unknown }
      return typeof id === 'string' ? id : null
    })
    .filter((x): x is string => x !== null && x !== undefined)
}

async function maybeAnnounceServerAbandoned(): Promise<void> {
  const lastId = getLastTrackedWorkSessionId()
  if (!lastId) return

  const tz = useAuthStore().user?.timezone ?? 'UTC'
  const ymd = getCivilDateYmd(tz)
  try {
    const res = await listWorkSessions({
      state: 'abandoned',
      from: ymd,
      to: ymd,
      limit: 40,
    })
    const ids = extractListIds(res)
    if (ids.includes(lastId)) {
      useWorkSessionRecoveryStore().openServerAbandonedBanner()
    }
  } catch {
    /* sin red */
  }
}

async function doRestore(): Promise<void> {
  /* En SSR `client === false`; en Vitest suele ser `undefined` — solo omitir si es explícitamente false. */
  if (import.meta.client === false) return

  const timer = useTimerStore()
  if (timer.activeTask) return

  const recovery = useWorkSessionRecoveryStore()

  try {
    const res = await getActiveWorkSession()
    const raw = unwrapActiveEnvelope(res)
    const row = parseActivePayload(raw)

    if (row?.targetDurationSec !== null && row?.targetDurationSec !== undefined) {
      recovery.dismissServerAbandonedBanner()
      timer.hydrateFromActiveRemoteSession({
        id: row.id,
        state: row.state,
        startTime: row.startTime,
        targetDurationSec: row.targetDurationSec,
        pausedDurationSec: row.pausedDurationSec,
        breakDurationSec: row.breakDurationSec,
        breakStartedAt: row.breakStartedAt,
        breakPausedDurationSec: row.breakPausedDurationSec,
        task: row.task,
        timerMode: row.timerMode,
        presetKey: row.presetKey,
      })

      const gate = useSessionGateStore()
      const activeAfterHydrate = timer.$state.activeTask
      const tLeft = activeAfterHydrate?.timeLeft ?? 0
      const needsFeedbackModal =
        needsWorkSessionFeedback({ state: row.state, timeLeftSec: tLeft }) &&
        (row.state === 'pending_feedback' || !!timer.remoteWorkSessionId)

      if (needsFeedbackModal) {
        if (row.state === 'on_break') {
          try {
            await patchWorkSession(row.id, {
              lastClientSeenAt: new Date().toISOString(),
              state: 'pending_feedback',
              pausedDurationSec: row.pausedDurationSec,
            })
          } catch {
            /* open reflection anyway; user can retry/abandon from modal */
          }
        }
        gate.openFeedback(row.id)
      }
      return
    }

    await maybeAnnounceServerAbandoned()
  } catch {
    await maybeAnnounceServerAbandoned()
  }
}

/**
 * Tras autenticación, restaura bloque remoto activo o abre reflexión pendiente.
 */
export async function restoreActiveWorkSessionIfAny(): Promise<void> {
  if (restoreInFlight) return restoreInFlight
  restoreInFlight = doRestore().finally(() => {
    restoreInFlight = null
  })
  return restoreInFlight
}
