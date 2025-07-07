<template>
  <div class="flex items-center space-x-3">
    <span class="text-sm text-gray-500 dark:text-gray-400">{{ taskCount }} tareas</span>
    <div class="flex bg-gray-50 dark:bg-gray-800/50 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
      <button
        @click="$emit('view-change', 'list')"
        :class="[
          'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
          modelValue === 'list'
            ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        ]"
      >
        Lista
      </button>
      <button
        @click="$emit('view-change', 'grid')"
        :class="[
          'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
          modelValue === 'grid'
            ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        ]"
      >
        Cuadrícula
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ViewModeToggleProps } from '../../types/task'

defineProps<ViewModeToggleProps>()

defineEmits<{
  'view-change': [mode: 'list' | 'grid']
}>()
</script> 