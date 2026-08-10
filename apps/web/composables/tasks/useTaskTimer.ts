import { applyRemoteTaskSwitch } from '@/composables/timer/applyRemoteTaskSwitch'
import {
  areSameTimerPreset,
  canContinueRemainingOnSwitch,
} from '@/composables/timer/taskSwitchPreset'
import { useSessionGateStore } from '@/stores/sessionGate'
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

    const timerMode = {
      minutes: mode.minutes ?? Math.floor(mode.time / 60),
      name: mode.name,
      presetKey: mode.presetKey,
      breakSec: mode.breakSec,
    }

    const switching = !!timerStore.activeTask && timerStore.activeTask.id !== task.id

    if (switching && timerStore.remoteWorkSessionId) {
      const active = timerStore.activeTask!
      const fromPreset = {
        minutes: Math.max(1, Math.round(active.totalTime / 60)),
        presetKey: active.presetKey,
      }
      const toPreset = {
        minutes: timerMode.minutes,
        presetKey: timerMode.presetKey,
      }

      if (!areSameTimerPreset(fromPreset, toPreset)) {
        if (!timerStore.isPaused) timerStore.pauseTimer()
        useSessionGateStore().openTaskSwitchPrompt({
          toTask: { id: task.id, name: task.name, category: task.category },
          mode: timerMode,
          remainingSec: Math.floor(active.timeLeft),
          canContinueRemaining: canContinueRemainingOnSwitch(
            active.timeLeft,
            timerMode.minutes,
          ),
          fromTaskName: active.name,
        })
        return
      }

      await applyRemoteTaskSwitch({
        toTask: { id: task.id, name: task.name, category: task.category },
        mode: timerMode,
        durationPolicy: 'remaining',
      })
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
            'Cannot start the task',
            'There is an active remote block. Finish or abandon it before starting another.',
            'warning',
          )
          return
        }
        timerStore.showNotification(
          'Remote session not started',
          'The local timer will continue; time may not count toward the day summary.',
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
      isOnBreak:
        isActive &&
        timerStore.phase === 'break' &&
        (timerStore.isRunning || timerStore.isPaused),
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
