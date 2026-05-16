import { tryStartRemoteWorkSession } from '@/composables/timer/useRemoteWorkSession'
import { useSessionGateStore } from '@/stores/sessionGate'
import { useTimerStore } from '@/stores/timer'

/**
 * Estrategia: tras check-in diario el pending solo se limpia si el arranque remoto tuvo éxito.
 * Tras `abandon` en conflicto se alinea con el flujo previo: `clearPendingStart` antes de reintentar.
 */
export type PendingWorkSessionStartStrategy =
  | 'afterDailyCheckin'
  | 'afterConflictAbandon'

export async function runPendingWorkSessionStartIfAny(
  strategy: PendingWorkSessionStartStrategy = 'afterDailyCheckin',
): Promise<void> {
  const gate = useSessionGateStore()
  const timer = useTimerStore()
  const pending = gate.pendingStartPayload
  if (!pending) return

  if (strategy === 'afterConflictAbandon') {
    gate.clearPendingStart()
  }
  await tryStartRemoteWorkSession(pending.task, pending.mode)
  timer.startTask(pending.task, pending.mode)
  if (strategy === 'afterDailyCheckin') {
    gate.clearPendingStart()
  }
}
