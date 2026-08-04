import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useHttpClient } from '@/composables/shared/useHttpClient'
import { API_ENDPOINTS } from '@/constants/api'
import type { FrontendPlan, Project, CreatePlanPayload } from '@/types/project'
import { frontendPlanToProject, projectFormToCreatePayload } from '@/types/project'
import type { ProjectFormData } from '@/types/project'
import type { FrontendTask, Task } from '@/types/task'
import { frontendTaskToUiTask } from '@/types/task'

type ActionResult<T = undefined> =
  | { success: true; data?: T; error?: never }
  | { success: false; data?: never; error: string }

const generateId = (prefix = 'item') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const normalizeProjectId = (id: string): string => {
  if (/^\d+$/.test(id)) return `project_${id}`
  if (id.startsWith('project_')) return id
  return id
}

/** Map API task statuses onto ProjectBoard column keys. */
function apiStatusToBoardStatus(status: string): string {
  switch (status) {
    case 'in_progress':
    case 'review':
      return 'en_progreso'
    case 'completed':
      return 'completado'
    case 'todo':
    case 'cancelled':
    case 'archived':
    default:
      return 'pendiente'
  }
}

function apiTaskToBoardTask(t: FrontendTask): Task {
  const ui = frontendTaskToUiTask(t)
  return {
    ...ui,
    projectId: t.planId ?? undefined,
    status: apiStatusToBoardStatus(t.status),
  }
}

export const useProjectsStore = defineStore('projects', () => {
  const http = useHttpClient()

  const projects = ref<Project[]>([])
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchPlans = async (): Promise<ActionResult> => {
    if (loading.value) return { success: false, error: 'Fetch already in progress' }
    loading.value = true
    error.value = null
    try {
      const response = await http.get<FrontendPlan[]>(API_ENDPOINTS.PLANS.LIST)
      if (response.success && Array.isArray(response.data)) {
        projects.value = response.data.map(frontendPlanToProject)
        return { success: true }
      }
      throw new Error('Failed to fetch plans')
    } catch (err: unknown) {
      const e = err as { userMessage?: string; message?: string }
      const msg = e?.userMessage ?? e?.message ?? 'Could not load plans'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      loading.value = false
    }
  }

  const createPlan = async (form: ProjectFormData): Promise<ActionResult<Project>> => {
    const name = form.name.trim()
    if (!name) return { success: false, error: 'Name is required' }
    if (name.length > 255) {
      return { success: false, error: 'Name must be at most 255 characters' }
    }

    loading.value = true
    error.value = null
    try {
      const payload: CreatePlanPayload = projectFormToCreatePayload(form)
      const response = await http.post<FrontendPlan>(
        API_ENDPOINTS.PLANS.CREATE,
        payload,
      )
      if (response.success && response.data) {
        const project = frontendPlanToProject(response.data)
        projects.value.unshift(project)
        return { success: true, data: project }
      }
      throw new Error('Failed to create plan')
    } catch (err: unknown) {
      const e = err as { userMessage?: string; message?: string }
      const msg = e?.userMessage ?? e?.message ?? 'Could not create plan'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      loading.value = false
    }
  }

  const fetchPlan = async (planId: string): Promise<ActionResult<Project>> => {
    loading.value = true
    error.value = null
    try {
      const response = await http.get<FrontendPlan>(API_ENDPOINTS.PLANS.BY_ID(planId))
      if (response.success && response.data) {
        const project = frontendPlanToProject(response.data)
        const idx = projects.value.findIndex(p => p.id === project.id)
        if (idx === -1) projects.value.unshift(project)
        else projects.value[idx] = project
        return { success: true, data: project }
      }
      throw new Error('Failed to fetch plan')
    } catch (err: unknown) {
      const e = err as { userMessage?: string; message?: string }
      const msg = e?.userMessage ?? e?.message ?? 'Could not load plan'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      loading.value = false
    }
  }

  const fetchPlanTasks = async (planId: string): Promise<ActionResult> => {
    try {
      const response = await http.get<FrontendTask[]>(API_ENDPOINTS.PLANS.TASKS(planId))
      if (response.success && Array.isArray(response.data)) {
        const mapped = response.data.map(apiTaskToBoardTask)
        tasks.value = [...tasks.value.filter(t => t.projectId !== planId), ...mapped]
        return { success: true }
      }
      throw new Error('Failed to fetch plan tasks')
    } catch (err: unknown) {
      const e = err as { userMessage?: string; message?: string }
      const msg = e?.userMessage ?? e?.message ?? 'Could not load plan tasks'
      error.value = msg
      return { success: false, error: msg }
    }
  }

  /** @deprecated Prefer fetchPlans — mock seed removed. */
  const initializeData = () => {
    void fetchPlans()
  }

  const getProjectById = (id: string) => {
    const normalizedId = normalizeProjectId(id)
    return projects.value.find(
      (project: Project) => project.id === normalizedId || project.id === id,
    )
  }

  const getTasksByProjectId = (projectId: string) => {
    return tasks.value.filter((task: Task) => task.projectId === projectId)
  }

  const getProjectStats = (projectId: string) => {
    const projectTasks = tasks.value.filter(
      (task: Task) => task.projectId === projectId,
    )
    const totalTasks = projectTasks.length
    const completedTasks = projectTasks.filter((task: Task) => task.completed).length
    const pendingTasks = totalTasks - completedTasks
    const progress =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      progress,
    }
  }

  const addProject = (project: Project) => {
    if (!project.id) {
      project.id = generateId('plan')
    }
    projects.value.unshift(project)
  }

  const updateProject = (project: Project) => {
    const index = projects.value.findIndex((p: Project) => p.id === project.id)
    if (index !== -1) {
      projects.value[index] = { ...project, updatedAt: new Date() }
    }
  }

  const deleteProject = (projectId: string) => {
    projects.value = projects.value.filter((p: Project) => p.id !== projectId)
    tasks.value = tasks.value.filter((t: Task) => t.projectId !== projectId)
  }

  const addTask = (task: Task) => {
    if (!task.id || task.id.startsWith('task_')) {
      task.id = generateId('task')
    }
    tasks.value.push(task)
    updateProjectStats(task.projectId)
  }

  const updateTask = (task: Task) => {
    const index = tasks.value.findIndex((t: Task) => t.id === task.id)
    if (index !== -1) {
      tasks.value[index] = { ...task, lastEdited: new Date() }
      updateProjectStats(task.projectId)
    }
  }

  const deleteTask = (taskId: string) => {
    const task = tasks.value.find((t: Task) => t.id === taskId)
    if (task) {
      tasks.value = tasks.value.filter((t: Task) => t.id !== taskId)
      updateProjectStats(task.projectId)
    }
  }

  const updateProjectStats = (projectId: string | undefined) => {
    if (!projectId) return
    const stats = getProjectStats(projectId)
    const project = projects.value.find((p: Project) => p.id === projectId)
    if (project) {
      project.totalTasks = stats.totalTasks
      project.pendingTasks = stats.pendingTasks
      project.progress = stats.progress
      project.updatedAt = new Date()
    }
  }

  return {
    projects,
    tasks,
    loading,
    error,
    getProjectById,
    getTasksByProjectId,
    getProjectStats,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask,
    updateProjectStats,
    fetchPlans,
    fetchPlan,
    fetchPlanTasks,
    createPlan,
    initializeData,
    generateId,
    normalizeProjectId,
  }
})
