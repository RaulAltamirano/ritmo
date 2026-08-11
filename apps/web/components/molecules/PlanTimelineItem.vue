<template>
  <div
    class="flex gap-3"
    :class="completed ? 'opacity-60' : ''"
    data-testid="plan-timeline-item"
  >
    <div class="w-14 shrink-0 pt-1 text-right">
      <p class="text-xs tabular-nums text-content-secondary">{{ timeLabel }}</p>
    </div>

    <div class="relative flex w-4 shrink-0 flex-col items-center">
      <div
        class="absolute inset-y-0 w-px bg-outline"
        :class="nodeLineClass"
        aria-hidden="true"
      />
      <div
        class="relative z-10 mt-1.5 h-3 w-3 rounded-full border-2 border-primary-500 bg-surface"
        :class="completed ? 'border-content-secondary bg-content-secondary/20' : ''"
        aria-hidden="true"
      />
    </div>

    <div class="min-w-0 flex-1 pb-5">
      <p
        class="text-sm font-medium text-content"
        :class="completed ? 'line-through text-content-secondary' : ''"
      >
        {{ title }}
      </p>
      <p v-if="rangeLabel" class="mt-0.5 text-xs text-content-secondary">
        {{ rangeLabel }}
      </p>
      <PlanTaskMeta :task="task" dense />
    </div>

    <div v-if="interactive" class="shrink-0 pt-0.5">
      <input
        type="checkbox"
        class="h-4 w-4 cursor-pointer rounded border-outline-strong text-primary-500 focus:ring-primary-500"
        :checked="completed"
        :aria-label="`Mark ${title} complete`"
        @change="onToggle"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { Task } from '~/types/task'
  import { formatTaskTimeRange } from '~/utils/planWeek'
  import PlanTaskMeta from '~/components/molecules/PlanTaskMeta.vue'

  const props = withDefaults(
    defineProps<{
      task: Task
      isFirst?: boolean
      isLast?: boolean
      /** When false, hides the complete checkbox (preview / read-only). */
      interactive?: boolean
    }>(),
    {
      isFirst: false,
      isLast: false,
      interactive: true,
    },
  )

  const emit = defineEmits<{
    toggleComplete: [task: Task, completed: boolean]
  }>()

  const title = computed(() => props.task.name || props.task.title || 'Task')
  const completed = computed(() => props.task.completed === true)
  const rangeLabel = computed(() => formatTaskTimeRange(props.task))
  const timeLabel = computed(() => {
    if (!props.task.startTime) return ''
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(props.task.startTime)
  })

  const nodeLineClass = computed(() => {
    if (props.isFirst && props.isLast) return 'top-3 bottom-3'
    if (props.isFirst) return 'top-3 bottom-0'
    if (props.isLast) return 'top-0 bottom-3'
    return 'top-0 bottom-0'
  })

  function onToggle(event: Event) {
    const target = event.target as HTMLInputElement
    emit('toggleComplete', props.task, target.checked)
  }
</script>
