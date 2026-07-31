import { useTimerStore } from '@/stores/timer'
import { useWorkSessionSummaryStore } from '@/stores/workSessionSummary'
import type { Task, TimerMode } from '@/types/task'

export function useTaskTimer() {
  const timerStore = useTimerStore()

  const isTaskActive = (taskId: string) => {
    return timerStore.activeTask?.id === taskId
  }

  const isTaskPaused = (taskId: string) => {
    return isTaskActive(taskId) && timerStore.isPaused
  }

  const getTaskTimeLeft = (taskId: string) => {
    if (isTaskActive(taskId)) {
      return timerStore.getFormattedTimeLeft
    }
    return null
  }

  const startTask = async (task: Task, mode: TimerMode) => {
    // Si la tarea ya está activa, pausar/reanudar
    if (isTaskActive(task.id)) {
      if (timerStore.isPaused) {
        timerStore.resumeTimer()
      } else {
        timerStore.pauseTimer()
      }
      return
    }

    const timerMode = {
      minutes: mode.minutes ?? Math.floor(mode.time / 60),
      name: mode.name,
      presetKey: mode.presetKey,
      breakSec: mode.breakSec,
    }

    const switching =
      !!timerStore.activeTask && timerStore.activeTask.id !== task.id

    // Cambio de tarea con bloque remoto activo → split silencioso:
    // heartbeat + abandonar el previo, crear uno nuevo con el tiempo restante.
    if (switching && timerStore.remoteWorkSessionId) {
      const fromId = timerStore.remoteWorkSessionId
      const timeLeftSec = timerStore.activeTask!.timeLeft
      try {
        const { switchRemoteWorkSession } = await import(
          '@/composables/timer/switchRemoteWorkSession'
        )
        const result = await switchRemoteWorkSession({
          fromSessionId: fromId,
          toTask: { id: task.id, name: task.name, category: task.category },
          timeLeftSec,
          pausedDurationSec: timerStore.activeTask!.totalPausedTime ?? 0,
          isPaused: timerStore.isPaused,
          mode: timerMode,
        })
        timerStore.clearRemoteWorkSession()
        if (result.usedFullPreset && timerStore.activeTask) {
          const total = timerMode.minutes * 60
          timerStore.activeTask.timeLeft = total
          timerStore.activeTask.totalTime = total
          timerStore.activeTask.totalPausedTime = 0
          timerStore.activeTask.startedAt = new Date()
        }
        timerStore.startTask(task, timerMode)
        timerStore.bindRemoteWorkSession(result.newSessionId)
        void useWorkSessionSummaryStore().refresh()
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
          // El bloque previo ya fue abandonado: seguimos el cambio local.
          timerStore.clearRemoteWorkSession()
          timerStore.startTask(task, timerMode)
          void useWorkSessionSummaryStore().refresh()
          if (msg === 'WORK_SESSION_CONFLICT_UNRESOLVED') {
            timerStore.showNotification(
              'Sesión remota no iniciada',
              'El temporizador local seguirá; el tiempo puede no contar en el resumen del día.',
              'warning',
            )
          }
          return
        }
        // create falló tras abandonar: cambio local + aviso.
        timerStore.clearRemoteWorkSession()
        timerStore.startTask(task, timerMode)
        void useWorkSessionSummaryStore().refresh()
        timerStore.showNotification(
          'Sesión remota no iniciada',
          'El temporizador local seguirá; el tiempo puede no contar en el resumen del día.',
          'warning',
        )
      }
      return
    }

    // Cambio local sin bloque remoto: solo actualizar metadata (el store
    // conserva `timeLeft`); no creamos una sesión remota nueva.
    if (!switching && (import.meta.client || process.env.VITEST)) {
      try {
        const { tryStartRemoteWorkSession } = await import(
          '@/composables/timer/useRemoteWorkSession'
        )
        await tryStartRemoteWorkSession(
          { id: task.id, name: task.name, category: task.category },
          timerMode,
        )
      } catch (e) {
        const msg = (e as Error)?.message
        if (msg === 'CHECKIN_REQUIRED') return
        if (msg === 'WORK_SESSION_CONFLICT') return
        if (msg === 'WORK_SESSION_CONFLICT_UNRESOLVED') {
          timerStore.showNotification(
            'No se puede iniciar la tarea',
            'Hay un bloque remoto activo. Finalízalo o abandónalo antes de empezar otro.',
            'warning',
          )
          return
        }
        timerStore.showNotification(
          'Sesión remota no iniciada',
          'El temporizador local seguirá; el tiempo puede no contar en el resumen del día.',
          'warning',
        )
      }
    }

    timerStore.startTask(task, timerMode)
  }

  const pauseResumeTask = (task: Task) => {
    if (isTaskActive(task.id)) {
      if (timerStore.isPaused) {
        timerStore.resumeTimer()
      } else {
        timerStore.pauseTimer()
      }
    }
  }

  const stopTask = (task: Task) => {
    if (isTaskActive(task.id)) {
      timerStore.stopTimer()
    }
  }

  const convertToTaskItemFormat = (task: Task): Task => {
    const isActive = isTaskActive(task.id)
    const { activeTask } = timerStore

    return {
      ...task,
      title: task.name,
      priority: task.priority ?? 'media',
      completed: task.completed ?? false,
      isRunning: isActive,
      timeRemaining: isActive && activeTask ? activeTask.timeLeft : 0,
      totalTime: isActive && activeTask ? activeTask.totalTime : 0,
      totalTimeSpent: task.totalTimeSpent ?? 0,
      notes: task.notes,
      hasNotes: task.hasNotes,
      lastEdited: task.lastEdited,
    }
  }

  return {
    isTaskActive,
    isTaskPaused,
    getTaskTimeLeft,
    startTask,
    pauseResumeTask,
    stopTask,
    convertToTaskItemFormat,
  }
}
