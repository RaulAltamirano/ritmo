<template>
  <Teleport to="body">
    <div 
      v-if="isTimerVisible"
      class="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6"
      role="status"
      aria-live="polite"
      :aria-label="`Timer: ${formatTime(timeLeft)} restante`"
    >
      <!-- Timer flotante principal -->
      <div 
        class="group cursor-pointer"
        @click="toggleDetails"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
        @keydown.enter="toggleDetails"
        @keydown.space.prevent="toggleDetails"
        tabindex="0"
        role="button"
        :aria-expanded="showDetails"
        :aria-label="`Timer ${activeTask?.name}: ${formatTime(timeLeft)} restante. Click para ${showDetails ? 'ocultar' : 'mostrar'} detalles`"
      >
        <!-- Timer principal -->
        <div 
          class="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg transition-all duration-300 backdrop-blur-md border"
          :class="timerContainerClasses"
        >
          <!-- Icono de reloj con estado visual -->
          <div class="relative flex-shrink-0">
            <Clock 
              :size="20"
              class="transition-colors duration-200"
              :class="timerIconClasses"
              aria-hidden="true"
            />
            <!-- Indicador de estado crítico -->
            <div 
              v-if="timeLeft <= 300"
              class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"
              aria-hidden="true"
            ></div>
          </div>
          
          <!-- Información del timer -->
          <div class="flex flex-col min-w-0 flex-1">
            <span 
              class="text-xl font-mono font-bold transition-colors duration-200 leading-none"
              :class="timerTextClasses"
            >
              {{ formatTime(timeLeft) }}
            </span>
            <span 
              class="text-xs text-gray-500 dark:text-gray-400 font-medium truncate"
              :title="getTimeStatus()"
            >
              {{ getTimeStatus() }}
            </span>
          </div>

          <!-- Barra de progreso -->
          <div 
            v-if="totalTime"
            class="w-12 h-1.5 rounded-full overflow-hidden bg-gray-200/60 dark:bg-gray-600/60 flex-shrink-0"
            role="progressbar"
            :aria-valuenow="Math.round(((totalTime - timeLeft) / totalTime) * 100)"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-label="`${Math.round(((totalTime - timeLeft) / totalTime) * 100)}% completado`"
          >
            <div 
              class="h-full rounded-full transition-all duration-1000 ease-out"
              :class="progressBarClasses"
              :style="{ width: `${(timeLeft / totalTime) * 100}%` }"
            ></div>
          </div>

          <!-- Botones de acción rápida -->
          <div class="flex items-center gap-1 flex-shrink-0">
            <!-- Botón pausar/reanudar -->
            <button
              @click.stop="handlePause"
              class="p-2 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
              :class="pauseButtonClasses"
              :title="isPaused ? 'Reanudar timer' : 'Pausar timer'"
              :aria-label="isPaused ? 'Reanudar timer' : 'Pausar timer'"
            >
              <Pause v-if="!isPaused" :size="16" aria-hidden="true" />
              <Play v-else :size="16" aria-hidden="true" />
            </button>

            <!-- Botón reiniciar -->
            <button
              @click.stop="handleReset"
              class="p-2 rounded-xl text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
              title="Reiniciar timer"
              aria-label="Reiniciar timer"
            >
              <RotateCcw :size="16" aria-hidden="true" />
            </button>

            <!-- Botón cerrar -->
            <button
              @click.stop="handleClose"
              class="p-2 rounded-xl text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
              title="Cerrar timer"
              aria-label="Cerrar timer"
            >
              <X :size="16" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <!-- Tooltip en hover -->
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 transform translate-y-2"
        enter-to-class="opacity-100 transform translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 transform translate-y-0"
        leave-to-class="opacity-0 transform translate-y-2"
      >
        <div 
          v-if="isHovered && !showDetails"
          class="absolute bottom-full right-0 mb-3 z-10 bg-gray-900 dark:bg-gray-800 text-white dark:text-gray-200 text-sm rounded-xl px-3 py-2 shadow-lg whitespace-nowrap border border-gray-700 dark:border-gray-600"
          role="tooltip"
        >
          <div class="flex items-center gap-2">
            <Clock :size="12" aria-hidden="true" />
            <span class="font-medium">{{ getTimeStatus() }}</span>
          </div>
          <div class="mt-1 text-gray-300 dark:text-gray-400 text-xs">
            {{ getProgressText() }}
          </div>
          <div class="mt-1 text-gray-300 dark:text-gray-400 text-xs">
            Click para más detalles
          </div>
        </div>
      </Transition>

      <!-- Panel de detalles expandible -->
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 transform translate-y-2 scale-95"
        enter-to-class="opacity-100 transform translate-y-0 scale-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 transform translate-y-0 scale-100"
        leave-to-class="opacity-0 transform translate-y-2 scale-95"
      >
        <div 
          v-if="showDetails"
          class="absolute bottom-full right-0 mb-3 z-20 border rounded-xl shadow-xl p-4 min-w-80 backdrop-blur-sm"
          :class="detailsPanelClasses"
          role="dialog"
          aria-labelledby="timer-details-title"
          aria-describedby="timer-details-content"
        >
          <!-- Header del panel -->
          <div class="flex items-center justify-between mb-4">
            <h4 
              id="timer-details-title"
              class="font-semibold text-base"
              :class="detailsTextClasses"
            >
              Detalles del Timer
            </h4>
            <button 
              @click="showDetails = false"
              class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 rounded-lg p-1"
              :class="detailsFocusRingClasses"
              title="Cerrar detalles"
              aria-label="Cerrar detalles del timer"
            >
              <X :size="16" aria-hidden="true" />
            </button>
          </div>

          <!-- Contenido del panel -->
          <div 
            id="timer-details-content"
            class="space-y-4"
          >
            <!-- Información de la tarea -->
            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <BookOpen :size="16" class="text-primary-600 dark:text-primary-400" aria-hidden="true" />
                <h5 class="font-medium text-sm" :class="detailsTextClasses">
                  Tarea Actual
                </h5>
              </div>
              <div class="pl-6">
                <p class="text-sm font-medium" :class="detailsTextClasses">
                  {{ activeTask?.name }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {{ getTaskType() }}
                </p>
                <p v-if="activeTask?.startedAt" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Iniciado: {{ formatStartTime() }}
                </p>
              </div>
            </div>

            <!-- Estado del timer -->
            <div class="flex items-center justify-between p-3 rounded-lg"
                 :class="statusContainerClasses">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full" :class="statusDotClasses"></div>
                <span class="text-sm font-medium" :class="statusTextClasses">
                  {{ getTimeStatus() }}
                </span>
              </div>
              <span class="text-xs font-mono" :class="statusTextClasses">
                {{ formatTime(timeLeft) }}
              </span>
            </div>

            <!-- Métricas de estudio -->
            <div class="grid grid-cols-2 gap-3">
              <!-- Tiempo total -->
              <div class="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <p class="text-xs text-gray-500 dark:text-gray-400">Tiempo Total</p>
                <p class="text-lg font-mono font-bold" :class="detailsTextClasses">
                  {{ formatTime(totalTime || 0) }}
                </p>
              </div>

              <!-- Progreso -->
              <div class="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <p class="text-xs text-gray-500 dark:text-gray-400">Progreso</p>
                <p class="text-lg font-mono font-bold" :class="detailsTextClasses">
                  {{ totalTime ? Math.round(((totalTime - timeLeft) / totalTime) * 100) : 0 }}%
                </p>
              </div>
            </div>

            <!-- Barra de progreso detallada -->
            <div v-if="totalTime" class="space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span class="text-gray-500 dark:text-gray-400">Progreso de estudio</span>
                <span class="font-medium" :class="detailsTextClasses">
                  {{ formatTime(totalTime - timeLeft) }} / {{ formatTime(totalTime) }}
                </span>
              </div>
              <div 
                class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
                role="progressbar"
                :aria-valuenow="Math.round(((totalTime - timeLeft) / totalTime) * 100)"
                aria-valuemin="0"
                aria-valuemax="100"
              >
                <div 
                  class="h-full rounded-full transition-all duration-1000 ease-out"
                  :class="progressBarClasses"
                  :style="{ width: `${((totalTime - timeLeft) / totalTime) * 100}%` }"
                ></div>
              </div>
            </div>

            <!-- Consejos de estudio -->
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <Lightbulb :size="16" class="text-orange-500 dark:text-orange-400" aria-hidden="true" />
                <span class="text-sm font-medium" :class="detailsTextClasses">
                  Consejo de Estudio
                </span>
              </div>
              <p class="text-xs text-gray-600 dark:text-gray-300 pl-6">
                {{ getStudyTip() }}
              </p>
            </div>

            <!-- Tiempo transcurrido -->
            <div v-if="totalTime" class="flex items-center justify-between text-sm">
              <span class="text-gray-500 dark:text-gray-400">Tiempo transcurrido:</span>
              <span class="font-mono font-bold" :class="detailsTextClasses">
                {{ formatTime(totalTime - timeLeft) }}
              </span>
            </div>
          </div>

          <!-- Acciones -->
          <div class="mt-4 pt-3 border-t flex gap-2"
               :class="detailsBorderClasses">
            <button 
              class="flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
              :class="primaryButtonClasses"
              @click="handlePause"
            >
              {{ isPaused ? 'Reanudar' : 'Pausar' }}
            </button>
            <button 
              class="px-3 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
              :class="secondaryButtonClasses"
              @click="handleReset"
            >
              Reiniciar
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Clock, X, Pause, Play, RotateCcw, BookOpen, Lightbulb } from 'lucide-vue-next'
import { useTimerStore } from '../../stores/timer'

const timerStore = useTimerStore()

// Estado local
const showDetails = ref(false)
const isHovered = ref(false)

// Computed properties del store
const activeTask = computed(() => timerStore.activeTask)
const timeLeft = computed(() => timerStore.activeTask?.timeLeft || 0)
const totalTime = computed(() => timerStore.activeTask?.totalTime || 0)
const isPaused = computed(() => timerStore.isPaused)
const isRunning = computed(() => timerStore.isRunning)
const isTimerVisible = computed(() => timerStore.isTimerVisible)
const progressPercentage = computed(() => timerStore.getProgressPercentage)
const elapsedTime = computed(() => timerStore.getElapsedTime)

// Clases dinámicas basadas en la paleta de colores del proyecto
const timerContainerClasses = computed(() => [
  // Base styles - ajustado para modo oscuro
  'bg-white/95 dark:bg-gray-800/95 border-gray-200/60 dark:border-gray-700/60',
  // Estados de tiempo usando la paleta del proyecto
  timeLeft.value <= 300 
    ? 'border-red-300/60 dark:border-red-500/40 bg-red-50/95 dark:bg-red-900/20 animate-pulse shadow-red-200/50 dark:shadow-red-900/30' 
    : timeLeft.value <= 600 
      ? 'border-orange-300/60 dark:border-orange-500/40 bg-orange-50/95 dark:bg-orange-900/20 shadow-orange-200/50 dark:shadow-orange-900/30'
      : 'hover:border-primary-300/60 dark:hover:border-primary-600/60 shadow-primary-200/50 dark:shadow-primary-900/30'
])

const timerIconClasses = computed(() => ({
  'text-red-500 dark:text-red-400': timeLeft.value <= 300,
  'text-orange-500 dark:text-orange-400': timeLeft.value > 300 && timeLeft.value <= 600,
  'text-primary-600 dark:text-primary-400': timeLeft.value > 600
}))

const timerTextClasses = computed(() => ({
  'text-red-600 dark:text-red-400': timeLeft.value <= 300,
  'text-orange-600 dark:text-orange-400': timeLeft.value > 300 && timeLeft.value <= 600,
  'text-gray-700 dark:text-gray-300': timeLeft.value > 600
}))

const progressBarClasses = computed(() => ({
  'bg-red-400 dark:bg-red-500': timeLeft.value <= 300,
  'bg-orange-400 dark:bg-orange-500': timeLeft.value > 300 && timeLeft.value <= 600,
  'bg-primary-400 dark:bg-primary-500': timeLeft.value > 600
}))

const pauseButtonClasses = computed(() => [
  'focus:ring-offset-white dark:focus:ring-offset-gray-800',
  timeLeft.value <= 300
    ? 'text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 focus:ring-red-500'
    : timeLeft.value <= 600
      ? 'text-orange-500 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 focus:ring-orange-500'
      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-gray-400'
])

// Clases para el panel de detalles
const detailsPanelClasses = computed(() => [
  'bg-white/95 dark:bg-gray-800/95',
  'border-gray-200/60 dark:border-gray-700/60',
  'shadow-gray-200/50 dark:shadow-gray-900/50'
])

const detailsTextClasses = computed(() => 'text-gray-900 dark:text-white')

const detailsFocusRingClasses = computed(() => 'focus:ring-offset-white dark:focus:ring-offset-gray-800')

const detailsBorderClasses = computed(() => 'border-gray-200 dark:border-gray-700')

const statusContainerClasses = computed(() => ({
  'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800': timeLeft.value <= 300,
  'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800': timeLeft.value > 300 && timeLeft.value <= 600,
  'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800': timeLeft.value > 600
}))

const statusDotClasses = computed(() => ({
  'bg-red-500': timeLeft.value <= 300,
  'bg-orange-500': timeLeft.value > 300 && timeLeft.value <= 600,
  'bg-green-500': timeLeft.value > 600
}))

const statusTextClasses = computed(() => ({
  'text-red-700 dark:text-red-400': timeLeft.value <= 300,
  'text-orange-700 dark:text-orange-400': timeLeft.value > 300 && timeLeft.value <= 600,
  'text-green-700 dark:text-green-400': timeLeft.value > 600
}))

const primaryButtonClasses = computed(() => [
  'bg-primary-600 dark:bg-primary-600 text-white',
  'hover:bg-primary-700 dark:hover:bg-primary-700',
  'focus:ring-primary-500 focus:ring-offset-white dark:focus:ring-offset-gray-800'
])

const secondaryButtonClasses = computed(() => [
  'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
  'hover:bg-gray-200 dark:hover:bg-gray-600',
  'focus:ring-gray-400 focus:ring-offset-white dark:focus:ring-offset-gray-800'
])

// Formatear tiempo en formato MM:SS
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

// Obtener estado del tiempo
const getTimeStatus = (): string => {
  if (timeLeft.value <= 300) return 'Crítico'
  if (timeLeft.value <= 600) return 'Atención'
  return 'Normal'
}

// Obtener texto de progreso
const getProgressText = (): string => {
  if (!totalTime.value) return 'Timer en progreso'
  const progress = Math.round(((totalTime.value - timeLeft.value) / totalTime.value) * 100)
  return `${progress}% completado`
}

// Obtener tipo de tarea
const getTaskType = (): string => {
  const taskName = activeTask.value?.name.toLowerCase() || ''
  if (taskName.includes('estudiar') || taskName.includes('leer') || taskName.includes('repasar')) {
    return 'Sesión de Estudio'
  } else if (taskName.includes('ejercicio') || taskName.includes('práctica')) {
    return 'Ejercicio Práctico'
  } else if (taskName.includes('examen') || taskName.includes('prueba')) {
    return 'Evaluación'
  } else if (taskName.includes('proyecto') || taskName.includes('trabajo')) {
    return 'Proyecto'
  }
  return 'Tarea Académica'
}

// Obtener consejo de estudio
const getStudyTip = (): string => {
  if (timeLeft.value <= 300) {
    return '¡Tiempo crítico! Enfócate en los puntos más importantes y haz un resumen rápido.'
  } else if (timeLeft.value <= 600) {
    return 'Mantén el ritmo. Es buen momento para hacer una pausa breve y revisar lo aprendido.'
  } else {
    return 'Excelente progreso. Continúa con el mismo enfoque y aprovecha el tiempo restante.'
  }
}

// Handlers
const toggleDetails = () => {
  showDetails.value = !showDetails.value
}

const handlePause = () => {
  if (timerStore.isPaused) {
    timerStore.resumeTimer()
  } else {
    timerStore.pauseTimer()
  }
}

const handleReset = () => {
  timerStore.resetTimer()
}

const handleClose = () => {
  timerStore.closeTimer()
}

// Formatear tiempo de inicio
const formatStartTime = (): string => {
  if (!activeTask.value?.startedAt) return ''
  const startedAt = new Date(activeTask.value.startedAt)
  return startedAt.toLocaleTimeString()
}
</script>

<style scoped>
/* Animación suave para el pulso */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.animate-pulse {
  animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Mejoras para backdrop blur */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

/* Focus styles mejorados */
.focus\:ring-offset-2:focus {
  --tw-ring-offset-width: 2px;
}

/* Transiciones suaves */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Responsive improvements */
@media (max-width: 640px) {
  .min-w-80 {
    min-width: 20rem;
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .animate-pulse,
  .transition-all {
    animation: none;
    transition: none;
  }
}

/* Mejoras para modo oscuro */
@media (prefers-color-scheme: dark) {
  .backdrop-blur-sm {
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }
}
</style> 