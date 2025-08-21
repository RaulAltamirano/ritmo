export interface Task {
  id: string
  name: string
  title?: string // For compatibility with TaskItem
  createdAt: Date
  category?: string
  priority?: 'alta' | 'media' | 'baja'
  completed?: boolean
  isRunning?: boolean
  timeRemaining?: number // en segundos
  totalTime?: number // tiempo total en segundos
  totalTimeSpent?: number // tiempo acumulado en segundos
  notes?: string // notas de la tarea
  hasNotes?: boolean // indicador de si tiene notas
  lastEdited?: Date // última vez que se editó
  duration?: string // duración de la tarea
  status?: string // estado de la tarea (pendiente, en_progreso, completado, etc.)
  progress?: number // progreso de la tarea (0-100)
  projectId?: string // ID del proyecto al que pertenece
  description?: string // descripción de la tarea
}

export interface TimerMode {
  id: string
  name: string
  description: string
  duration: string
  time: number // en segundos
  color: string
  icon: string
  minutes?: number // para compatibilidad
}

export type ViewMode = 'list' | 'grid'

export interface TaskListProps {
  tasks: Task[]
}

export interface TaskItemProps {
  task: Task
}

export interface TaskFiltersProps {
  categories: string[]
  selectedCategory: string | null
}

export interface ViewModeToggleProps {
  modelValue: ViewMode
  taskCount: number
}

export interface TaskNoteModalProps {
  modelValue: boolean
  taskTitle: string
  initialNote?: string
}

export interface TaskEditModalProps {
  modelValue: boolean
  task: Task | null
}

export interface EmptyStateProps {
  selectedCategory?: string | null
} 