<template>
  <section v-if="tasks.length > 0" class="space-y-2" aria-label="Unscheduled tasks">
    <h2 class="text-sm font-semibold text-content">Unscheduled</h2>
    <ul class="divide-y divide-outline rounded-xl border border-outline bg-surface">
      <li
        v-for="task in tasks"
        :key="task.id"
        class="flex items-center gap-3 px-3 py-2.5"
        :class="task.completed ? 'opacity-60' : ''"
      >
        <div class="min-w-0 flex-1">
          <p
            class="truncate text-sm font-medium text-content"
            :class="task.completed ? 'line-through text-content-secondary' : ''"
          >
            {{ task.name || task.title }}
          </p>
          <p
            v-if="task.category"
            class="truncate text-xs text-content-secondary"
          >
            {{ task.category }}
          </p>
          <PlanTaskMeta :task="task" />
        </div>
        <input
          type="checkbox"
          class="h-4 w-4 shrink-0 rounded border-outline-strong text-primary-500 focus:ring-primary-500"
          :checked="task.completed === true"
          :aria-label="`Mark ${task.name || task.title} complete`"
          @change="onToggle(task, $event)"
        />
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
  import PlanTaskMeta from '~/components/molecules/PlanTaskMeta.vue'
  import type { Task } from '~/types/task'

  defineProps<{
    tasks: Task[]
  }>()

  const emit = defineEmits<{
    toggleComplete: [task: Task, completed: boolean]
  }>()

  function onToggle(task: Task, event: Event) {
    const target = event.target as HTMLInputElement
    emit('toggleComplete', task, target.checked)
  }
</script>
