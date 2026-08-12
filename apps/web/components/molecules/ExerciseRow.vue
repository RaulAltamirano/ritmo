<template>
  <li class="relative px-3.5 py-3 sm:px-4 sm:py-3.5">
    <div
      class="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
    >
      <div class="min-w-0 flex-1 space-y-1">
        <p class="text-sm font-semibold leading-snug text-content">
          <span class="sr-only">Block {{ exercise.block }}. </span>
          {{ exercise.name }}
        </p>
        <p
          class="inline-flex max-w-full items-start gap-1.5 text-sm leading-normal text-content-secondary"
        >
          <Repeat2
            class="mt-0.5 h-3.5 w-3.5 shrink-0 text-content-muted"
            aria-hidden="true"
          />
          <span class="font-mono tracking-tight text-content">{{
            exercise.setsReps
          }}</span>
        </p>
      </div>

      <dl class="shrink-0 sm:self-center">
        <div
          class="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-outline bg-surface-raised/80 px-2.5 py-1 text-xs text-content"
        >
          <Gauge
            class="h-3.5 w-3.5 shrink-0 text-brand"
            aria-hidden="true"
          />
          <dt class="sr-only">Rate of perceived exertion (RPE)</dt>
          <dd class="font-medium tracking-wide text-content-secondary">
            <span class="font-semibold text-brand-text">RPE</span>
            {{ exercise.rpe }}
          </dd>
        </div>
      </dl>
    </div>

    <p
      v-if="showNextCue"
      class="mt-2 flex items-center gap-1.5 text-[11px] font-medium tracking-wide"
      :class="cueClass"
    >
      <Link2 class="h-3 w-3 shrink-0" aria-hidden="true" />
      Then, minimal rest
    </p>
  </li>
</template>

<script setup lang="ts">
  import { Gauge, Link2, Repeat2 } from 'lucide-vue-next'
  import type { ExerciseEntry } from '~/types/training'

  withDefaults(
    defineProps<{
      exercise: ExerciseEntry
      /** Shown between exercises inside a superset / triset / giant set. */
      showNextCue?: boolean
      cueClass?: string
    }>(),
    {
      showNextCue: false,
      cueClass: 'text-content-muted',
    },
  )
</script>
