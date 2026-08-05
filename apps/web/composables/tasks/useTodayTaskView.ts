import { computed } from 'vue'
import { frontendTaskToUiTask } from '@/types/task'
import type { Task } from '@/types/task'
import { useTasksStore } from '@/stores/tasks'
import { useTimerStore } from '@/stores/timer'
import { useWorkSessionSummaryStore } from '@/stores/workSessionSummary'

/**
 * Fusiona: lista de tareas de hoy + summary de WorkSessions cerradas hoy
 * + estado en vivo del timer. Expone `tasks` (Task[] listo para la UI) y
 * `dayTotalSeconds` (total del día sumando lo ya cerrado + elapsed del
 * bloque activo si lo hay).
 */
export function useTodayTaskView() {
  const tasksStore = useTasksStore()
  const timerStore = useTimerStore()
  const summaryStore = useWorkSessionSummaryStore()

  const activeElapsedSeconds = computed<number>(() => {
    const a = timerStore.activeTask
    if (!a) return 0
    return Math.max(0, (a.totalTime ?? 0) - (a.timeLeft ?? 0))
  })

  const tasks = computed<Task[]>(() =>
    tasksStore.todayTasks.map(frontend => {
      const base = frontendTaskToUiTask(frontend)
      const closed = summaryStore.getSecondsFor(base.id)
      const isActive = timerStore.activeTask?.id === base.id
      return {
        ...base,
        isRunning: isActive && timerStore.isRunning,
        isOnBreak: isActive && timerStore.phase === 'break',
        timeRemaining: isActive
          ? (timerStore.activeTask?.timeLeft ?? 0)
          : base.timeRemaining,
        totalTimeSpent: closed + (isActive ? activeElapsedSeconds.value : 0),
      }
    }),
  )

  const dayTotalSeconds = computed<number>(
    () => summaryStore.totalSeconds + activeElapsedSeconds.value,
  )

  return { tasks, dayTotalSeconds }
}
