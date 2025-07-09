import { ref, computed } from 'vue'
import type { CalendarEvent, Schedule, Project, CalendarView } from '~/types/calendar'

export const useCalendar = () => {
  // Estado
  const events = ref<CalendarEvent[]>([])
  const schedules = ref<Schedule[]>([])
  const projects = ref<Project[]>([])
  const currentView = ref<CalendarView>('timeGridWeek')
  const currentDate = ref(new Date())

  // Computed
  const eventsThisMonth = computed(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    return events.value.filter(event => 
      event.start >= startOfMonth && event.start <= endOfMonth
    ).length
  })

  const totalScheduledHours = computed(() => {
    return events.value.reduce((total, event) => {
      if (!event.allDay && event.start && event.end) {
        const duration = (event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60)
        return total + duration
      }
      return total
    }, 0).toFixed(1)
  })

  const activeProjects = computed(() => {
    return projects.value.filter(project => project.isActive).length
  })

  const nextEvent = computed(() => {
    const now = new Date()
    const upcomingEvents = events.value
      .filter(event => event.start > now)
      .sort((a, b) => a.start.getTime() - b.start.getTime())
    
    if (upcomingEvents.length > 0) {
      const next = upcomingEvents[0]
      const timeString = next.start.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      })
      return `${next.title} - ${timeString}`
    }
    
    return 'No hay eventos próximos'
  })

  // Métodos
  const addEvent = (event: CalendarEvent) => {
    events.value.push(event)
  }

  const updateEvent = (eventId: string, updates: Partial<CalendarEvent>) => {
    const index = events.value.findIndex(e => e.id === eventId)
    if (index > -1) {
      events.value[index] = { ...events.value[index], ...updates }
    }
  }

  const deleteEvent = (eventId: string) => {
    events.value = events.value.filter(e => e.id !== eventId)
  }

  const getEventColor = (category?: string): string => {
    const colors = {
      'Trabajo': '#3B82F6',
      'Estudio': '#10B981',
      'Personal': '#8B5CF6',
      'Reunión': '#F59E0B',
      'Proyecto': '#6366F1'
    }
    return colors[category as keyof typeof colors] || '#6B7280'
  }

  const changeView = (view: CalendarView) => {
    currentView.value = view
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate.value)
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1)
    } else {
      newDate.setDate(newDate.getDate() + 1)
    }
    currentDate.value = newDate
  }

  const goToToday = () => {
    currentDate.value = new Date()
  }

  // Cargar datos de ejemplo
  const loadSampleData = () => {
    // Proyectos de ejemplo
    projects.value = [
      {
        id: '1',
        name: 'Proyecto Web',
        description: 'Desarrollo de aplicación web',
        color: '#3B82F6',
        icon: 'Globe',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Estudios',
        description: 'Cursos y certificaciones',
        color: '#10B981',
        icon: 'GraduationCap',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'Personal',
        description: 'Tareas personales',
        color: '#8B5CF6',
        icon: 'User',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    // Eventos de ejemplo
    const now = new Date()
    events.value = [
      {
        id: '1',
        title: 'Reunión de proyecto',
        start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0),
        end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0),
        allDay: false,
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
        textColor: '#ffffff',
        extendedProps: {
          description: 'Reunión semanal del equipo',
          projectId: '1',
          category: 'Reunión',
          priority: 'alta',
          location: 'Sala de conferencias'
        }
      },
      {
        id: '2',
        title: 'Estudiar React',
        start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0),
        end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 0),
        allDay: false,
        backgroundColor: '#10B981',
        borderColor: '#10B981',
        textColor: '#ffffff',
        extendedProps: {
          description: 'Repasar conceptos avanzados de React',
          projectId: '2',
          category: 'Estudio',
          priority: 'media'
        }
      },
      {
        id: '3',
        title: 'Ejercicio',
        start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0),
        end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 19, 0),
        allDay: false,
        backgroundColor: '#8B5CF6',
        borderColor: '#8B5CF6',
        textColor: '#ffffff',
        extendedProps: {
          description: 'Rutina de ejercicios',
          category: 'Personal',
          priority: 'baja'
        }
      }
    ]
  }

  return {
    // Estado
    events,
    schedules,
    projects,
    currentView,
    currentDate,
    
    // Computed
    eventsThisMonth,
    totalScheduledHours,
    activeProjects,
    nextEvent,
    
    // Métodos
    addEvent,
    updateEvent,
    deleteEvent,
    getEventColor,
    changeView,
    navigateDate,
    goToToday,
    loadSampleData
  }
} 