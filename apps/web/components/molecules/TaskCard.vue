<template>
  <BaseCard :variant="getCardVariant()" :class="getCardClasses()" :padding="'sm'" class="sm:p-4">
    <div class="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
      <!-- Contenido principal -->
      <div class="flex-1 min-w-0">
        <div class="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
          <h3 :class="[
            'text-base font-medium truncate',
            task.completed
              ? 'text-green-700 dark:text-green-300 line-through'
              : 'text-gray-900 dark:text-white',
          ]">
            {{ task.title }}
          </h3>
          <div class="flex flex-wrap gap-2">
            <span v-if="task.category" :class="[
              'px-3 py-1 rounded-full text-xs font-medium',
              getCategoryColor(task.category),
            ]">
              {{ task.category }}
            </span>
            <!-- Indicador de notas mejorado -->
            <div v-if="task.hasNotes || task.notes"
              class="flex items-center space-x-1 px-2 py-1 rounded-full bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30">
              <svg class="w-3 h-3 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clip-rule="evenodd" />
              </svg>
              <span class="text-xs font-medium text-yellow-700 dark:text-yellow-300">Notas</span>
            </div>
          </div>
        </div>

        <div
          class="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-sm text-gray-500 dark:text-gray-400">
          <div class="flex items-center space-x-2">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clip-rule="evenodd" />
            </svg>
            <span>{{ task.duration }}</span>
          </div>
          <!-- Tiempo acumulado -->
          <div v-if="task.totalTimeSpent" class="flex items-center space-x-1">
            <span class="hidden sm:inline">•</span>
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clip-rule="evenodd" />
            </svg>
            <span>{{ formatAccumulatedTime(task.totalTimeSpent) }}</span>
          </div>
          <div v-if="task.priority" class="flex items-center space-x-2">
            <span class="hidden sm:inline">•</span>
            <span :class="[
              'capitalize font-medium',
              task.priority === 'alta' && 'text-red-600 dark:text-red-400',
              task.priority === 'media' && 'text-orange-600 dark:text-orange-400',
              task.priority === 'baja' && 'text-green-600 dark:text-green-400',
            ]">
              {{ task.priority }}
            </span>
          </div>
        </div>
      </div>

      <!-- Controles del cronómetro optimizados -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
        <!-- Timer activo con diseño mejorado -->
        <div v-if="task.isRunning"
          class="bg-purple-50 dark:bg-purple-900/20 px-4 py-3 sm:py-2 rounded-lg border border-purple-100 dark:border-purple-800/30 text-center">
          <span class="text-lg font-mono font-bold text-purple-700 dark:text-purple-300">
            {{ formatTime(task.timeRemaining || 0) }}
          </span>
        </div>

        <!-- Controles principales intuitivos -->
        <div class="flex items-center justify-center sm:justify-end space-x-2">
          <!-- Botón principal de control (Play/Pause) -->
          <button v-if="!task.completed" @click="$emit('start-timer')" :class="[
            'w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm border',
            task.isRunning
              ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800/30 hover:bg-orange-200 dark:hover:bg-orange-900/50'
              : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800/30 hover:bg-green-200 dark:hover:bg-green-900/50',
          ]" :aria-label="task.isRunning ? 'Pausar tarea' : 'Iniciar tarea'">
            <svg v-if="task.isRunning" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                clip-rule="evenodd" />
            </svg>
            <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clip-rule="evenodd" />
            </svg>
          </button>

          <!-- Botón de completar -->
          <button v-if="!task.completed" @click="$emit('toggle-complete')"
            class="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-green-300 border border-gray-200 dark:border-gray-600"
            aria-label="Marcar como completada">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import type { Task } from '@/types/task';
import BaseCard from '@ritmo/ui/components/atoms/layout/BaseCard.vue';

interface TaskCardProps {
  task: Task
}

const props = defineProps<TaskCardProps>()

const emit = defineEmits<{
  'start-timer': []
  'toggle-complete': []
}>()

// Métodos para determinar el estilo de la card
const getCardVariant = () => {
  if (props.task.completed) return 'success'
  if (props.task.isRunning) return 'warning'
  return 'elevated'
}

const getCardClasses = () => {
  const baseClasses = 'transition-all duration-300 overflow-visible group'

  if (props.task.completed) {
    return `${baseClasses} border-green-200 dark:border-green-800/50`
  }

  if (props.task.isRunning) {
    return `${baseClasses} border-purple-200 dark:border-purple-800/30 shadow-sm`
  }

  return `${baseClasses} border-gray-100 dark:border-gray-700/50 hover:border-gray-200 dark:hover:border-gray-600/50 hover:shadow-lg`
}

// Métodos auxiliares
const getCategoryColor = (category: string) => {
  const colors = {
    WORK: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
    STUDY: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300',
    PERSONAL: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300',
    OTHER: 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300',
  }
  return colors[category as keyof typeof colors] || colors.OTHER
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

const formatAccumulatedTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}
</script>
