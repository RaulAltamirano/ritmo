import type { Activity } from './useActivities'
import type { Task } from '../types/task'

export const useActivityAdapter = () => {
  /**
   * Convert Activity to Task format for compatibility with existing components
   */
  const activityToTask = (activity: Activity): Task => {
    return {
      id: activity.id,
      name: activity.title,
      category: activity.type,
      priority: activity.priority.toLowerCase() as 'low' | 'medium' | 'high' | 'urgent',
      estimatedTime: activity.duration,
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
      tags: activity.tags
    }
  }

  /**
   * Convert Task to Activity format for API calls
   */
  const taskToActivity = (task: Task): Partial<Activity> => {
    return {
      title: task.name || task.title,
      description: task.notes,
      type: task.category?.toUpperCase() as Activity['type'],
      duration: task.estimatedTime || task.duration ? parseInt(task.duration) : 25,
      priority: task.priority?.toUpperCase() as Activity['priority'],
      tags: task.tags || [],
      isCompleted: task.completed || false
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
  const tasksToActivities = (tasks: Task[]): Partial<Activity>[] => {
    return tasks.map(taskToActivity)
  }

  return {
    activityToTask,
    taskToActivity,
    activitiesToTasks,
    tasksToActivities
  }
} 