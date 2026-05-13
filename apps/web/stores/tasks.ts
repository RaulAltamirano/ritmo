import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useHttpClient } from '@/composables/shared/useHttpClient'
import type { FrontendTask, CreateTaskPayload, UpdateTaskPayload } from '@/types/task'

type ActionResult<T = undefined> =
  | { success: true; data?: T; error?: never }
  | { success: false; data?: never; error: string }

export const useTasksStore = defineStore('tasks', () => {
  const http = useHttpClient()

  const tasks = ref<FrontendTask[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastFetched = ref<Date | null>(null)

  // ── Getters ──────────────────────────────────────────
  const todayTasks = computed(() => {
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
    return tasks.value.filter(t => {
      const d = new Date(t.startTime)
      return d >= startOfDay && d <= endOfDay
    })
  })

  const pendingTasks = computed(() => tasks.value.filter(t => !t.isCompleted))
  const completedTasks = computed(() => tasks.value.filter(t => t.isCompleted))
  const highPriorityTasks = computed(() =>
    tasks.value.filter(t => {
      const p = t.priority.toLowerCase()
      return p === 'high' || p === 'urgent'
    }),
  )

  // ── Actions ──────────────────────────────────────────
  const fetchToday = async (): Promise<ActionResult> => {
    if (loading.value) return { success: false, error: 'Fetch already in progress' }
    loading.value = true
    error.value = null
    try {
      const response = await http.get<FrontendTask[]>('/tasks/today')
      if (response.success && response.data) {
        tasks.value = response.data
        lastFetched.value = new Date()
        return { success: true }
      }
      throw new Error('Failed to fetch today tasks')
    } catch (err: unknown) {
      const e = err as { userMessage?: string; message?: string }
      const msg = e?.userMessage ?? e?.message ?? 'Failed to fetch today tasks'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      loading.value = false
    }
  }

  const create = async (
    payload: CreateTaskPayload,
  ): Promise<ActionResult<FrontendTask>> => {
    if (!payload.title.trim()) return { success: false, error: 'Title cannot be empty' }
    loading.value = true
    error.value = null
    try {
      const response = await http.post<FrontendTask>('/tasks', payload)
      if (response.success && response.data) {
        tasks.value.push(response.data)
        return { success: true, data: response.data }
      }
      throw new Error('Failed to create task')
    } catch (err: unknown) {
      const e = err as { userMessage?: string; message?: string }
      const msg = e?.userMessage ?? e?.message ?? 'Failed to create task'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      loading.value = false
    }
  }

  const update = async (
    id: string,
    payload: UpdateTaskPayload,
  ): Promise<ActionResult<FrontendTask>> => {
    const index = tasks.value.findIndex(t => t.id === id)
    if (index === -1) return { success: false, error: `Task ${id} not found` }
    loading.value = true
    error.value = null
    try {
      const response = await http.put<FrontendTask>(`/tasks/${id}`, payload)
      if (response.success && response.data) {
        tasks.value[index] = response.data
        return { success: true, data: response.data }
      }
      throw new Error('Failed to update task')
    } catch (err: unknown) {
      const e = err as { userMessage?: string; message?: string }
      const msg = e?.userMessage ?? e?.message ?? 'Failed to update task'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      loading.value = false
    }
  }

  const remove = async (id: string): Promise<ActionResult> => {
    const index = tasks.value.findIndex(t => t.id === id)
    if (index === -1) return { success: false, error: `Task ${id} not found` }
    const snapshot = [...tasks.value]
    loading.value = true
    error.value = null
    try {
      const response = await http.del<{ message: string }>(`/tasks/${id}`)
      if (response.success) {
        tasks.value = tasks.value.filter(t => t.id !== id)
        return { success: true }
      }
      throw new Error('Failed to delete task')
    } catch (err: unknown) {
      tasks.value = snapshot
      const e = err as { userMessage?: string; message?: string }
      const msg = e?.userMessage ?? e?.message ?? 'Failed to delete task'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      loading.value = false
    }
  }

  const markCompleted = async (
    id: string,
    completed = true,
  ): Promise<ActionResult<FrontendTask>> => {
    return update(id, { isCompleted: completed })
  }

  const reset = () => {
    tasks.value = []
    loading.value = false
    error.value = null
    lastFetched.value = null
  }

  return {
    tasks,
    loading,
    error,
    lastFetched,
    todayTasks,
    pendingTasks,
    completedTasks,
    highPriorityTasks,
    fetchToday,
    create,
    update,
    remove,
    markCompleted,
    reset,
  }
})
