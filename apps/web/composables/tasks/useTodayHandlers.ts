import { ref } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import { uiTaskToUpdatePayload } from '@/types/task'
import type { Task, TaskCompletionFeedback } from '@/types/task'

export const useTodayHandlers = () => {
  const store = useTasksStore()

  const isQuickTaskLoading = ref(false)

  const handleQuickTask = async (taskName: string): Promise<void> => {
    if (!taskName.trim()) return
    isQuickTaskLoading.value = true
    try {
      await store.create({
        title: taskName.trim(),
        startTime: new Date(),
        priority: 'MEDIUM',
        category: 'WORK',
        tags: ['quick-task'],
      })
    } finally {
      isQuickTaskLoading.value = false
    }
  }

  const handleDeleteTask = async (taskId: string): Promise<void> => {
    await store.remove(taskId)
  }

  const handleUpdateTask = async (task: Task): Promise<void> => {
    const payload = uiTaskToUpdatePayload(task)
    const titleFallback = (task.name ?? task.title ?? '').trim()
    const result = await store.update(task.id, {
      ...payload,
      title: payload.title?.trim() ? payload.title.trim() : titleFallback,
    })
    if (!result.success) {
      console.error('[today] update failed:', result.error)
    }
  }

  const handleAddNote = async (taskId: string, note: string): Promise<void> => {
    const result = await store.update(taskId, {
      description: note.trim() ?? undefined,
    })
    if (!result.success) {
      console.error('[today] add-note failed:', result.error)
    }
  }

  const handleCompleteTaskWithFeedback = async (
    task: Task,
    feedback: TaskCompletionFeedback,
    resolve: () => void,
    reject: (error?: Error) => void,
  ): Promise<void> => {
    try {
      const result = await store.markCompleted(task.id, true)
      if (!result.success)
        throw new Error(result.error ?? 'No se pudo completar la tarea')

      const feedbackNote = JSON.stringify({
        energyAfter: feedback.energyAfter,
        focusScore: feedback.focusScore,
        progressScore: feedback.progressScore,
        mentalDemand: feedback.mentalDemand,
        timeFit: feedback.timeFit,
        mainBlocker: feedback.mainBlocker,
      })
      await store.update(task.id, { description: feedbackNote }).catch(() => {})
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
    handleCompleteTaskWithFeedback,
  }
}
