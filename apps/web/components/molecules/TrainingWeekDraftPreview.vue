<template>
  <div class="space-y-4">
    <div class="space-y-1">
      <p class="text-sm text-content-secondary">
        {{ summary || 'Your training week is ready to review.' }}
      </p>
      <p class="text-xs text-content-muted">
        {{ draft.days.length }} training day{{ draft.days.length === 1 ? '' : 's' }}
      </p>
    </div>

    <div class="space-y-3">
      <article
        v-for="day in draft.days"
        :key="day.id"
        class="rounded-xl border border-outline bg-surface p-4"
      >
        <div class="mb-3 flex items-center justify-between gap-3">
          <div>
            <p class="text-xs font-medium uppercase tracking-wide text-content-muted">
              Day {{ day.dayNumber }}
            </p>
            <h4 class="font-semibold text-content">{{ day.name }}</h4>
          </div>
          <span
            class="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700 dark:bg-primary-950/50 dark:text-primary-300"
          >
            {{ focusLabel(day.focus) }}
          </span>
        </div>

        <ul class="divide-y divide-outline">
          <li
            v-for="exercise in day.exercises"
            :key="exercise.id"
            class="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
          >
            <div>
              <p class="text-sm font-medium text-content">{{ exercise.name }}</p>
              <p class="text-xs text-content-muted">
                Block {{ exercise.block.toUpperCase() }} · RIR {{ exercise.targetRir }}
              </p>
            </div>
            <span class="shrink-0 text-sm font-medium text-content-secondary">
              {{ exercise.setsReps }}
            </span>
          </li>
        </ul>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { TrainingDayFocus, WeeklyPlan } from '@/types/training'

  withDefaults(
    defineProps<{
      draft: WeeklyPlan
      summary?: string | null
    }>(),
    { summary: null },
  )

  function focusLabel(focus: TrainingDayFocus): string {
    return focus === 'upper' ? 'Upper body' : 'Lower body'
  }
</script>
