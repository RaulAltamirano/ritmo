<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Page Header -->
    <PageHeader
      title="Schedule"
      subtitle="Organize and manage your schedule efficiently"
      :actions="true"
    >
      <template #actions>
        <BaseButton
          variant="primary"
          class="flex items-center space-x-2"
          @click="showQuickCreateModal = true"
        >
          <Plus :size="16" />
          <span>New Event</span>
        </BaseButton>
      </template>
    </PageHeader>

    <!-- Main Calendar View -->
    <CalendarViewComponent
      :events="calendarEvents"
      :schedules="schedules"
      :projects="projects"
      :initial-view="currentView"
      :show-filters="false"
      @event-click="handleEventClick"
      @date-click="handleDateClick"
      @event-create="handleCreateEvent"
      @event-update="handleUpdateEvent"
      @event-delete="handleDeleteEvent"
      @navigate-schedule="navigateToSchedule"
    />

    <!-- Quick Create Modal -->
    <QuickEventModal
      v-model="showQuickCreateModal"
      :selected-date="selectedDate"
      :selected-time="selectedTime"
      :available-projects="projects"
      @create-event="handleCreateEvent"
    />

    <!-- Event Detail Modal -->
    <EventDetailModal
      v-model="showEventDetailModal"
      :event="selectedEvent"
      :projects="projects"
      :tasks="tasks"
      @edit-event="handleEditEvent"
      @delete-event="handleDeleteEvent"
      @navigate-schedule="navigateToSchedule"
      @view-task="handleViewTask"
    />

    <!-- Edit Event Modal -->
    <QuickEventModal
      v-model="showEditModal"
      :selected-date="selectedDate"
      :selected-time="selectedTime"
      :available-projects="projects"
      @create-event="handleUpdateEvent"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus } from 'lucide-vue-next'
import type { CalendarEvent, Schedule, Project, Task, CalendarView } from '~/types/calendar'
import BaseButton from '~/components/atoms/BaseButton.vue'
import PageHeader from '~/components/molecules/PageHeader.vue'
import CalendarViewComponent from '~/components/organisms/CalendarView.vue'
import QuickEventModal from '~/components/molecules/QuickEventModal.vue'
import EventDetailModal from '~/components/molecules/EventDetailModal.vue'

// Page meta
useHead({
  title: 'Schedule',
  meta: [
    { name: 'description', content: 'Organize and manage your schedule efficiently with the smart calendar.' }
  ]
})

definePageMeta({
  layout: 'default'
})

const router = useRouter()

// State
const currentView = ref<CalendarView>('timeGridWeek')
const showQuickCreateModal = ref(false)
const showEventDetailModal = ref(false)
const showEditModal = ref(false)
const selectedEvent = ref<CalendarEvent | null>(null)
const selectedDate = ref<Date | null>(null)
const selectedTime = ref<string | null>(null)

// Sample data
const calendarEvents = ref<CalendarEvent[]>([])
const schedules = ref<Schedule[]>([])
const projects = ref<Project[]>([])
const tasks = ref<Task[]>([])

// Methods
const handleEventClick = (event: CalendarEvent) => {
  selectedEvent.value = event
  showEventDetailModal.value = true
}

const handleDateClick = (date: Date) => {
  selectedDate.value = date
  selectedTime.value = date.toTimeString().slice(0, 5)
  showQuickCreateModal.value = true
}

const handleCreateEvent = (eventData: Partial<CalendarEvent>) => {
  const newEvent: CalendarEvent = {
    id: Date.now().toString(),
    title: eventData.title || 'New Event',
    start: eventData.start || new Date(),
    end: eventData.end || new Date(),
    allDay: eventData.allDay || false,
    backgroundColor: getEventColor(eventData.extendedProps?.category),
    borderColor: getEventColor(eventData.extendedProps?.category),
    textColor: '#ffffff',
    extendedProps: eventData.extendedProps || {}
  }
  calendarEvents.value.push(newEvent)
  showQuickCreateModal.value = false
}

const handleUpdateEvent = (eventData: Partial<CalendarEvent>) => {
  if (selectedEvent.value) {
    const index = calendarEvents.value.findIndex(e => e.id === selectedEvent.value!.id)
    if (index > -1) {
      calendarEvents.value[index] = {
        ...calendarEvents.value[index],
        ...eventData,
        backgroundColor: getEventColor(eventData.extendedProps?.category),
        borderColor: getEventColor(eventData.extendedProps?.category)
      }
    }
  }
  showEditModal.value = false
  showEventDetailModal.value = false
}

const handleDeleteEvent = (eventId: string) => {
  calendarEvents.value = calendarEvents.value.filter(e => e.id !== eventId)
  showEventDetailModal.value = false
}

const handleEditEvent = (event: CalendarEvent) => {
  selectedEvent.value = event
  selectedDate.value = event.start
  selectedTime.value = event.start.toTimeString().slice(0, 5)
  showEditModal.value = true
  showEventDetailModal.value = false
}

const navigateToSchedule = (scheduleId: string) => {
  router.push(`/schedule/${scheduleId}`)
}

const handleViewTask = (taskId: string) => {
  router.push(`/tasks/${taskId}`)
}

const getEventColor = (category?: string): string => {
  const colors = {
    'Work': '#3B82F6',
    'Study': '#10B981',
    'Personal': '#8B5CF6',
    'Meeting': '#F59E0B',
    'Project': '#6366F1'
  }
  return colors[category as keyof typeof colors] || '#6B7280'
}

// Load sample data
onMounted(() => {
  projects.value = [
    {
      id: '1',
      name: 'Web Project',
      description: 'Web application development',
      color: '#3B82F6',
      icon: 'Globe',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'Studies',
      description: 'Courses and certifications',
      color: '#10B981',
      icon: 'GraduationCap',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      name: 'Personal',
      description: 'Personal tasks',
      color: '#8B5CF6',
      icon: 'User',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]

  const now = new Date()
  calendarEvents.value = [
    {
      id: '1',
      title: 'Project Meeting',
      start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0),
      end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0),
      allDay: false,
      backgroundColor: '#3B82F6',
      borderColor: '#3B82F6',
      textColor: '#ffffff',
      extendedProps: {
        description: 'Weekly team meeting',
        projectId: '1',
        category: 'Meeting',
        priority: 'high',
        location: 'Conference Room'
      }
    },
    {
      id: '2',
      title: 'Study React',
      start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0),
      end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 0),
      allDay: false,
      backgroundColor: '#10B981',
      borderColor: '#10B981',
      textColor: '#ffffff',
      extendedProps: {
        description: 'Review advanced React concepts',
        projectId: '2',
        category: 'Study',
        priority: 'medium'
      }
    },
    {
      id: '3',
      title: 'Exercise',
      start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0),
      end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 19, 0),
      allDay: false,
      backgroundColor: '#8B5CF6',
      borderColor: '#8B5CF6',
      textColor: '#ffffff',
      extendedProps: {
        description: 'Workout routine',
        category: 'Personal',
        priority: 'low'
      }
    }
  ]

  tasks.value = [
    {
      id: '1',
      name: 'Review documentation',
      title: 'Review documentation',
      createdAt: new Date(),
      category: 'Work',
      priority: 'high',
      completed: false,
      projectId: '1',
      scheduleId: '1'
    },
    {
      id: '2',
      name: 'Complete React course',
      title: 'Complete React course',
      createdAt: new Date(),
      category: 'Study',
      priority: 'medium',
      completed: false,
      projectId: '2',
      scheduleId: '2'
    }
  ]
})
</script> 