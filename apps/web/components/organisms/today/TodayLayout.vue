<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Mobile-optimized container -->
    <div class="max-w-full mx-auto px-4 py-3 sm:px-6 lg:px-8 sm:py-6 lg:py-8">
      <!-- Header -->
      <TodayHeader
        :phase-data="phaseData"
        :phase-loading="phaseLoading"
        @toggle-filters="$emit('toggle-filters')"
      />

      <!-- Content -->
      <TodayContent
        :tasks="tasks"
        :is-quick-task-loading="isQuickTaskLoading"
        @create-task="$emit('create-task', $event)"
        @delete-task="$emit('delete-task', $event)"
        @reorder-tasks="$emit('reorder-tasks', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { Task } from '../../../types/task'
  import TodayContent from './TodayContent.vue'
  import TodayHeader from './TodayHeader.vue'

  interface Props {
    tasks: Task[]
    isQuickTaskLoading: boolean
    phaseData?: any
    phaseLoading?: boolean
  }

  defineProps<Props>()

  interface Emits {
    (e: 'toggle-filters'): void
    (e: 'create-task', taskName: string): void
    (e: 'delete-task', taskId: string): void
    (e: 'reorder-tasks', tasks: Task[]): void
  }

  defineEmits<Emits>()
</script>
