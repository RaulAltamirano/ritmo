import { switchRemoteWorkSession } from '@/composables/timer/switchRemoteWorkSession'
import { useTimerStore } from '@/stores/timer'
import { useWorkSessionSummaryStore } from '@/stores/workSessionSummary'

export type ApplyRemoteTaskSwitchInput = {
  toTask: { id: string; name: string; category?: string }
  mode: { minutes: number; name: string; presetKey?: string }
  durationPolicy: 'remaining' | 'full_preset'
}

export async function applyRemoteTaskSwitch(
  input: ApplyRemoteTaskSwitchInput,
): Promise<void> {
  const timerStore = useTimerStore()
  const active = timerStore.activeTask
  const fromSessionId = timerStore.remoteWorkSessionId
  if (!active || !fromSessionId) return

  const timeLeftSec = active.timeLeft
  const pausedDurationSec = active.totalPausedTime ?? 0
  const isPaused = timerStore.isPaused

  const startLocalTask = () => {
    timerStore.startTask(input.toTask, input.mode)
    void useWorkSessionSummaryStore().refresh()
    if (timerStore.isPaused) timerStore.resumeTimer()
  }

  try {
    const result = await switchRemoteWorkSession({
      fromSessionId,
      toTask: input.toTask,
      timeLeftSec,
      pausedDurationSec,
      isPaused,
      mode: input.mode,
      durationPolicy: input.durationPolicy,
    })
    timerStore.clearRemoteWorkSession()
    if (
      (input.durationPolicy === 'full_preset' || result.usedFullPreset) &&
      timerStore.activeTask
    ) {
      const total = input.mode.minutes * 60
      timerStore.activeTask.timeLeft = total
      timerStore.activeTask.totalTime = total
      timerStore.activeTask.totalPausedTime = 0
      timerStore.activeTask.startedAt = new Date()
    }
    timerStore.startTask(input.toTask, input.mode)
    timerStore.bindRemoteWorkSession(result.newSessionId)
    void useWorkSessionSummaryStore().refresh()
    if (timerStore.isPaused) timerStore.resumeTimer()
    if (result.usedFullPreset) {
      timerStore.showNotification(
        'Nuevo bloque iniciado',
        'Quedaba menos de un minuto; se abrió un bloque completo en la nueva tarea.',
        'info',
      )
    }
  } catch (e) {
    const msg = (e as Error)?.message
    if (msg === 'WORK_SESSION_ABANDON_FAILED') {
      timerStore.showNotification(
        'No se pudo cambiar de tarea',
        'No se pudo cerrar el bloque remoto. Reintenta.',
        'error',
      )
      return
    }
    if (msg === 'CHECKIN_REQUIRED') return
    if (
      msg === 'WORK_SESSION_CONFLICT' ||
      msg === 'WORK_SESSION_CONFLICT_UNRESOLVED'
    ) {
      timerStore.clearRemoteWorkSession()
      startLocalTask()
      if (msg === 'WORK_SESSION_CONFLICT_UNRESOLVED') {
        timerStore.showNotification(
          'Sesión remota no iniciada',
          'El temporizador local seguirá; el tiempo puede no contar en el resumen del día.',
          'warning',
        )
      }
      return
    }
    timerStore.clearRemoteWorkSession()
    startLocalTask()
    timerStore.showNotification(
      'Sesión remota no iniciada',
      'El temporizador local seguirá; el tiempo puede no contar en el resumen del día.',
      'warning',
    )
  }
}
