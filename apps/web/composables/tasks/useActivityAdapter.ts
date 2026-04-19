import type { Activity } from './useActivities'
import type { Task } from '@/types/task'

export const useActivityAdapter = () => {
  /**
   * Convert Activity to Task format for compatibility with existing components
   */
  const activityToTask = (activity: Activity): Task => {
    // Map priority from English to Spanish
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
      priority: priorityMap[activity.priority.toLowerCase()] || 'media',
      estimatedTime: activity.duration.toString(),
      completed: activity.isCompleted,
      notes: activity.description || '',
      createdAt: new Date(activity.createdAt),
      updatedAt: new Date(activity.updatedAt),
      // Additional fields for TaskItem compatibility
      title: activity.title,
      duration: `${activity.duration}m`,
      startTime: new Date(activity.startTime),
      endTime: new Date(activity.endTime),
      isRunning: false,
      timeRemaining: activity.duration * 60,
      totalTimeSpent: 0,
      hasNotes: !!activity.description,
      tags: activity.tags,
    }
  }

  /**
   * Convert Task to Activity format for API calls
   */
  const taskToActivity = (task: Task): Partial<Activity> => {
    // Map priority from Spanish to English
    const priorityMap: Record<string, 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'> = {
      baja: 'LOW',
      media: 'MEDIUM',
      alta: 'HIGH',
    }

    // Parse duration safely
    let duration = 25
    if (task.estimatedTime) {
      duration = parseInt(task.estimatedTime)
    } else if (task.duration) {
      duration = parseInt(task.duration)
    }

    return {
      title: task.name || task.title,
      description: task.notes,
      type: task.category?.toUpperCase() as Activity['type'],
      duration,
      priority: priorityMap[task.priority || 'media'] || 'MEDIUM',
      tags: task.tags || [],
      isCompleted: task.completed || false,
    }
  }

  /**
   * Convert array of activities to tasks
   */
  const activitiesToTasks = (activities: Activity[]): Task[] => {
    return activities.map(activityToTask)
  }

  /**
   * Convert array of tasks to activities
   */
  const tasksToActivities = (tasks: Task[]): Array<Partial<Activity>> => {
    return tasks.map(taskToActivity)
  }

  return {
    activityToTask,
    taskToActivity,
    activitiesToTasks,
    tasksToActivities,
  }
}
