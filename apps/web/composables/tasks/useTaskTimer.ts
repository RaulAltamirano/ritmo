import { useTimerStore } from '@/stores/timer'
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

    // No crear sesión remota nueva si hay otra tarea con bloque remoto activo
    if (
      timerStore.remoteWorkSessionId &&
      timerStore.activeTask &&
      timerStore.activeTask.id !== task.id
    ) {
      timerStore.showNotification(
        'No se puede cambiar de tarea',
        'Finaliza o abandona el bloque remoto actual antes de cambiar de tarea.',
        'warning',
      )
      return
    }

    const timerMode = {
      minutes: mode.minutes ?? Math.floor(mode.time / 60),
      name: mode.name,
      presetKey: mode.presetKey,
    }

    if (import.meta.client || process.env.VITEST) {
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
        if (
          msg === 'WORK_SESSION_CONFLICT' ||
          msg === 'WORK_SESSION_CONFLICT_UNRESOLVED'
        ) {
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
