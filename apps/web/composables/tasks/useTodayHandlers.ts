import { ref } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import { useTimerStore } from '@/stores/timer'
import { completeWorkSession } from '@/services/workSessionsApi'
import { newIdempotencyKey } from '@/utils/idempotency'
import { uiTaskToUpdatePayload } from '@/types/task'
import { useNotify } from '@/composables/shared/useNotify'
import type { Task, TaskCompletionFeedback } from '@/types/task'

function mapFeedbackToWorkSession(feedback: TaskCompletionFeedback) {
  return {
    rpeCognitive: feedback.mentalDemand,
    frictionScore: feedback.mentalDemand,
    energyAfter: feedback.energyAfter,
    perceivedFocus: feedback.focusScore,
    perceivedProgress: feedback.progressScore,
    timeFit: feedback.timeFit,
    ...(feedback.mainBlocker !== 'none'
      ? { frictionBlocker: feedback.mainBlocker }
      : {}),
  }
}

export const useTodayHandlers = () => {
  const store = useTasksStore()
  const timerStore = useTimerStore()
  const { notifyError } = useNotify()

  const isQuickTaskLoading = ref(false)

  const handleQuickTask = async (taskName: string): Promise<void> => {
    if (!taskName.trim()) return
    isQuickTaskLoading.value = true
    try {
      const result = await store.create({
        title: taskName.trim(),
        startTime: new Date(),
        priority: 'MEDIUM',
        category: 'WORK',
        tags: ['quick-task'],
      })
      if (!result.success) {
        notifyError('No se pudo crear la tarea', result.error)
      }
    } finally {
      isQuickTaskLoading.value = false
    }
  }

  const handleDeleteTask = async (taskId: string): Promise<void> => {
    const result = await store.remove(taskId)
    if (!result.success) {
      notifyError('No se pudo eliminar la tarea', result.error)
    }
  }

  const handleUpdateTask = async (task: Task): Promise<void> => {
    const payload = uiTaskToUpdatePayload(task)
    const titleFallback = (task.name ?? task.title ?? '').trim()
    const result = await store.update(task.id, {
      ...payload,
      title: payload.title?.trim() ? payload.title.trim() : titleFallback,
    })
    if (!result.success) {
      notifyError('No se pudo actualizar la tarea', result.error)
    }
  }

  const handleAddNote = async (taskId: string, note: string): Promise<void> => {
    const trimmed = note.trim()
    const result = await store.update(taskId, {
      description: trimmed || undefined,
    })
    if (!result.success) {
      notifyError('No se pudo guardar la nota', result.error)
    }
  }

  const handleCompleteTask = async (task: Task): Promise<void> => {
    if (timerStore.activeTask?.id === task.id) {
      await timerStore.stopTimer()
    }
    const result = await store.markCompleted(task.id, true)
    if (!result.success) {
      throw new Error(result.error ?? 'No se pudo completar la tarea')
    }
  }

  const handleCompleteTaskWithFeedback = async (
    task: Task,
    feedback: TaskCompletionFeedback,
    resolve: () => void,
    reject: (error?: Error) => void,
  ): Promise<void> => {
    try {
      const remoteId = timerStore.remoteWorkSessionId
      const isActiveTask = timerStore.activeTask?.id === task.id
      if (!remoteId || !isActiveTask) {
        throw new Error('No hay una sesión remota activa para esta tarea')
      }

      await completeWorkSession(
        remoteId,
        { 'Idempotency-Key': newIdempotencyKey() },
        mapFeedbackToWorkSession(feedback),
      )
      timerStore.closeTimer()

      const result = await store.markCompleted(task.id, true)
      if (!result.success) {
        throw new Error(result.error ?? 'No se pudo completar la tarea')
      }

      resolve()
    } catch (err) {
      reject(err instanceof Error ? err : new Error('No se pudo completar la tarea'))
    }
  }

  return {
    isQuickTaskLoading,
    handleQuickTask,
    handleDeleteTask,
    handleUpdateTask,
    handleAddNote,
    handleCompleteTask,
    handleCompleteTaskWithFeedback,
  }
}
