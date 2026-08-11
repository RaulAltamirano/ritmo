<template>
  <div class="space-y-4">
    <div class="space-y-1">
      <p class="text-sm leading-relaxed text-content-secondary">
        {{ draft.summary }}
      </p>
      <p class="text-xs text-content-muted">
        {{ sessionCountLabel }} · {{ activeDayCount }} day{{
          activeDayCount === 1 ? '' : 's'
        }}
      </p>
    </div>

    <div
      class="flex gap-1.5 overflow-x-auto pb-1"
      role="tablist"
      aria-label="Preview days"
    >
      <button
        v-for="day in days"
        :key="day.offset"
        type="button"
        role="tab"
        class="inline-flex min-h-[44px] min-w-[3.25rem] cursor-pointer flex-col items-center justify-center rounded-xl px-2 py-1.5 text-center transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        :class="dayTabClass(day)"
        :aria-selected="selectedOffset === day.offset"
        :aria-label="`${day.label}${day.dateLabel ? `, ${day.dateLabel}` : ''}${day.sessions.length ? `, ${day.sessions.length} sessions` : ', empty'}`"
        @click="selectedOffset = day.offset"
      >
        <span class="text-[11px] font-medium uppercase tracking-wide">
          {{ day.label }}
        </span>
        <span class="text-xs tabular-nums">{{ day.dateLabel }}</span>
        <span
          v-if="day.sessions.length"
          class="mt-0.5 h-1 w-1 rounded-full bg-current opacity-80"
          aria-hidden="true"
        />
      </button>
    </div>

    <div
      class="rounded-2xl border border-outline bg-canvas/50 px-2 py-3 dark:bg-surface/30"
      role="tabpanel"
      :aria-label="`${selectedDay?.label ?? 'Day'} schedule`"
    >
      <p
        v-if="!selectedDay?.sessions.length"
        class="py-8 text-center text-sm text-content-secondary"
      >
        Nothing scheduled for this day
      </p>
      <div v-else class="mt-1">
        <PlanTimelineItem
          v-for="(task, index) in selectedDayTasks"
          :key="task.id"
          :task="task"
          :is-first="index === 0"
          :is-last="index === selectedDayTasks.length - 1"
          :interactive="false"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import PlanTimelineItem from '@/components/molecules/PlanTimelineItem.vue'
  import type { WeekDraft } from '@/types/generateWeek'
  import type { Task } from '@/types/task'
  import { weekDraftToTasks } from '@/utils/applyWeekDraft'
  import { addDays, tasksForDay } from '@/utils/planWeek'

  const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

  const props = withDefaults(
    defineProps<{
      draft: WeekDraft
      planId?: string
    }>(),
    { planId: 'preview' },
  )

  const selectedOffset = ref(0)

  const draftTasks = computed(() =>
    weekDraftToTasks(props.draft, props.planId),
  )

  const weekStart = computed(() => {
    const [y, m, d] = props.draft.weekStart.split('-').map(Number)
    return new Date(y!, m! - 1, d!)
  })

  const days = computed(() =>
    DAY_LABELS.map((label, offset) => {
      const date = addDays(weekStart.value, offset)
      const sessions = props.draft.sessions.filter(s => s.dayOffset === offset)
      return {
        offset,
        label,
        dateLabel: String(date.getDate()),
        sessions,
      }
    }),
  )

  const activeDayCount = computed(
    () => days.value.filter(d => d.sessions.length > 0).length,
  )

  const sessionCountLabel = computed(() => {
    const n = props.draft.sessions.length
    return `${n} session${n === 1 ? '' : 's'}`
  })

  const selectedDay = computed(() =>
    days.value.find(d => d.offset === selectedOffset.value),
  )

  const selectedDayTasks = computed((): Task[] => {
    const day = selectedDay.value
    if (!day) return []
    return tasksForDay(draftTasks.value, addDays(weekStart.value, day.offset))
  })

  function dayTabClass(day: {
    offset: number
    sessions: unknown[]
  }): string {
    const selected = selectedOffset.value === day.offset
    if (selected) {
      return 'bg-primary-500 text-white shadow-sm'
    }
    if (day.sessions.length) {
      return 'bg-surface-raised text-content hover:bg-surface-overlay'
    }
    return 'text-content-muted hover:bg-surface-raised/70'
  }

  watch(
    () => props.draft.weekStart + props.draft.sessions.length,
    () => {
      const firstBusy = days.value.find(d => d.sessions.length > 0)
      selectedOffset.value = firstBusy?.offset ?? 0
    },
    { immediate: true },
  )
</script>
