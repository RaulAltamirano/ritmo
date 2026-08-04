export type ProjectStatus =
  | 'activo'
  | 'en_progreso'
  | 'planificado'
  | 'completado'
  | 'pausado'

export type ApiPlanStatus = 'planned' | 'active' | 'paused' | 'completed'

export interface Project {
  id: string
  name: string
  description: string
  status: ProjectStatus
  progress: number // porcentaje de completado (0-100)
  pendingTasks: number
  totalTasks: number
  createdAt: Date
  updatedAt: Date
  color: string
  icon: string
}

/** Shape returned by GET /plans */
export interface FrontendPlan {
  id: string
  name: string
  description?: string
  status: ApiPlanStatus
  color?: string
  icon?: string
  totalTasks: number
  pendingTasks: number
  progress: number
  createdAt: string | Date
  updatedAt: string | Date
}

export interface ProjectFormData {
  name: string
  description: string
  status: Project['status']
  color: string
}

export interface ProjectModalProps {
  modelValue: boolean
  project?: Project | null
}

export interface ProjectCardProps {
  project: Project
}

const API_STATUS_TO_UI: Record<ApiPlanStatus, ProjectStatus> = {
  planned: 'planificado',
  active: 'activo',
  paused: 'pausado',
  completed: 'completado',
}

const UI_STATUS_TO_API: Record<ProjectStatus, ApiPlanStatus> = {
  planificado: 'planned',
  activo: 'active',
  en_progreso: 'active',
  pausado: 'paused',
  completado: 'completed',
}

export interface CreatePlanPayload {
  name: string
  description?: string
  status?: ApiPlanStatus
  color?: string
  icon?: string
}

export function frontendPlanToProject(plan: FrontendPlan): Project {
  return {
    id: plan.id,
    name: plan.name,
    description: plan.description ?? '',
    status: API_STATUS_TO_UI[plan.status] ?? 'planificado',
    progress: plan.progress,
    pendingTasks: plan.pendingTasks,
    totalTasks: plan.totalTasks,
    createdAt: new Date(plan.createdAt),
    updatedAt: new Date(plan.updatedAt),
    color: plan.color?.trim() || 'blue',
    icon: plan.icon?.trim() || 'Compass',
  }
}

export function projectFormToCreatePayload(
  form: ProjectFormData,
  icon = 'Compass',
): CreatePlanPayload {
  return {
    name: form.name.trim(),
    description: form.description.trim() || undefined,
    status: UI_STATUS_TO_API[form.status] ?? 'planned',
    color: form.color?.trim() || undefined,
    icon,
  }
}
