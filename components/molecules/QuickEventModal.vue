<template>
  <div 
    v-if="modelValue"
    class="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    @click="closeModal"
  >
    <div 
      class="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700"
      @click.stop
    >
      <!-- Header -->
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Crear evento
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {{ selectedDateLabel }}
            </p>
          </div>
          <button
            @click="closeModal"
            class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 flex items-center justify-center transition-all duration-200"
            aria-label="Cerrar modal"
          >
            <X :size="16" />
          </button>
        </div>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="createEvent" class="p-6 space-y-4">
        <!-- Título -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Título *
          </label>
          <input
            v-model="formData.title"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            placeholder="Nombre del evento"
            aria-label="Título del evento"
          />
        </div>

        <!-- Fecha y hora -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha
            </label>
            <input
              v-model="formData.date"
              type="date"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              aria-label="Fecha del evento"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hora
            </label>
            <input
              v-model="formData.time"
              type="time"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              aria-label="Hora del evento"
            />
          </div>
        </div>

        <!-- Duración -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Duración
          </label>
          <select
            v-model="formData.duration"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            aria-label="Duración del evento"
          >
            <option value="30">30 minutos</option>
            <option value="60">1 hora</option>
            <option value="90">1.5 horas</option>
            <option value="120">2 horas</option>
            <option value="180">3 horas</option>
            <option value="240">4 horas</option>
            <option value="all-day">Todo el día</option>
          </select>
        </div>

        <!-- Proyecto -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Proyecto
          </label>
          <select
            v-model="formData.projectId"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            aria-label="Proyecto del evento"
          >
            <option value="">Sin proyecto</option>
            <option 
              v-for="project in availableProjects" 
              :key="project.id"
              :value="project.id"
            >
              {{ project.name }}
            </option>
          </select>
        </div>

        <!-- Categoría -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Categoría
          </label>
          <select
            v-model="formData.category"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            aria-label="Categoría del evento"
          >
            <option value="">Sin categoría</option>
            <option value="Trabajo">Trabajo</option>
            <option value="Estudio">Estudio</option>
            <option value="Personal">Personal</option>
            <option value="Reunión">Reunión</option>
            <option value="Proyecto">Proyecto</option>
          </select>
        </div>

        <!-- Prioridad -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Prioridad
          </label>
          <div class="flex items-center gap-3">
            <label 
              v-for="priority in priorities" 
              :key="priority.value"
              class="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="radio"
                :value="priority.value"
                v-model="formData.priority"
                class="priority-radio"
                :aria-label="`Prioridad ${priority.label}`"
              />
              <span 
                :class="[
                  'priority-badge',
                  priority.color
                ]"
              >
                {{ priority.label }}
              </span>
            </label>
          </div>
        </div>

        <!-- Descripción -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Descripción
          </label>
          <textarea
            v-model="formData.description"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
            placeholder="Descripción opcional del evento"
            aria-label="Descripción del evento"
          ></textarea>
        </div>

        <!-- Acciones -->
        <div class="flex items-center gap-3 pt-4">
          <BaseButton
            variant="outline"
            type="button"
            @click="closeModal"
            class="flex-1"
          >
            Cancelar
          </BaseButton>
          
          <BaseButton
            variant="primary"
            type="submit"
            class="flex-1"
            :disabled="!formData.title"
          >
            Crear evento
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { X } from 'lucide-vue-next'
import type { CalendarEvent, Project } from '~/types/calendar'
import BaseButton from '~/components/atoms/BaseButton.vue'

interface QuickEventModalProps {
  modelValue: boolean
  selectedDate?: Date | null
  selectedTime?: string | null
  availableProjects?: Project[]
}

const props = withDefaults(defineProps<QuickEventModalProps>(), {
  selectedDate: null,
  selectedTime: null,
  availableProjects: () => []
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'create-event': [event: Partial<CalendarEvent>]
}>()

// Estado del formulario
const formData = ref({
  title: '',
  date: '',
  time: '',
  duration: '60',
  projectId: '',
  category: '',
  priority: 'media',
  description: ''
})

// Configuración de prioridades
const priorities = [
  { value: 'alta', label: 'Alta', color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' },
  { value: 'media', label: 'Media', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200' },
  { value: 'baja', label: 'Baja', color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' }
]

// Computed
const selectedDateLabel = computed(() => {
  if (!props.selectedDate) return 'Selecciona una fecha'
  
  const date = props.selectedDate
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

// Métodos
const closeModal = () => {
  emit('update:modelValue', false)
  resetForm()
}

const resetForm = () => {
  formData.value = {
    title: '',
    date: '',
    time: '',
    duration: '60',
    projectId: '',
    category: '',
    priority: 'media',
    description: ''
  }
}

const createEvent = () => {
  if (!formData.value.title) return

  const startDate = new Date(`${formData.value.date}T${formData.value.time}`)
  const endDate = new Date(startDate)
  
  if (formData.value.duration === 'all-day') {
    endDate.setDate(startDate.getDate() + 1)
  } else {
    endDate.setMinutes(startDate.getMinutes() + parseInt(formData.value.duration))
  }

  const event: Partial<CalendarEvent> = {
    title: formData.value.title,
    start: startDate,
    end: endDate,
    allDay: formData.value.duration === 'all-day',
    extendedProps: {
      description: formData.value.description,
      projectId: formData.value.projectId || undefined,
      category: formData.value.category || undefined,
      priority: formData.value.priority as 'alta' | 'media' | 'baja'
    }
  }

  emit('create-event', event)
  closeModal()
}

// Watch para inicializar el formulario con la fecha seleccionada
watch(() => props.selectedDate, (newDate) => {
  if (newDate) {
    formData.value.date = newDate.toISOString().split('T')[0]
  }
}, { immediate: true })

watch(() => props.selectedTime, (newTime) => {
  if (newTime) {
    formData.value.time = newTime
  }
}, { immediate: true })
</script>

<style scoped>
.priority-radio {
  @apply w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600;
}

.priority-badge {
  @apply px-2 py-1 text-xs font-medium rounded-full;
}
</style> 