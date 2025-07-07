import { ref, computed } from 'vue'

export interface Activity {
  id: string
  userId: string
  title: string
  description?: string
  type: 'WORK' | 'STUDY' | 'EXERCISE' | 'CREATIVE' | 'SOCIAL' | 'REST' | 'OTHER'
  duration: number
  startTime: string
  endTime: string
  isCompleted: boolean
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  tags: string[]
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    name: string
    email: string
  }
}

export interface CreateActivityData {
  userId?: string
  title: string
  description?: string
  type?: Activity['type']
  duration?: number
  startTime?: string
  priority?: Activity['priority']
  tags?: string[]
}

export interface UpdateActivityData {
  title?: string
  description?: string
  type?: Activity['type']
  duration?: number
  startTime?: string
  endTime?: string
  isCompleted?: boolean
  priority?: Activity['priority']
  tags?: string[]
}

export const useActivities = () => {
  const activities = ref<Activity[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const completedActivities = computed(() => 
    activities.value.filter(activity => activity.isCompleted)
  )

  const pendingActivities = computed(() => 
    activities.value.filter(activity => !activity.isCompleted)
  )

  const highPriorityActivities = computed(() => 
    activities.value.filter(activity => 
      activity.priority === 'HIGH' || activity.priority === 'URGENT'
    )
  )

  const todayActivities = computed(() => {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)

    return activities.value.filter(activity => {
      const activityDate = new Date(activity.startTime)
      return activityDate >= startOfDay && activityDate <= endOfDay
    })
  })

  // API methods
  const fetchActivities = async (filters?: Record<string, any>) => {
    loading.value = true
    error.value = null
    
    try {
      const query = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query.append(key, String(value))
          }
        })
      }

      const response = await $fetch(`/api/activities?${query.toString()}`)
      
      if (response.success) {
        activities.value = response.data
      } else {
        throw new Error('Failed to fetch activities')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch activities'
      console.error('Error fetching activities:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchTodayActivities = async (userId?: string) => {
    loading.value = true
    error.value = null
    
    try {
      const query = userId ? `?userId=${userId}` : ''
      const response = await $fetch<{ success: boolean; data: Activity[]; count: number }>(`/api/activities/today${query}`)
      
      if (response.success) {
        activities.value = response.data
      } else {
        throw new Error('Failed to fetch today activities')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch today activities'
      console.error('Error fetching today activities:', err)
    } finally {
      loading.value = false
    }
  }

  const createActivity = async (data: CreateActivityData): Promise<Activity | null> => {
    loading.value = true
    error.value = null
    
    try {
      const response = await $fetch<{ success: boolean; data: Activity; message: string }>('/api/activities', {
        method: 'POST',
        body: data
      })
      
      if (response.success) {
        const newActivity = response.data
        activities.value.push(newActivity)
        return newActivity
      } else {
        throw new Error('Failed to create activity')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create activity'
      console.error('Error creating activity:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const updateActivity = async (id: string, data: UpdateActivityData): Promise<Activity | null> => {
    loading.value = true
    error.value = null
    
    try {
      const response = await $fetch<{ success: boolean; data: Activity; message: string }>(`/api/activities/${id}`, {
        method: 'PUT',
        body: data
      })
      
      if (response.success) {
        const updatedActivity = response.data
        const index = activities.value.findIndex(activity => activity.id === id)
        if (index !== -1) {
          activities.value[index] = updatedActivity
        }
        return updatedActivity
      } else {
        throw new Error('Failed to update activity')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update activity'
      console.error('Error updating activity:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteActivity = async (id: string): Promise<boolean> => {
    loading.value = true
    error.value = null
    
    try {
      const response = await $fetch<{ success: boolean; message: string }>(`/api/activities/${id}`, {
        method: 'DELETE'
      })
      
      if (response.success) {
        activities.value = activities.value.filter(activity => activity.id !== id)
        return true
      } else {
        throw new Error('Failed to delete activity')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete activity'
      console.error('Error deleting activity:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const markAsCompleted = async (id: string): Promise<Activity | null> => {
    return await updateActivity(id, { isCompleted: true })
  }

  const markAsPending = async (id: string): Promise<Activity | null> => {
    return await updateActivity(id, { isCompleted: false })
  }

  // Utility methods
  const getActivityById = (id: string): Activity | undefined => {
    return activities.value.find(activity => activity.id === id)
  }

  const clearError = () => {
    error.value = null
  }

  const clearActivities = () => {
    activities.value = []
  }

  return {
    // State
    activities: readonly(activities),
    loading: readonly(loading),
    error: readonly(error),
    
    // Computed
    completedActivities,
    pendingActivities,
    highPriorityActivities,
    todayActivities,
    
    // Methods
    fetchActivities,
    fetchTodayActivities,
    createActivity,
    updateActivity,
    deleteActivity,
    markAsCompleted,
    markAsPending,
    getActivityById,
    clearError,
    clearActivities
  }
} 