<template>
  <section aria-label="Day timeline">
    <p v-if="tasks.length === 0" class="py-8 text-center text-sm text-content-secondary">
      Nothing scheduled for this day
    </p>
    <div v-else class="mt-1">
      <PlanTimelineItem
        v-for="(task, index) in tasks"
        :key="task.id"
        :task="task"
        :is-first="index === 0"
        :is-last="index === tasks.length - 1"
        @toggle-complete="(t, completed) => emit('toggleComplete', t, completed)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
  import PlanTimelineItem from '~/components/molecules/PlanTimelineItem.vue'
  import type { Task } from '~/types/task'

  defineProps<{
    tasks: Task[]
  }>()

  const emit = defineEmits<{
    toggleComplete: [task: Task, completed: boolean]
  }>()
</script>
