/**
 * 🚀 RITMO ACTIVITIES COMPOSABLE - 2025 BEST PRACTICES
 *
 * Activities management using standardized API responses
 * All methods handle responses consistently and provide proper error handling
 */

import type { Activity } from '@/types/task'
import { computed, ref } from 'vue'
import { useHttpClient } from '../shared/useHttpClient'

export interface CreateActivityData {
  title: string
  description?: string
  startTime: Date
  endTime?: Date
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  category: string
  tags?: string[]
}

export interface UpdateActivityData {
  title?: string
  description?: string
  startTime?: Date
  endTime?: Date
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  category?: string
  isCompleted?: boolean
  tags?: string[]
}

export const useActivities = () => {
  const http = useHttpClient()
  const activities = ref<Activity[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const completedActivities = computed(() =>
    activities.value.filter(activity => activity.isCompleted),
  )

  const pendingActivities = computed(() =>
    activities.value.filter(activity => !activity.isCompleted),
  )

  const highPriorityActivities = computed(() =>
    activities.value.filter(
      activity => activity.priority === 'HIGH' || activity.priority === 'URGENT',
    ),
  )

  const todayActivities = computed(() => {
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

    return activities.value.filter(activity => {
      const activityDate = new Date(activity.startTime)
      return activityDate >= startOfDay && activityDate <= endOfDay
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
  const fetchActivities = async (filters?: Record<string, any>) => {
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

      const endpoint = `/activities${query.toString() ? `?${query.toString()}` : ''}`
      const response = await http.get<Activity[]>(endpoint)

      if (response.success && response.data) {
        activities.value = response.data
      } else {
        throw new Error('Failed to fetch activities')
      }
    } catch (err: any) {
      const errorMessage =
        err?.userMessage || err?.message || 'Failed to fetch activities'
      setError(errorMessage)
      console.error('Error fetching activities:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchTodayActivities = async (userId?: string) => {
    loading.value = true
    clearError()

    try {
      const query = new URLSearchParams()
      if (userId) {
        query.append('userId', userId)
      }

      const endpoint = `/activities/today${query.toString() ? `?${query.toString()}` : ''}`
      const response = await http.get<Activity[]>(endpoint)

      if (response.success && response.data) {
        activities.value = response.data
      } else {
        throw new Error('Failed to fetch today activities')
      }
    } catch (err: any) {
      const errorMessage =
        err?.userMessage || err?.message || 'Failed to fetch today activities'
      setError(errorMessage)
      console.error('Error fetching today activities:', err)
    } finally {
      loading.value = false
    }
  }

  const createActivity = async (activityData: CreateActivityData) => {
    loading.value = true
    clearError()

    try {
      const response = await http.post<Activity>('/activities', activityData)

      if (response.success && response.data) {
        activities.value.push(response.data)
        return { success: true, activity: response.data }
      } else {
        throw new Error('Failed to create activity')
      }
    } catch (err: any) {
      const errorMessage =
        err?.userMessage || err?.message || 'Failed to create activity'
      setError(errorMessage)
      console.error('Error creating activity:', err)
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  const updateActivity = async (id: string, activityData: UpdateActivityData) => {
    loading.value = true
    clearError()

    try {
      const response = await http.put<Activity>(`/activities/${id}`, activityData)

      if (response.success && response.data) {
        const index = activities.value.findIndex(activity => activity.id === id)
        if (index !== -1) {
          activities.value[index] = response.data
        }
        return { success: true, activity: response.data }
      } else {
        throw new Error('Failed to update activity')
      }
    } catch (err: any) {
      const errorMessage =
        err?.userMessage || err?.message || 'Failed to update activity'
      setError(errorMessage)
      console.error('Error updating activity:', err)
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  const deleteActivity = async (id: string) => {
    loading.value = true
    clearError()

    try {
      const response = await http.del<{ message: string }>(`/activities/${id}`)

      if (response.success) {
        activities.value = activities.value.filter(activity => activity.id !== id)
        return { success: true }
      } else {
        throw new Error('Failed to delete activity')
      }
    } catch (err: any) {
      const errorMessage =
        err?.userMessage || err?.message || 'Failed to delete activity'
      setError(errorMessage)
      console.error('Error deleting activity:', err)
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  const getActivityById = async (id: string) => {
    loading.value = true
    clearError()

    try {
      const response = await http.get<Activity>(`/activities/${id}`)

      if (response.success && response.data) {
        return { success: true, activity: response.data }
      } else {
        throw new Error('Failed to fetch activity')
      }
    } catch (err: any) {
      const errorMessage =
        err?.userMessage || err?.message || 'Failed to fetch activity'
      setError(errorMessage)
      console.error('Error fetching activity:', err)
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  const markActivityCompleted = async (id: string, completed = true) => {
    return updateActivity(id, { isCompleted: completed })
  }

  const updateActivityPriority = async (
    id: string,
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
  ) => {
    return updateActivity(id, { priority })
  }

  const addActivityTag = async (id: string, tag: string) => {
    try {
      const activity = activities.value.find(a => a.id === id)
      if (!activity) {
        throw new Error('Activity not found')
      }

      const currentTags = activity.tags || []
      if (!currentTags.includes(tag)) {
        const newTags = [...currentTags, tag]
        return updateActivity(id, { tags: newTags })
      }

      return { success: true }
    } catch (err: any) {
      const errorMessage = err?.userMessage || err?.message || 'Failed to add tag'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const removeActivityTag = async (id: string, tag: string) => {
    try {
      const activity = activities.value.find(a => a.id === id)
      if (!activity) {
        throw new Error('Activity not found')
      }

      const currentTags = activity.tags || []
      const newTags = currentTags.filter(t => t !== tag)
      return updateActivity(id, { tags: newTags })
    } catch (err: any) {
      const errorMessage = err?.userMessage || err?.message || 'Failed to remove tag'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Utility methods
  const clearActivities = () => {
    activities.value = []
    clearError()
  }

  const getActivitiesByCategory = (category: string) => {
    return activities.value.filter(activity => activity.category === category)
  }

  const getActivitiesByPriority = (priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT') => {
    return activities.value.filter(activity => activity.priority === priority)
  }

  const getActivitiesByDateRange = (startDate: Date, endDate: Date) => {
    return activities.value.filter(activity => {
      const activityDate = new Date(activity.startTime)
      return activityDate >= startDate && activityDate <= endDate
    })
  }

  return {
    // State
    activities,
    loading,
    error,

    // Computed properties
    completedActivities,
    pendingActivities,
    highPriorityActivities,
    todayActivities,

    // Error handling
    setError,
    clearError,

    // API methods
    fetchActivities,
    fetchTodayActivities,
    createActivity,
    updateActivity,
    deleteActivity,
    getActivityById,
    markActivityCompleted,
    updateActivityPriority,
    addActivityTag,
    removeActivityTag,

    // Utility methods
    clearActivities,
    getActivitiesByCategory,
    getActivitiesByPriority,
    getActivitiesByDateRange,
  }
}
