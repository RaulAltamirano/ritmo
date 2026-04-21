<template>
  <div>
    <div class="mb-10">
      <QuickTaskInput
        :is-loading="isQuickTaskLoading"
        @create-task="$emit('create-task', $event)"
      />
    </div>

    <div v-if="tasks.length > 0" class="tc-tasks">
      <TaskList
        :tasks="tasks"
        @delete-task="$emit('delete-task', $event)"
        @request-complete="$emit('request-complete', $event)"
        @reorder-tasks="$emit('reorder-tasks', $event)"
        @update-task="$emit('update-task', $event)"
        @add-note="(taskId, note) => $emit('add-note', taskId, note)"
      />
    </div>

    <div v-else class="tc-empty text-center py-14">
      <div class="text-3xl text-gray-300 dark:text-gray-700 mb-3 leading-none">◎</div>
      <p class="text-sm text-gray-400 dark:text-gray-500 mb-1">
        Tus tareas de hoy aparecerán aquí
      </p>
      <p class="text-xs text-gray-300 dark:text-gray-700">
        Escribe el nombre y presiona Enter para crear una
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { Task } from '../../../types/task'
  import QuickTaskInput from '@/components/molecules/QuickTaskInput.vue'
  import TaskList from '@/components/molecules/TaskList.vue'

  interface Props {
    tasks: Task[]
    isQuickTaskLoading: boolean
  }

  defineProps<Props>()

  defineEmits<{
    (e: 'create-task', taskName: string): void
    (e: 'delete-task', taskId: string): void
    (e: 'request-complete', task: Task): void
    (e: 'reorder-tasks', tasks: Task[]): void
    (e: 'update-task', task: Task): void
    (e: 'add-note', taskId: string, note: string): void
  }>()
</script>

<style scoped>
  .tc-tasks {
    animation: tc-in 0.28s ease both;
  }

  .tc-empty {
    animation: tc-in 0.35s ease both;
  }

  @keyframes tc-in {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
