export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  allDay?: boolean
  color?: string
  backgroundColor?: string
  borderColor?: string
  textColor?: string
  extendedProps?: {
    description?: string
    location?: string
    projectId?: string
    taskIds?: string[]
    category?: string
    priority?: 'alta' | 'media' | 'baja'
    notes?: string
    isRecurring?: boolean
    recurrenceRule?: string
  }
}

export interface Schedule {
  id: string
  title: string
  description?: string
  startTime: string // HH:mm format
  endTime: string // HH:mm format
  days: string[] // ['monday', 'tuesday', etc.]
  color?: string
  projectId?: string
  category?: string
  priority?: 'alta' | 'media' | 'baja'
  isActive?: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Project {
  id: string
  name: string
  description?: string
  color?: string
  icon?: string
  isActive?: boolean
  createdAt: Date
  updatedAt: Date
}

export type CalendarView = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek'

export interface CalendarViewConfig {
  type: CalendarView
  label: string
  icon: string
  description: string
}

export interface CalendarFilters {
  projects: string[]
  categories: string[]
  priorities: string[]
  dateRange?: {
    start: Date
    end: Date
  }
}

export interface ChatMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  scheduleId?: string
  taskIds?: string[]
}

export interface ScheduleDetail {
  schedule: Schedule
  tasks: Task[]
  chatMessages: ChatMessage[]
  aiContext?: {
    lastInteraction: Date
    suggestions: string[]
    context: string
  }
}

// Re-export Task type for convenience
export interface Task {
  id: string
  name: string
  title?: string
  createdAt: Date
  category?: string
  priority?: 'alta' | 'media' | 'baja'
  completed?: boolean
  isRunning?: boolean
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
  scheduleId?: string // Link to schedule
} 