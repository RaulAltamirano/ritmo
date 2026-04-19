<template>
  <div class="space-y-3 sm:space-y-4">
    <!-- Quick task input - Mobile optimized -->
    <div class="mb-3 sm:mb-6">
      <QuickTaskInput
        :is-loading="isQuickTaskLoading"
        @create-task="$emit('create-task', $event)"
      />
    </div>

    <!-- Task list - Mobile optimized -->
    <div v-if="tasks.length > 0" class="space-y-3 sm:space-y-4">
      <TaskList
        :tasks="tasks"
        @delete-task="$emit('delete-task', $event)"
        @reorder-tasks="$emit('reorder-tasks', $event)"
      />
    </div>

    <!-- Empty state - Simple and minimal -->
    <EmptyState
      v-else
      title="No tasks yet"
      description="Use the field above to create your first task"
      :icon="Target"
    >
      <div class="text-xs text-gray-400 dark:text-gray-500">
        💡 Type the name and press Enter
      </div>
    </EmptyState>
  </div>
</template>

<script setup lang="ts">
  import EmptyState from '@ritmo/ui/components/molecules/feedback/EmptyState.vue'
  import { Target } from 'lucide-vue-next'
  import type { Task } from '../../../types/task'
  import QuickTaskInput from '@/components/molecules/QuickTaskInput.vue'
  import TaskList from '@/components/molecules/TaskList.vue'

  interface Props {
    tasks: Task[]
    isQuickTaskLoading: boolean
  }

  defineProps<Props>()

  interface Emits {
    (e: 'create-task', taskName: string): void
    (e: 'delete-task', taskId: string): void
    (e: 'reorder-tasks', tasks: Task[]): void
  }

  defineEmits<Emits>()
</script>
