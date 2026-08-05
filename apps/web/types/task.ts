// ── Tipo principal devuelto por la API /tasks ──────────────────────────────
export interface FrontendTask {
  id: string
  title: string
  description?: string
  status: string // 'todo' | 'in_progress' | 'review' | 'completed' | 'cancelled'
  priority: string // 'low' | 'medium' | 'high' | 'urgent'
  isCompleted: boolean
  startTime: string // ISO string (API)
  endTime?: string
  duration?: number // minutos
  estimatedDuration?: number
  dueDate?: string
  completedAt?: string
  type?: string // 'work' | 'study' | 'exercise' | etc.
  tags: string[]
  category?: string
  planId?: string | null
  createdAt: string
  updatedAt: string
}

// ── Payloads API ──────────────────────────────────────────────────────────
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | 'CRITICAL'

export interface CreateTaskPayload {
  title: string
  description?: string
  startTime?: Date
  endTime?: Date
  priority?: TaskPriority
  category?: string
  type?: string
  tags?: string[]
  estimatedDuration?: number
  planId?: string | null
}

export interface UpdateTaskPayload {
  title?: string
  description?: string
  startTime?: Date
  endTime?: Date | null
  priority?: TaskPriority
  category?: string
  type?: string
  tags?: string[]
  isCompleted?: boolean
  estimatedDuration?: number
  dueDate?: Date | null
}

// ── Tipo de UI (usado por TaskItem, TaskCard, stores/timer, etc.) ──────────
export interface Task {
  id: string
  name: string
  title?: string
  createdAt: Date
  updatedAt?: Date
  category?: string
  priority?: 'alta' | 'media' | 'baja'
  /** Prioridad canónica del API; preserva urgent/critical en round-trip */
  apiPriority?: TaskPriority
  completed?: boolean
  isRunning?: boolean
  isOnBreak?: boolean
  timeRemaining?: number
  totalTime?: number
  totalTimeSpent?: number
  notes?: string
  hasNotes?: boolean
  lastEdited?: Date
  duration?: string
  status?: string
  progress?: number
  projectId?: string
  description?: string
  estimatedTime?: string
  tags?: string[]
  startTime?: Date
  endTime?: Date
  dueDate?: Date | null
  type?: string
}

// ── Timer ──────────────────────────────────────────────────────────────────
export interface TimerMode {
  id: string
  name: string
  description: string
  duration: string
  time: number
  color: string
  icon: string
  minutes?: number
  /** Clave backend §5.4 (`25_5`, `52_17`, …); ausente en presets solo locales. */
  presetKey?: string
  /** Pausa en segundos cuando viene del servidor (UI ajustes). */
  breakSec?: number
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

export type TaskFeedbackScale = 1 | 2 | 3 | 4 | 5
export type TaskFeedbackTimeFit = 'yes' | 'mixed' | 'no'
export type TaskFeedbackBlocker =
  | 'fatigue'
  | 'distractions'
  | 'clarity'
  | 'difficulty'
  | 'motivation'
  | 'environment'
  | 'none'

export interface TaskCompletionFeedback {
  energyAfter: TaskFeedbackScale
  focusScore: TaskFeedbackScale
  progressScore: TaskFeedbackScale
  mentalDemand: TaskFeedbackScale
  timeFit: TaskFeedbackTimeFit
  mainBlocker: TaskFeedbackBlocker
}

// ── Conversión FrontendTask → Task (para UI) ───────────────────────────────
export function frontendTaskToUiTask(t: FrontendTask): Task {
  const visualPriorityMap: Record<string, 'alta' | 'media' | 'baja'> = {
    low: 'baja',
    medium: 'media',
    high: 'alta',
    urgent: 'alta',
    critical: 'alta',
  }
  const apiPriorityMap: Record<string, TaskPriority> = {
    low: 'LOW',
    medium: 'MEDIUM',
    high: 'HIGH',
    urgent: 'URGENT',
    critical: 'CRITICAL',
  }
  const p = t.priority?.toLowerCase() ?? 'medium'
  return {
    id: t.id,
    name: t.title,
    title: t.title,
    description: t.description,
    category: t.type ?? t.category,
    priority: visualPriorityMap[p] ?? 'media',
    apiPriority: apiPriorityMap[p] ?? 'MEDIUM',
    completed: t.isCompleted,
    isRunning: false,
    timeRemaining:
      t.estimatedDuration != null || t.duration != null
        ? (t.estimatedDuration ?? t.duration)! * 60
        : undefined,
    totalTimeSpent: 0,
    notes: t.description ?? '',
    hasNotes: !!t.description,
    duration:
      t.duration != null || t.estimatedDuration != null
        ? `${t.duration ?? t.estimatedDuration}m`
        : undefined,
    estimatedTime:
      t.estimatedDuration != null || t.duration != null
        ? String(t.estimatedDuration ?? t.duration)
        : undefined,
    tags: t.tags,
    startTime: t.startTime ? new Date(t.startTime) : undefined,
    endTime: t.endTime ? new Date(t.endTime) : undefined,
    dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
    createdAt: new Date(t.createdAt),
    updatedAt: new Date(t.updatedAt),
    type: t.type,
  }
}

// ── Conversión Task (UI) → UpdateTaskPayload ───────────────────────────────
export function uiTaskToUpdatePayload(task: Task): UpdateTaskPayload {
  const visualToApi: Record<string, TaskPriority> = {
    baja: 'LOW',
    media: 'MEDIUM',
    alta: 'HIGH',
  }
  let estimatedDuration: number | undefined
  if (task.estimatedTime) {
    const p = parseInt(task.estimatedTime, 10)
    if (!isNaN(p)) estimatedDuration = p
  } else if (task.duration) {
    const p = parseInt(task.duration, 10)
    if (!isNaN(p)) estimatedDuration = p
  }
  return {
    title: task.name ?? task.title,
    description: task.notes,
    category: task.category,
    priority: task.apiPriority ?? visualToApi[task.priority ?? 'media'] ?? 'MEDIUM',
    tags: task.tags ?? [],
    isCompleted: task.completed ?? false,
    ...(estimatedDuration !== undefined ? { estimatedDuration } : {}),
    ...(task.startTime ? { startTime: task.startTime } : {}),
    ...(task.endTime !== undefined ? { endTime: task.endTime ?? null } : {}),
    ...(task.dueDate !== undefined ? { dueDate: task.dueDate } : {}),
  }
}
