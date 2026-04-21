<template>
  <div v-if="currentPhase || isLoading || error">
    <!-- Loading skeleton -->
    <div
      v-if="isLoading"
      class="space-y-2 animate-pulse"
      aria-busy="true"
      aria-label="Cargando fase circadiana"
    >
      <div class="flex items-center justify-between">
        <div class="h-4 bg-surface-raised rounded w-2/5" />
        <div class="h-4 bg-surface-raised rounded w-8" />
      </div>
      <div class="h-3 bg-surface-raised rounded w-3/4" />
      <div class="h-0.5 bg-surface-raised rounded-full mt-3" />
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="flex items-center gap-2.5">
      <p class="text-sm text-gray-400 dark:text-gray-500">No se pudo cargar la fase</p>
      <button
        class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-150 cursor-pointer"
        @click="fetchCurrentPhase"
      >
        Reintentar
      </button>
    </div>

    <!-- Phase strip -->
    <div v-else-if="currentPhase">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <component
            :is="phaseIcon"
            class="w-4 h-4 shrink-0 text-gray-500 dark:text-gray-400"
            aria-hidden="true"
          />
          <span class="text-sm font-medium text-gray-900 dark:text-white">
            {{ currentPhase.name }}
          </span>
        </div>
        <span class="text-xs tabular-nums text-gray-400 dark:text-gray-500">
          {{ Math.round(phaseProgress * 100) }}%
        </span>
      </div>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
        {{ currentPhase.description }}
      </p>
      <div class="w-full h-0.5 bg-surface-raised rounded-full mt-3 overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-500 ease-out"
          :style="{ width: `${phaseProgress * 100}%`, backgroundColor: currentPhase.color }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Activity, BookOpen, Coffee, Moon, PenTool, Repeat, Sun } from 'lucide-vue-next'
import { computed } from 'vue'
import { useCircadian } from '@/composables/useCircadian'

const { currentPhase, isLoading, error, phaseProgress, fetchCurrentPhase } = useCircadian({
  autoRefresh: true,
  refreshInterval: 60000,
})

const iconMap: Record<string, unknown> = {
  moon: Moon,
  bed: Moon,
  sun: Sun,
  coffee: Coffee,
  activity: Activity,
  repeat: Repeat,
  'pen-tool': PenTool,
  'book-open': BookOpen,
}

const phaseIcon = computed(() => {
  if (!currentPhase.value) return Activity
  const key = (currentPhase.value.icon || '').toLowerCase()
  return iconMap[key] ?? Activity
})
</script>
