<template>
  <div
    class="text-center py-12 text-gray-500 dark:text-gray-400"
    role="status"
    aria-label="No tasks available"
  >
    <div
      class="w-16 h-16 bg-surface-raised/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-outline"
    >
      <CheckSquare class="text-gray-300 dark:text-gray-600" :size="24" />
    </div>
    <p class="text-lg font-medium mb-2">
      {{
        selectedCategory
          ? `No tasks in "${selectedCategory}"`
          : 'No tasks available'
      }}
    </p>
    <p class="text-sm text-gray-400 dark:text-gray-500">
      {{
        selectedCategory
          ? 'Try creating a new task in this category'
          : 'Create your first task to get started'
      }}
    </p>
  </div>
</template>

<script setup lang="ts">
  import { CheckSquare } from 'lucide-vue-next'
  import type { EmptyStateProps } from '@/types/task'

  defineProps<EmptyStateProps>()
</script>
