<template>
  <div class="calendar-container">
    <!-- Header del calendario con controles -->
    <div class="calendar-header bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <!-- Navegación y vista actual -->
        <div class="flex items-center gap-3">
          <!-- Botones de navegación -->
          <div class="flex items-center gap-2">
            <BaseButton
              variant="outline"
              size="sm"
              @click="navigateDate('prev')"
              aria-label="Fecha anterior"
            >
              <ChevronLeft :size="16" />
            </BaseButton>
            
            <BaseButton
              variant="outline"
              size="sm"
              @click="goToToday"
              aria-label="Ir a hoy"
            >
              Hoy
            </BaseButton>
            
            <BaseButton
              variant="outline"
              size="sm"
              @click="navigateDate('next')"
              aria-label="Fecha siguiente"
            >
              <ChevronRight :size="16" />
            </BaseButton>
          </div>
          
          <!-- Título del período actual -->
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ currentPeriodTitle }}
          </h2>
        </div>
        
        <!-- Controles de vista -->
        <div class="flex items-center gap-2">
          <!-- Selector de vista -->
          <div class="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              v-for="view in calendarViews"
              :key="view.type"
              @click="changeView(view.type)"
              :class="[
                'px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200',
                currentView === view.type
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              ]"
              :aria-label="`Cambiar a vista ${view.label}`"
            >
              {{ view.label }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- Filtros -->
      <CalendarFiltersComponent
        v-if="showFilters"
        :filters="filters"
        :available-projects="availableProjects"
        :available-categories="availableCategories"
        @filter-change="updateFilters"
      />
    </div>
    
    <!-- Calendario principal -->
    <div class="calendar-main bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <FullCalendar
        ref="calendarRef"
        :options="calendarOptions"
        class="calendar-component"
      />
    </div>
    
    <!-- Modal de creación rápida -->
    <QuickEventModal
      v-model="showQuickCreateModal"
      :selected-date="selectedDate"
      :selected-time="selectedTime"
      @create-event="handleCreateEvent"
    />
    
    <!-- Modal de detalles del evento -->
    <EventDetailModal
      v-model="showEventDetailModal"
      :event="selectedEvent"
      @edit-event="handleEditEvent"
      @delete-event="handleDeleteEvent"
      @navigate-to-schedule="navigateToSchedule"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Calendar,
  Clock,
  Grid3X3,
  List
} from 'lucide-vue-next'
import type { 
  CalendarEvent, 
  CalendarView, 
  CalendarViewConfig,
  CalendarFilters,
  Schedule,
  Project
} from '~/types/calendar'
import BaseButton from '~/components/atoms/BaseButton.vue'
import CalendarFiltersComponent from '~/components/molecules/CalendarFilters.vue'
import QuickEventModal from '~/components/molecules/QuickEventModal.vue'
import EventDetailModal from '~/components/molecules/EventDetailModal.vue'

// Props
interface CalendarViewProps {
  events?: CalendarEvent[]
  schedules?: Schedule[]
  projects?: Project[]
  initialView?: CalendarView
  showFilters?: boolean
}

const props = withDefaults(defineProps<CalendarViewProps>(), {
  events: () => [],
  schedules: () => [],
  projects: () => [],
  initialView: 'timeGridWeek',
  showFilters: true
})

// Emits
const emit = defineEmits<{
  'event-click': [event: CalendarEvent]
  'date-click': [date: Date]
  'event-create': [event: Partial<CalendarEvent>]
  'event-update': [event: CalendarEvent]
  'event-delete': [eventId: string]
  'navigate-schedule': [scheduleId: string]
}>()

// Router
const router = useRouter()

// Refs
const calendarRef = ref()
const showQuickCreateModal = ref(false)
const showEventDetailModal = ref(false)
const selectedEvent = ref<CalendarEvent | null>(null)
const selectedDate = ref<Date | null>(null)
const selectedTime = ref<string | null>(null)

// Estado
const currentView = ref<CalendarView>(props.initialView)
const currentDate = ref(new Date())
const filters = ref<CalendarFilters>({
  projects: [],
  categories: [],
  priorities: []
})

// Configuración de vistas
const calendarViews: CalendarViewConfig[] = [
  {
    type: 'dayGridMonth',
    label: 'Mes',
    icon: 'Calendar',
    description: 'Vista mensual'
  },
  {
    type: 'timeGridWeek',
    label: 'Semana',
    icon: 'Clock',
    description: 'Vista semanal'
  },
  {
    type: 'timeGridDay',
    label: 'Día',
    icon: 'Calendar',
    description: 'Vista diaria'
  },
  {
    type: 'listWeek',
    label: 'Lista',
    icon: 'List',
    description: 'Vista de lista'
  }
]

// Computed
const currentPeriodTitle = computed(() => {
  const date = currentDate.value
  const view = currentView.value
  
  if (view === 'dayGridMonth') {
    return date.toLocaleDateString('es-ES', { 
      month: 'long', 
      year: 'numeric' 
    })
  } else if (view === 'timeGridWeek') {
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay() + 1)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    
    return `${startOfWeek.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    })} - ${endOfWeek.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    })}`
  } else if (view === 'timeGridDay') {
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    })
  }
  
  return date.toLocaleDateString('es-ES')
})

const availableProjects = computed(() => props.projects.map(p => p.name))
const availableCategories = computed(() => {
  const categories = new Set<string>()
  props.events.forEach(event => {
    if (event.extendedProps?.category) {
      categories.add(event.extendedProps.category)
    }
  })
  return Array.from(categories)
})

const filteredEvents = computed(() => {
  let events = props.events

  if (filters.value.projects.length > 0) {
    events = events.filter(event => 
      event.extendedProps?.projectId && 
      filters.value.projects.includes(event.extendedProps.projectId)
    )
  }

  if (filters.value.categories.length > 0) {
    events = events.filter(event => 
      event.extendedProps?.category && 
      filters.value.categories.includes(event.extendedProps.category)
    )
  }

  if (filters.value.priorities.length > 0) {
    events = events.filter(event => 
      event.extendedProps?.priority && 
      filters.value.priorities.includes(event.extendedProps.priority)
    )
  }

  return events
})

// Configuración de FullCalendar
const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
  initialView: currentView.value,
  initialDate: currentDate.value,
  locale: 'es',
  headerToolbar: false as const, // Usamos nuestros propios controles
  height: 'auto',
  aspectRatio: 1.35,
  editable: true,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: true,
  weekends: true,
  events: filteredEvents.value,
  
  // Configuración de eventos
  eventClick: handleEventClick,
  dateClick: handleDateClick,
  select: handleDateSelect,
  eventDrop: handleEventDrop,
  eventResize: handleEventResize,
  
  // Configuración de selección
  selectConstraint: {
    start: '00:00',
    end: '24:00',
    dows: [0, 1, 2, 3, 4, 5, 6]
  },
  
  // Configuración de vista
  views: {
    dayGridMonth: {
      dayMaxEvents: 3,
      moreLinkClick: 'popover'
    },
    timeGridWeek: {
      slotMinTime: '06:00:00',
      slotMaxTime: '22:00:00',
      slotDuration: '00:30:00',
      slotLabelInterval: '01:00:00'
    },
    timeGridDay: {
      slotMinTime: '06:00:00',
      slotMaxTime: '22:00:00',
      slotDuration: '00:15:00',
      slotLabelInterval: '01:00:00'
    }
  },
  
  // Configuración de estilo
  eventClassNames: (arg: any) => {
    const classes = ['calendar-event']
    if (arg.event.extendedProps?.priority === 'alta') {
      classes.push('priority-high')
    } else if (arg.event.extendedProps?.priority === 'media') {
      classes.push('priority-medium')
    } else if (arg.event.extendedProps?.priority === 'baja') {
      classes.push('priority-low')
    }
    return classes
  },
  
  // Configuración de renderizado
  eventContent: (arg: any) => {
    return {
      html: `
        <div class="event-content">
          <div class="event-title">${arg.event.title}</div>
          ${arg.event.extendedProps?.location ? `<div class="event-location">${arg.event.extendedProps.location}</div>` : ''}
        </div>
      `
    }
  }
}))

// Métodos
const navigateDate = (direction: 'prev' | 'next') => {
  const calendarApi = calendarRef.value?.getApi()
  if (calendarApi) {
    if (direction === 'prev') {
      calendarApi.prev()
    } else {
      calendarApi.next()
    }
    currentDate.value = calendarApi.getDate()
  }
}

const goToToday = () => {
  const calendarApi = calendarRef.value?.getApi()
  if (calendarApi) {
    calendarApi.today()
    currentDate.value = calendarApi.getDate()
  }
}

const changeView = (view: CalendarView) => {
  currentView.value = view
  const calendarApi = calendarRef.value?.getApi()
  if (calendarApi) {
    calendarApi.changeView(view)
  }
}

const handleEventClick = (info: any) => {
  const event: CalendarEvent = {
    id: info.event.id,
    title: info.event.title,
    start: info.event.start,
    end: info.event.end,
    allDay: info.event.allDay,
    backgroundColor: info.event.backgroundColor,
    borderColor: info.event.borderColor,
    textColor: info.event.textColor,
    extendedProps: info.event.extendedProps
  }
  selectedEvent.value = event
  showEventDetailModal.value = true
  emit('event-click', event)
}

const handleDateClick = (info: any) => {
  selectedDate.value = info.date
  selectedTime.value = info.dateStr
  showQuickCreateModal.value = true
  emit('date-click', info.date)
}

const handleDateSelect = (info: any) => {
  selectedDate.value = info.start
  selectedTime.value = info.startStr
  showQuickCreateModal.value = true
}

const handleEventDrop = (info: any) => {
  const updatedEvent: CalendarEvent = {
    id: info.event.id,
    title: info.event.title,
    start: info.event.start,
    end: info.event.end,
    allDay: info.event.allDay,
    backgroundColor: info.event.backgroundColor,
    borderColor: info.event.borderColor,
    textColor: info.event.textColor,
    extendedProps: info.event.extendedProps
  }
  emit('event-update', updatedEvent)
}

const handleEventResize = (info: any) => {
  const updatedEvent: CalendarEvent = {
    id: info.event.id,
    title: info.event.title,
    start: info.event.start,
    end: info.event.end,
    allDay: info.event.allDay,
    backgroundColor: info.event.backgroundColor,
    borderColor: info.event.borderColor,
    textColor: info.event.textColor,
    extendedProps: info.event.extendedProps
  }
  emit('event-update', updatedEvent)
}

const handleCreateEvent = (eventData: Partial<CalendarEvent>) => {
  emit('event-create', eventData)
  showQuickCreateModal.value = false
}

const handleEditEvent = (event: CalendarEvent) => {
  emit('event-update', event)
  showEventDetailModal.value = false
}

const handleDeleteEvent = (eventId: string) => {
  emit('event-delete', eventId)
  showEventDetailModal.value = false
}

const navigateToSchedule = (scheduleId: string) => {
  emit('navigate-schedule', scheduleId)
  router.push(`/schedule/${scheduleId}`)
}

const updateFilters = (newFilters: CalendarFilters) => {
  filters.value = newFilters
}

// Watch para actualizar el calendario cuando cambian los eventos
watch(filteredEvents, () => {
  const calendarApi = calendarRef.value?.getApi()
  if (calendarApi) {
    calendarApi.refetchEvents()
  }
}, { deep: true })

// Lifecycle
onMounted(() => {
  // Configurar el calendario inicial
  const calendarApi = calendarRef.value?.getApi()
  if (calendarApi) {
    currentDate.value = calendarApi.getDate()
  }
})
</script>

<style scoped>
.calendar-container {
  @apply w-full;
}

.calendar-main {
  @apply min-h-[600px];
}

.calendar-component {
  @apply w-full;
}

/* Estilos personalizados para FullCalendar */
:deep(.fc) {
  @apply font-sans;
}

:deep(.fc-toolbar) {
  @apply hidden;
}

:deep(.fc-header-toolbar) {
  @apply hidden;
}

:deep(.fc-daygrid-day) {
  @apply hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors;
}

:deep(.fc-daygrid-day-number) {
  @apply text-gray-900 dark:text-white font-medium;
}

:deep(.fc-day-today) {
  @apply bg-blue-50 dark:bg-blue-900/20;
}

:deep(.fc-day-today .fc-daygrid-day-number) {
  @apply bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center;
}

:deep(.fc-event) {
  @apply cursor-pointer border-0 shadow-sm transition-all duration-200 hover:shadow-md;
}

:deep(.fc-event-main) {
  @apply p-1;
}

:deep(.event-content) {
  @apply text-xs;
}

:deep(.event-title) {
  @apply font-medium truncate;
}

:deep(.event-location) {
  @apply text-xs opacity-75 truncate;
}

:deep(.priority-high) {
  @apply border-l-4 border-l-red-500;
}

:deep(.priority-medium) {
  @apply border-l-4 border-l-orange-500;
}

:deep(.priority-low) {
  @apply border-l-4 border-l-green-500;
}

:deep(.fc-timegrid-slot) {
  @apply hover:bg-gray-50 dark:hover:bg-gray-700/50;
}

:deep(.fc-timegrid-now-indicator-line) {
  @apply border-red-500;
}

:deep(.fc-timegrid-now-indicator-arrow) {
  @apply border-red-500;
}

:deep(.fc-list-event) {
  @apply hover:bg-gray-50 dark:hover:bg-gray-700/50;
}

:deep(.fc-list-event-dot) {
  @apply border-0;
}

/* Responsive */
@media (max-width: 768px) {
  .calendar-header {
    @apply p-3;
  }
  
  :deep(.fc-toolbar-chunk) {
    @apply flex-col gap-2;
  }
  
  :deep(.fc-daygrid-day) {
    @apply min-h-[80px];
  }
}
</style> 