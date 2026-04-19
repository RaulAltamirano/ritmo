<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
  >
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        🌅 Fase Circadiana Actual
      </h3>
      <div class="flex items-center gap-2">
        <span
          v-if="isLoading"
          class="text-sm text-gray-500 dark:text-gray-400 animate-pulse"
        >
          Cargando...
        </span>
        <span v-else-if="error" class="text-sm text-red-500"> Error: {{ error }} </span>
        <span v-else class="text-sm text-green-500"> ✓ Activo </span>
      </div>
    </div>

    <div v-if="currentPhase" class="space-y-3">
      <!-- Phase Info -->
      <div class="flex items-center gap-3">
        <div
          class="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
          :style="{ backgroundColor: currentPhase.color + '20' }"
        >
          {{ currentPhase.emoji }}
        </div>
        <div class="flex-1">
          <h4 class="font-medium text-gray-900 dark:text-white">
            {{ currentPhase.name }}
          </h4>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ currentPhase.description }}
          </p>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="space-y-2">
        <div class="flex justify-between text-sm">
          <span class="text-gray-600 dark:text-gray-400">Progreso de la fase</span>
          <span class="text-gray-900 dark:text-white font-medium">
            {{ Math.round(phaseProgress * 100) }}%
          </span>
        </div>
        <div
          class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
        >
          <div
            class="h-full transition-all duration-300 ease-out"
            :style="{
              width: `${phaseProgress * 100}%`,
              backgroundColor: currentPhase.color,
            }"
          ></div>
        </div>
      </div>

      <!-- Time Info -->
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span class="text-gray-600 dark:text-gray-400">Hora actual:</span>
          <span class="ml-2 text-gray-900 dark:text-white font-medium">
            {{
              new Date().toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
              })
            }}
          </span>
        </div>
        <div>
          <span class="text-gray-600 dark:text-gray-400">Siguiente fase:</span>
          <span class="ml-2 text-gray-900 dark:text-white font-medium">
            {{ timeUntilNextFormatted }}
          </span>
        </div>
      </div>

      <!-- Recommendations -->
      <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
        <h5 class="font-medium text-gray-900 dark:text-white mb-2">💡 Ideal para:</h5>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ currentPhase.idealFor }}
        </p>
      </div>

      <!-- Priority -->
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600 dark:text-gray-400">Prioridad:</span>
        <span
          class="px-2 py-1 rounded-full text-xs font-medium"
          :class="{
            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200':
              currentPhase.priority === 'critical',
            'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200':
              currentPhase.priority === 'high',
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200':
              currentPhase.priority === 'medium',
            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200':
              currentPhase.priority === 'low',
          }"
        >
          {{ currentPhase.priority.toUpperCase() }}
        </span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="isLoading" class="space-y-3">
      <div class="animate-pulse">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div class="flex-1">
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-4">
      <div class="text-red-500 mb-2">⚠️</div>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        No se pudo cargar la información de la fase circadiana
      </p>
      <button
        @click="fetchCurrentPhase"
        class="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
      >
        Reintentar
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useCircadian } from '@/composables/useCircadian'

  const {
    currentPhase,
    isLoading,
    error,
    phaseProgress,
    timeUntilNextFormatted,
    fetchCurrentPhase,
  } = useCircadian({
    autoRefresh: true,
    refreshInterval: 60000, // 1 minute
  })
</script>
