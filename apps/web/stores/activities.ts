import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useHttpClient } from '@/composables/shared/useHttpClient'
import type {
  Activity,
  CreateActivityPayload,
  UpdateActivityPayload,
} from '@/types/activity'

type ActionResult<T = undefined> =
  | { success: true; data?: T; error?: never }
  | { success: false; data?: never; error: string }

export const useActivitiesStore = defineStore('activities', () => {
  const http = useHttpClient()

  const activities = ref<Activity[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastFetched = ref<Date | null>(null)

  // ── Getters ──────────────────────────────────────────
  // Note: comparison uses local-time boundaries vs startTime ISO string parsed as UTC.
  // This is intentional — the API already scopes /activities/today by server day, so
  // this getter is a client-side safety net that filters by the user's local calendar day.
  const todayActivities = computed(() => {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999,
    )
    return activities.value.filter(a => {
      const d = new Date(a.startTime)
      return d >= startOfDay && d <= endOfDay
    })
  })

  const pendingActivities = computed(() => activities.value.filter(a => !a.isCompleted))

  const completedActivities = computed(() =>
    activities.value.filter(a => a.isCompleted),
  )

  const highPriorityActivities = computed(() =>
    activities.value.filter(a => {
      const p = a.priority.toLowerCase()
      return p === 'high' || p === 'urgent'
    }),
  )

  // ── Actions ──────────────────────────────────────────
  const fetchToday = async (): Promise<ActionResult> => {
    if (loading.value) return { success: false, error: 'Fetch already in progress' }

    loading.value = true
    error.value = null

    try {
      const response = await http.get<Activity[]>('/activities/today')
      if (response.success && response.data) {
        activities.value = response.data
        lastFetched.value = new Date()
        return { success: true }
      }
      throw new Error('Failed to fetch today activities')
    } catch (err: unknown) {
      const e = err as { userMessage?: string; message?: string }
      const msg = e?.userMessage ?? e?.message ?? 'Failed to fetch today activities'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      loading.value = false
    }
  }

  const create = async (
    payload: CreateActivityPayload,
  ): Promise<ActionResult<Activity>> => {
    if (!payload.title.trim()) {
      return { success: false, error: 'Title cannot be empty' }
    }

    loading.value = true
    error.value = null

    try {
      const response = await http.post<Activity>('/activities', payload)
      if (response.success && response.data) {
        activities.value.push(response.data)
        return { success: true, data: response.data }
      }
      throw new Error('Failed to create activity')
    } catch (err: unknown) {
      const e = err as { userMessage?: string; message?: string }
      const msg = e?.userMessage ?? e?.message ?? 'Failed to create activity'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      loading.value = false
    }
  }

  const update = async (
    id: string,
    payload: UpdateActivityPayload,
  ): Promise<ActionResult<Activity>> => {
    const index = activities.value.findIndex(a => a.id === id)
    if (index === -1) {
      return { success: false, error: `Activity ${id} not found` }
    }

    // Pessimistic: no pre-call mutation — only write to the array on confirmed success.
    loading.value = true
    error.value = null

    try {
      const response = await http.put<Activity>(`/activities/${id}`, payload)
      if (response.success && response.data) {
        activities.value[index] = response.data
        return { success: true, data: response.data }
      }
      throw new Error('Failed to update activity')
    } catch (err: unknown) {
      const e = err as { userMessage?: string; message?: string }
      const msg = e?.userMessage ?? e?.message ?? 'Failed to update activity'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      loading.value = false
    }
  }

  const remove = async (id: string): Promise<ActionResult> => {
    const index = activities.value.findIndex(a => a.id === id)
    if (index === -1) {
      return { success: false, error: `Activity ${id} not found` }
    }

    const snapshot = [...activities.value]
    loading.value = true
    error.value = null

    try {
      const response = await http.del<{ message: string }>(`/activities/${id}`)
      if (response.success) {
        activities.value = activities.value.filter(a => a.id !== id)
        return { success: true }
      }
      throw new Error('Failed to delete activity')
    } catch (err: unknown) {
      activities.value = snapshot
      const e = err as { userMessage?: string; message?: string }
      const msg = e?.userMessage ?? e?.message ?? 'Failed to delete activity'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      loading.value = false
    }
  }

  const markCompleted = async (
    id: string,
    completed = true,
  ): Promise<ActionResult<Activity>> => {
    return update(id, { isCompleted: completed })
  }

  const reset = () => {
    activities.value = []
    loading.value = false
    error.value = null
    lastFetched.value = null
  }

  return {
    // State (exposed as refs for direct mutation in tests)
    activities,
    loading,
    error,
    lastFetched,
    // Getters
    todayActivities,
    pendingActivities,
    completedActivities,
    highPriorityActivities,
    // Actions
    fetchToday,
    create,
    update,
    remove,
    markCompleted,
    reset,
  }
})
