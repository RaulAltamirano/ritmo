/**
 * Adapter simplificado: Activity ya no existe.
 * Convierte FrontendTask (API /tasks) ↔ Task (UI).
 */
import { frontendTaskToUiTask, uiTaskToUpdatePayload } from '@/types/task'
import type { FrontendTask, Task, UpdateTaskPayload } from '@/types/task'

export const useActivityAdapter = () => {
  const activityToTask = (activity: FrontendTask): Task =>
    frontendTaskToUiTask(activity)

  const taskToActivity = (task: Task): UpdateTaskPayload => uiTaskToUpdatePayload(task)

  const activitiesToTasks = (activities: FrontendTask[]): Task[] =>
    activities.map(frontendTaskToUiTask)

  const tasksToActivities = (tasks: Task[]): UpdateTaskPayload[] =>
    tasks.map(uiTaskToUpdatePayload)

  return { activityToTask, taskToActivity, activitiesToTasks, tasksToActivities }
}
