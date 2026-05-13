/**
 * 🚀 RITMO TASKS COMPOSABLE - 2025 BEST PRACTICES
 *
 * Tasks management using standardized API responses
 * All methods handle responses consistently and provide proper error handling
 */

import type { Task } from '@/types/task'
import { computed, ref } from 'vue'
import { useHttpClient } from '../shared/useHttpClient'

export interface CreateTaskData {
  title: string
  description?: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'
  dueDate?: Date
  estimatedTime?: number
  category?: string
  tags?: string[]
  assigneeId?: string
}

export interface UpdateTaskData {
  title?: string
  description?: string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status?: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'
  dueDate?: Date
  estimatedTime?: number
  category?: string
  tags?: string[]
  assigneeId?: string
  completedAt?: Date
}

export const useTasks = () => {
  const http = useHttpClient()
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const completedTasks = computed(() =>
    tasks.value.filter(task => task.status === 'DONE'),
  )

  const pendingTasks = computed(() =>
    tasks.value.filter(task => task.status !== 'DONE'),
  )

  const highPriorityTasks = computed(() =>
    tasks.value.filter(task => task.priority === 'HIGH' || task.priority === 'URGENT'),
  )

  const overdueTasks = computed(() => {
    const now = new Date()
    return tasks.value.filter(task => {
      if (!task.dueDate || task.status === 'DONE') return false
      return new Date(task.dueDate) < now
    })
  })

  const todayTasks = computed(() => {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59,
    )

    return tasks.value.filter(task => {
      if (!task.dueDate) return false
      const dueDate = new Date(task.dueDate)
      return dueDate >= startOfDay && dueDate <= endOfDay
    })
  })

  // Error handling
  const setError = (errorMessage: string | null) => {
    error.value = errorMessage
  }

  const clearError = () => {
    error.value = null
  }

  // API methods
  const fetchTasks = async (filters?: Record<string, any>) => {
    loading.value = true
    clearError()

    try {
      const query = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query.append(key, String(value))
          }
        })
      }

      const endpoint = `/tasks${query.toString() ? `?${query.toString()}` : ''}`
      const response = await http.get<Task[]>(endpoint)

      if (response.success && response.data) {
        tasks.value = response.data
      } else {
        throw new Error('Failed to fetch tasks')
      }
    } catch (err: any) {
      const errorMessage = err?.userMessage ?? err?.message ?? 'Failed to fetch tasks'
      setError(errorMessage)
      console.error('Error fetching tasks:', err)
    } finally {
      loading.value = false
    }
  }

  const createTask = async (taskData: CreateTaskData) => {
    loading.value = true
    clearError()

    try {
      const response = await http.post<Task>('/tasks', taskData)

      if (response.success && response.data) {
        tasks.value.push(response.data)
        return { success: true, task: response.data }
      }
      throw new Error('Failed to create task')
    } catch (err: any) {
      const errorMessage = err?.userMessage ?? err?.message ?? 'Failed to create task'
      setError(errorMessage)
      console.error('Error creating task:', err)
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  const updateTask = async (id: string, taskData: UpdateTaskData) => {
    loading.value = true
    clearError()

    try {
      const response = await http.put<Task>(`/tasks/${id}`, taskData)

      if (response.success && response.data) {
        const index = tasks.value.findIndex(task => task.id === id)
        if (index !== -1) {
          tasks.value[index] = response.data
        }
        return { success: true, task: response.data }
      }
      throw new Error('Failed to update task')
    } catch (err: any) {
      const errorMessage = err?.userMessage ?? err?.message ?? 'Failed to update task'
      setError(errorMessage)
      console.error('Error updating task:', err)
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  const deleteTask = async (id: string) => {
    loading.value = true
    clearError()

    try {
      const response = await http.del<{ message: string }>(`/tasks/${id}`)

      if (response.success) {
        tasks.value = tasks.value.filter(task => task.id !== id)
        return { success: true }
      }
      throw new Error('Failed to delete task')
    } catch (err: any) {
      const errorMessage = err?.userMessage ?? err?.message ?? 'Failed to delete task'
      setError(errorMessage)
      console.error('Error deleting task:', err)
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  const getTaskById = async (id: string) => {
    loading.value = true
    clearError()

    try {
      const response = await http.get<Task>(`/tasks/${id}`)

      if (response.success && response.data) {
        return { success: true, task: response.data }
      }
      throw new Error('Failed to fetch task')
    } catch (err: any) {
      const errorMessage = err?.userMessage ?? err?.message ?? 'Failed to fetch task'
      setError(errorMessage)
      console.error('Error fetching task:', err)
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  const markTaskCompleted = async (id: string, completed = true) => {
    const updateData: UpdateTaskData = {
      status: completed ? 'DONE' : 'TODO',
      completedAt: completed ? new Date() : undefined,
    }
    return updateTask(id, updateData)
  }

  const updateTaskStatus = async (
    id: string,
    status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE',
  ) => {
    return updateTask(id, { status })
  }

  const updateTaskPriority = async (
    id: string,
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
  ) => {
    return updateTask(id, { priority })
  }

  const assignTask = async (id: string, assigneeId: string) => {
    return updateTask(id, { assigneeId })
  }

  const addTaskTag = async (id: string, tag: string) => {
    try {
      const task = tasks.value.find(t => t.id === id)
      if (!task) {
        throw new Error('Task not found')
      }

      const currentTags = task.tags ?? []
      if (!currentTags.includes(tag)) {
        const newTags = [...currentTags, tag]
        return await updateTask(id, { tags: newTags })
      }

      return { success: true }
    } catch (err: any) {
      const errorMessage = err?.userMessage ?? err?.message ?? 'Failed to add tag'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const removeTaskTag = async (id: string, tag: string) => {
    try {
      const task = tasks.value.find(t => t.id === id)
      if (!task) {
        throw new Error('Task not found')
      }

      const currentTags = task.tags ?? []
      const newTags = currentTags.filter(t => t !== tag)
      return await updateTask(id, { tags: newTags })
    } catch (err: any) {
      const errorMessage = err?.userMessage ?? err?.message ?? 'Failed to remove tag'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Utility methods
  const clearTasks = () => {
    tasks.value = []
    clearError()
  }

  const getTasksByStatus = (status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE') => {
    return tasks.value.filter(task => task.status === status)
  }

  const getTasksByPriority = (priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT') => {
    return tasks.value.filter(task => task.priority === priority)
  }

  const getTasksByCategory = (category: string) => {
    return tasks.value.filter(task => task.category === category)
  }

  const getTasksByAssignee = (assigneeId: string) => {
    return tasks.value.filter(task => task.assigneeId === assigneeId)
  }

  const getTasksByDateRange = (startDate: Date, endDate: Date) => {
    return tasks.value.filter(task => {
      if (!task.dueDate) return false
      const dueDate = new Date(task.dueDate)
      return dueDate >= startDate && dueDate <= endDate
    })
  }

  const getTaskStats = () => {
    const total = tasks.value.length
    const completed = completedTasks.value.length
    const pending = pendingTasks.value.length
    const overdue = overdueTasks.value.length
    const highPriority = highPriorityTasks.value.length

    return {
      total,
      completed,
      pending,
      overdue,
      highPriority,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
    }
  }

  return {
    // State
    tasks,
    loading,
    error,

    // Computed properties
    completedTasks,
    pendingTasks,
    highPriorityTasks,
    overdueTasks,
    todayTasks,

    // Error handling
    setError,
    clearError,

    // API methods
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    getTaskById,
    markTaskCompleted,
    updateTaskStatus,
    updateTaskPriority,
    assignTask,
    addTaskTag,
    removeTaskTag,

    // Utility methods
    clearTasks,
    getTasksByStatus,
    getTasksByPriority,
    getTasksByCategory,
    getTasksByAssignee,
    getTasksByDateRange,
    getTaskStats,
  }
}
