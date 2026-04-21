import { ref, computed } from 'vue'
import type { CalendarEvent, Schedule, Project, CalendarView } from '~/types/calendar'

export const useCalendar = () => {
  // Estado
  const events = ref<CalendarEvent[]>([])
  const projects = ref<Project[]>([])
  const schedules = ref<Schedule[]>([])

  // Computed properties
  const eventsThisMonth = computed(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    return events.value.filter(
      (event: CalendarEvent) =>
        event.start >= startOfMonth && event.start <= endOfMonth,
    ).length
  })

  const totalScheduledHours = computed(() => {
    return events.value.reduce((total: number, event: CalendarEvent) => {
      if (!event.allDay && event.start && event.end) {
        const duration =
          (event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60)
        return total + duration
      }
      return total
    }, 0)
  })

  const activeProjects = computed(() => {
    return projects.value.filter((project: Project) => project.isActive).length
  })

  const nextEvent = computed(() => {
    const now = new Date()
    const upcomingEvents = events.value
      .filter((event: CalendarEvent) => event.start > now)
      .sort(
        (a: CalendarEvent, b: CalendarEvent) => a.start.getTime() - b.start.getTime(),
      )

    if (upcomingEvents.length > 0) {
      const next = upcomingEvents[0]
      return {
        title: next.title,
        start: next.start,
        timeUntil: Math.floor((next.start.getTime() - now.getTime()) / (1000 * 60)),
      }
    }
    return null
  })

  // Methods
  const addEvent = (event: CalendarEvent) => {
    events.value.push(event)
  }

  const updateEvent = (eventId: string, updates: Partial<CalendarEvent>) => {
    const index = events.value.findIndex((e: CalendarEvent) => e.id === eventId)
    if (index > -1) {
      events.value[index] = { ...events.value[index], ...updates }
    }
  }

  const deleteEvent = (eventId: string) => {
    events.value = events.value.filter((e: CalendarEvent) => e.id !== eventId)
  }

  const getEventColor = (category?: string): string => {
    const colorMap: Record<string, string> = {
      work: '#3B82F6',
      personal: '#10B981',
      study: '#F59E0B',
      health: '#EF4444',
    }
    return colorMap[category || 'work'] || '#6B7280'
  }

  return {
    events,
    projects,
    schedules,
    eventsThisMonth,
    totalScheduledHours,
    activeProjects,
    nextEvent,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventColor,
  }
}
