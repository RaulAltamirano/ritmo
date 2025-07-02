<template>
  <div 
    v-if="modelValue && event"
    class="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    @click="closeModal"
  >
    <div 
      class="w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700"
      @click.stop
    >
      <!-- Header -->
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div class="flex-1 min-w-0">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {{ event.title }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {{ eventDateLabel }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <BaseButton
              variant="ghost"
              size="sm"
              @click="editEvent"
              aria-label="Editar evento"
            >
              <Edit :size="16" />
            </BaseButton>
            <button
              @click="closeModal"
              class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 flex items-center justify-center transition-all duration-200"
              aria-label="Cerrar modal"
            >
              <X :size="16" />
            </button>
          </div>
        </div>
      </div>

      <!-- Contenido -->
      <div class="p-6 space-y-4">
        <!-- Información básica -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Inicio
            </label>
            <p class="text-sm text-gray-900 dark:text-white">
              {{ formatDateTime(event.start) }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fin
            </label>
            <p class="text-sm text-gray-900 dark:text-white">
              {{ formatDateTime(event.end) }}
            </p>
          </div>
        </div>

        <!-- Proyecto -->
        <div v-if="event.extendedProps?.projectId">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Proyecto
          </label>
          <p class="text-sm text-gray-900 dark:text-white">
            {{ getProjectName(event.extendedProps.projectId) }}
          </p>
        </div>

        <!-- Categoría -->
        <div v-if="event.extendedProps?.category">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Categoría
          </label>
          <span 
            :class="[
              'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
              getCategoryColor(event.extendedProps.category)
            ]"
          >
            {{ event.extendedProps.category }}
          </span>
        </div>

        <!-- Prioridad -->
        <div v-if="event.extendedProps?.priority">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Prioridad
          </label>
          <span 
            :class="[
              'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
              getPriorityColor(event.extendedProps.priority)
            ]"
          >
            {{ getPriorityLabel(event.extendedProps.priority) }}
          </span>
        </div>

        <!-- Descripción -->
        <div v-if="event.extendedProps?.description">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Descripción
          </label>
          <p class="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
            {{ event.extendedProps.description }}
          </p>
        </div>

        <!-- Ubicación -->
        <div v-if="event.extendedProps?.location">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Ubicación
          </label>
          <p class="text-sm text-gray-900 dark:text-white">
            {{ event.extendedProps.location }}
          </p>
        </div>

        <!-- Tareas relacionadas -->
        <div v-if="event.extendedProps?.taskIds && event.extendedProps.taskIds.length > 0">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tareas relacionadas
          </label>
          <div class="space-y-2">
            <div 
              v-for="taskId in event.extendedProps.taskIds" 
              :key="taskId"
              class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <span class="text-sm text-gray-900 dark:text-white">
                {{ getTaskName(taskId) }}
              </span>
              <BaseButton
                variant="ghost"
                size="xs"
                @click="viewTask(taskId)"
                aria-label="Ver tarea"
              >
                <ExternalLink :size="14" />
              </BaseButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Acciones -->
      <div class="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center gap-3">
        <BaseButton
          variant="outline"
          @click="closeModal"
          class="flex-1"
        >
          Cerrar
        </BaseButton>
        
        <BaseButton
          variant="primary"
          @click="navigateToSchedule"
          class="flex-1"
          v-if="event.extendedProps?.projectId"
        >
          <Calendar :size="16" class="mr-2" />
          Ver horario
        </BaseButton>
        
        <BaseButton
          variant="destructive"
          @click="deleteEvent"
          class="flex-1"
        >
          <Trash2 :size="16" class="mr-2" />
          Eliminar
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { X, Edit, ExternalLink, Calendar, Trash2 } from 'lucide-vue-next'
import type { CalendarEvent, Project, Task } from '~/types/calendar'
import BaseButton from '~/components/atoms/BaseButton.vue'

interface EventDetailModalProps {
  modelValue: boolean
  event: CalendarEvent | null
  projects?: Project[]
  tasks?: Task[]
}

const props = withDefaults(defineProps<EventDetailModalProps>(), {
  projects: () => [],
  tasks: () => []
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'edit-event': [event: CalendarEvent]
  'delete-event': [eventId: string]
  'navigate-schedule': [scheduleId: string]
  'view-task': [taskId: string]
}>()

// Computed
const eventDateLabel = computed(() => {
  if (!props.event) return ''
  
  const start = props.event.start
  const end = props.event.end
  
  if (props.event.allDay) {
    if (start.toDateString() === end.toDateString()) {
      return start.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } else {
      return `${start.toLocaleDateString('es-ES')} - ${end.toLocaleDateString('es-ES')}`
    }
  } else {
    return `${start.toLocaleDateString('es-ES')} ${start.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })} - ${end.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`
  }
})

// Métodos
const closeModal = () => {
  emit('update:modelValue', false)
}

const editEvent = () => {
  if (props.event) {
    emit('edit-event', props.event)
  }
}

const deleteEvent = () => {
  if (props.event) {
    emit('delete-event', props.event.id)
  }
}

const navigateToSchedule = () => {
  if (props.event?.extendedProps?.projectId) {
    emit('navigate-schedule', props.event.extendedProps.projectId)
  }
}

const viewTask = (taskId: string) => {
  emit('view-task', taskId)
}

const formatDateTime = (date: Date): string => {
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getProjectName = (projectId: string): string => {
  const project = props.projects.find(p => p.id === projectId)
  return project?.name || 'Proyecto desconocido'
}

const getTaskName = (taskId: string): string => {
  const task = props.tasks.find(t => t.id === taskId)
  return task?.name || task?.title || 'Tarea desconocida'
}

const getCategoryColor = (category: string): string => {
  const colors = {
    'Trabajo': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
    'Estudio': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
    'Personal': 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200',
    'Reunión': 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200',
    'Proyecto': 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200'
  }
  return colors[category as keyof typeof colors] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
}

const getPriorityColor = (priority: string): string => {
  const colors = {
    'alta': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
    'media': 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200',
    'baja': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
  }
  return colors[priority as keyof typeof colors] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
}

const getPriorityLabel = (priority: string): string => {
  const labels = {
    'alta': 'Alta',
    'media': 'Media',
    'baja': 'Baja'
  }
  return labels[priority as keyof typeof labels] || priority
}
</script> 