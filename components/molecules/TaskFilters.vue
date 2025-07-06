<template>
  <div class="flex flex-wrap gap-2">
    <button
      @click="$emit('filter-change', null)"
      :class="[
        'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
        selectedCategory === null
          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
          : 'bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/70 border border-gray-200 dark:border-gray-700'
      ]"
    >
      Todas
    </button>
    <button
      v-for="category in categories"
      :key="category"
      @click="$emit('filter-change', selectedCategory === category ? null : category)"
      :class="[
        'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
        selectedCategory === category
          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
          : 'bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/70 border border-gray-200 dark:border-gray-700'
      ]"
    >
      {{ category }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { TaskFiltersProps } from '../../types/task'

defineProps<TaskFiltersProps>()

defineEmits<{
  'filter-change': [category: string | null]
}>()
</script> 