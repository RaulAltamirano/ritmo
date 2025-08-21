export interface Project {
  id: string
  name: string
  description: string
  status: 'activo' | 'en_progreso' | 'planificado' | 'completado' | 'pausado'
  progress: number // porcentaje de completado (0-100)
  pendingTasks: number
  totalTasks: number
  createdAt: Date
  updatedAt: Date
  color: string
  icon: string
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