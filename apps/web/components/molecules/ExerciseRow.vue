<template>
  <li class="px-3.5 py-3.5 sm:px-4 sm:py-4">
    <div class="min-w-0 space-y-2.5">
      <p class="text-sm font-semibold leading-normal text-content">
        <span class="sr-only">Block {{ exercise.block }}. </span>
        {{ exercise.name }}
      </p>

      <p
        class="inline-flex max-w-full items-start gap-1.5 font-mono text-sm font-medium leading-normal tracking-tight text-content"
      >
        <Repeat2
          class="mt-0.5 h-3.5 w-3.5 shrink-0 text-content-muted"
          aria-hidden="true"
        />
        <span>{{ exercise.setsReps }}</span>
      </p>

      <dl class="flex flex-wrap items-center gap-2">
        <div
          class="inline-flex items-center gap-1 rounded-md border border-brand/15 bg-brand-subtle/70 px-2 py-1 text-xs text-brand-text/90"
        >
          <Target class="h-3 w-3 shrink-0 opacity-70" aria-hidden="true" />
          <dt class="font-semibold uppercase tracking-wide opacity-80">RIR</dt>
          <dd class="font-mono font-medium">
            {{ exercise.targetRir }}
          </dd>
        </div>
        <div
          class="inline-flex items-center gap-1 rounded-md border border-accent-200/70 bg-accent-50/80 px-2 py-1 text-xs text-accent-800/80 dark:border-accent-800/40 dark:bg-accent-950/45 dark:text-accent-300/85"
        >
          <Gauge class="h-3 w-3 shrink-0 opacity-70" aria-hidden="true" />
          <dt class="font-semibold uppercase tracking-wide opacity-80">RPE</dt>
          <dd class="font-mono font-medium">
            {{ exercise.rpe }}
          </dd>
        </div>
      </dl>
    </div>
  </li>
</template>

<script setup lang="ts">
  import { Gauge, Repeat2, Target } from 'lucide-vue-next'
  import type { ExerciseEntry } from '~/types/training'

  defineProps<{
    exercise: ExerciseEntry
  }>()
</script>
