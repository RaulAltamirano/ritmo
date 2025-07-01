<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="isVisible"
        class="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        @click="handleBackdropClick"
        role="dialog"
        aria-modal="true"
        aria-labelledby="day-summary-title"
      >
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 transform scale-95 translate-y-4"
          enter-to-class="opacity-100 transform scale-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 transform scale-100 translate-y-0"
          leave-to-class="opacity-0 transform scale-95 translate-y-4"
        >
          <div 
            class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            @click.stop
          >
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                  <Trophy class="text-white" :size="20" />
                </div>
                <div>
                  <h2 
                    id="day-summary-title"
                    class="text-xl font-bold text-gray-900 dark:text-white"
                  >
                    Resumen del Día
                  </h2>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ formatDate(summary?.date) }}
                  </p>
                </div>
              </div>
              <button
                @click="closeModal"
                class="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Cerrar resumen"
              >
                <X :size="20" />
              </button>
            </div>

            <!-- Content -->
            <div class="p-6 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto">
              <!-- Estadísticas principales -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="text-center p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
                  <div class="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Clock class="text-white" :size="16" />
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Tiempo de Estudio</p>
                  <p class="text-lg font-bold text-primary-600 dark:text-primary-400">
                    {{ formatTime(summary?.totalStudyTime || 0) }}
                  </p>
                </div>

                <div class="text-center p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div class="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <CheckCircle class="text-white" :size="16" />
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Tareas Completadas</p>
                  <p class="text-lg font-bold text-green-600 dark:text-green-400">
                    {{ summary?.completedTasks || 0 }}/{{ summary?.totalTasks || 0 }}
                  </p>
                </div>

                <div class="text-center p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                  <div class="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <BarChart3 class="text-white" :size="16" />
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Productividad</p>
                  <p class="text-lg font-bold text-orange-600 dark:text-orange-400">
                    {{ summary?.productivity || 0 }}%
                  </p>
                </div>

                <div class="text-center p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Target class="text-white" :size="16" />
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Progreso</p>
                  <p class="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {{ getProgressPercentage() }}%
                  </p>
                </div>
              </div>

              <!-- Barra de progreso -->
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Progreso General</span>
                  <span class="text-sm text-gray-500 dark:text-gray-400">{{ getProgressPercentage() }}%</span>
                </div>
                <div class="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    class="h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-primary-500 to-primary-600"
                    :style="{ width: `${getProgressPercentage()}%` }"
                  ></div>
                </div>
              </div>

              <!-- Lista de tareas -->
              <div v-if="summary?.tasks && summary.tasks.length > 0" class="space-y-3">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Tareas del Día</h3>
                <div class="space-y-2">
                  <div 
                    v-for="(task, index) in summary.tasks"
                    :key="index"
                    class="flex items-center justify-between p-3 rounded-lg border"
                    :class="task.completed 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                      : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700'"
                  >
                    <div class="flex items-center gap-3">
                      <div 
                        class="w-2 h-2 rounded-full"
                        :class="task.completed ? 'bg-green-500' : 'bg-gray-400'"
                      ></div>
                      <div>
                        <p 
                          class="text-sm font-medium"
                          :class="task.completed 
                            ? 'text-green-700 dark:text-green-400' 
                            : 'text-gray-700 dark:text-gray-300'"
                        >
                          {{ task.name }}
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                          {{ getTaskTypeLabel(task.type) }}
                        </p>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-xs text-gray-500 dark:text-gray-400">
                        {{ formatTime(task.timeSpent) }}
                      </span>
                      <CheckCircle 
                        v-if="task.completed"
                        :size="16" 
                        class="text-green-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Mensaje motivacional -->
              <div class="p-4 rounded-xl bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border border-primary-200 dark:border-primary-800">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                    <Lightbulb class="text-white" :size="16" />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-primary-700 dark:text-primary-400">
                      {{ getMotivationalMessage() }}
                    </p>
                    <p class="text-xs text-primary-600 dark:text-primary-300 mt-1">
                      ¡Sigue así! Cada día es una oportunidad para mejorar.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <button
                @click="closeModal"
                class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Cerrar
              </button>
              <button
                @click="startNewDay"
                class="px-6 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Comenzar Nuevo Día
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  Trophy, 
  X, 
  Clock, 
  CheckCircle, 
  BarChart3, 
  Target, 
  Lightbulb 
} from 'lucide-vue-next'
import { useTimerStore } from '~/stores/timer'

interface DaySummary {
  date: string
  totalStudyTime: number
  completedTasks: number
  totalTasks: number
  productivity: number
  tasks: Array<{
    name: string
    completed: boolean
    timeSpent: number
    type: string
  }>
}

interface DaySummaryModalProps {
  summary?: DaySummary | null
}

const props = withDefaults(defineProps<DaySummaryModalProps>(), {
  summary: null
})

const emit = defineEmits<{
  close: []
  'start-new-day': []
}>()

const timerStore = useTimerStore()
const isVisible = ref(false)

// Computed
const summary = computed(() => props.summary || timerStore.currentDaySummary)

// Methods
const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Hoy'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${minutes}m`
}

const getProgressPercentage = (): number => {
  if (!summary.value || summary.value.totalTasks === 0) return 0
  return Math.round((summary.value.completedTasks / summary.value.totalTasks) * 100)
}

const getTaskTypeLabel = (type: string): string => {
  const typeMap: Record<string, string> = {
    'Sesión de Estudio': '📚 Estudio',
    'Ejercicio Práctico': '✏️ Ejercicio',
    'Evaluación': '📝 Evaluación',
    'Proyecto': '📁 Proyecto',
    'Tarea Académica': '📖 Tarea'
  }
  return typeMap[type] || type
}

const getMotivationalMessage = (): string => {
  if (!summary.value) return '¡Excelente trabajo hoy!'
  
  const productivity = summary.value.productivity
  const completedTasks = summary.value.completedTasks
  const totalTasks = summary.value.totalTasks
  
  if (productivity >= 90) {
    return '¡Increíble! Has tenido un día excepcionalmente productivo.'
  } else if (productivity >= 70) {
    return '¡Muy bien! Has logrado un gran progreso hoy.'
  } else if (completedTasks > 0) {
    return '¡Buen trabajo! Has completado tareas importantes.'
  } else {
    return '¡No te rindas! Mañana es una nueva oportunidad.'
  }
}

const handleBackdropClick = () => {
  closeModal()
}

const closeModal = () => {
  isVisible.value = false
  emit('close')
}

const startNewDay = () => {
  timerStore.startDay()
  closeModal()
  emit('start-new-day')
}

// Expose methods
defineExpose({
  show: () => {
    isVisible.value = true
  },
  hide: () => {
    isVisible.value = false
  }
})
</script>

<style scoped>
/* Scrollbar personalizado */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}

/* Modo oscuro */
.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(75, 85, 99, 0.5);
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(75, 85, 99, 0.7);
}
</style> 