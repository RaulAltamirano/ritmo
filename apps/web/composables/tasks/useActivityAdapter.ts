import type { Activity } from '@/types/activity'
import type { Task } from '@/types/task'

export const useActivityAdapter = () => {
  const activityToTask = (activity: Activity): Task => {
    const priorityMap: Record<string, 'alta' | 'media' | 'baja'> = {
      low: 'baja',
      medium: 'media',
      high: 'alta',
      urgent: 'alta',
    }

    return {
      id: activity.id,
      name: activity.title,
      category: activity.type,
      priority: priorityMap[activity.priority.toLowerCase()] ?? 'media',
      estimatedTime: activity.duration.toString(),
      completed: activity.isCompleted,
      notes: activity.description ?? '',
      createdAt: new Date(activity.createdAt),
      updatedAt: new Date(activity.updatedAt),
      title: activity.title,
      duration: `${activity.duration}m`,
      startTime: new Date(activity.startTime),
      endTime: activity.endTime ? new Date(activity.endTime) : undefined,
      isRunning: false,
      timeRemaining: activity.duration * 60,
      totalTimeSpent: 0,
      hasNotes: !!activity.description,
      tags: activity.tags,
    }
  }

  const taskToActivity = (
    task: Task,
  ): Partial<Activity> & { priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' } => {
    const priorityMap: Record<string, 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'> = {
      baja: 'LOW',
      media: 'MEDIUM',
      alta: 'HIGH',
    }

    let duration = 25
    if (task.estimatedTime) {
      const parsed = parseInt(task.estimatedTime, 10)
      if (!isNaN(parsed)) duration = parsed
    } else if (task.duration) {
      const parsed = parseInt(task.duration, 10)
      if (!isNaN(parsed)) duration = parsed
    }

    return {
      title: task.name ?? task.title,
      description: task.notes,
      type: task.category?.toUpperCase() as Activity['type'],
      duration,
      priority: priorityMap[task.priority ?? 'media'] ?? 'MEDIUM',
      tags: task.tags ?? [],
      isCompleted: task.completed ?? false,
    }
  }

  const activitiesToTasks = (activities: Activity[]): Task[] =>
    activities.map(activityToTask)

  const tasksToActivities = (tasks: Task[]): Array<Partial<Activity>> =>
    tasks.map(taskToActivity)

  return { activityToTask, taskToActivity, activitiesToTasks, tasksToActivities }
}
