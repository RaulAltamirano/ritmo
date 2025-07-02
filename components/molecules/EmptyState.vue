<template>
  <div 
    class="text-center py-12 text-gray-500 dark:text-gray-400"
    role="status"
    aria-label="No hay tareas disponibles"
  >
    <div class="w-16 h-16 bg-gray-100 dark:bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200 dark:border-gray-700">
      <CheckSquare class="text-gray-300 dark:text-gray-600" :size="24" />
    </div>
    <p class="text-lg font-medium mb-2">
      {{ selectedCategory ? `No hay tareas en "${selectedCategory}"` : 'No hay tareas disponibles' }}
    </p>
    <p class="text-sm text-gray-400 dark:text-gray-500">
      {{ selectedCategory ? 'Intenta crear una nueva tarea en esta categoría' : 'Crea tu primera tarea para comenzar' }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { CheckSquare } from 'lucide-vue-next'
import type { EmptyStateProps } from '../../types/task'

defineProps<EmptyStateProps>()
</script> 