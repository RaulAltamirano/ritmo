<template>
  <article
    class="flex min-w-0 flex-col overflow-hidden rounded-xl border bg-surface"
    :class="tone.article"
    :aria-labelledby="headingId"
  >
    <header
      class="flex flex-col gap-0.5 border-b px-3.5 py-2.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3 sm:px-4"
      :class="tone.header"
    >
      <div class="flex min-w-0 flex-wrap items-center gap-2">
        <h3
          :id="headingId"
          class="text-sm font-semibold tracking-tight"
          :class="tone.title"
        >
          {{ meta.title }}
        </h3>
        <span
          v-if="meta.countLabel"
          class="inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-medium"
          :class="tone.chip"
        >
          {{ meta.countLabel }}
        </span>
      </div>
      <p
        class="max-w-prose text-xs leading-relaxed text-content-secondary sm:max-w-[min(28rem,45%)] sm:text-right"
      >
        {{ meta.hint }}
      </p>
    </header>

    <div class="relative flex-1">
      <div
        v-if="isSuperset"
        class="pointer-events-none absolute bottom-3 left-1.5 top-3 w-0.5 rounded-full sm:left-2"
        :class="tone.rail"
        aria-hidden="true"
      />
      <ul class="divide-y divide-outline" :aria-label="listLabel">
        <ExerciseRow
          v-for="(exercise, index) in exercises"
          :key="exercise.id"
          :exercise="exercise"
          :show-next-cue="isSuperset && index < exercises.length - 1"
          :cue-class="tone.cue"
          :day-key="dayKey"
          :log="findExerciseLog(logs, exercise.id, dayKey)"
          :last-session-line="lastSessionLineById[exercise.id] ?? null"
          :last-unit="settingsById[exercise.id]?.lastUnit ?? 'kg'"
          @update:log="emit('update:log', $event)"
          @open-progress="emit('open-progress', exercise.id)"
        />
      </ul>
    </div>
  </article>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import ExerciseRow from '~/components/molecules/ExerciseRow.vue'
  import type {
    ExerciseEntry,
    ExerciseLoadSettings,
    ExerciseLog,
  } from '~/types/training'
  import { getExerciseGroupMeta } from '~/utils/exerciseGroupMeta'
  import { getGroupToneClasses } from '~/utils/exerciseGroupTone'
  import { findExerciseLog } from '~/utils/trainingLogLookup'

  const props = withDefaults(
    defineProps<{
      exercises: ExerciseEntry[]
      groupIndex: number
      logs?: ExerciseLog[]
      lastSessionLineById?: Record<string, string | null>
      settingsById?: Record<string, ExerciseLoadSettings>
      dayKey?: string
    }>(),
    {
      logs: () => [],
      lastSessionLineById: () => ({}),
      settingsById: () => ({}),
      dayKey: '',
    },
  )

  const emit = defineEmits<{
    'update:log': [value: ExerciseLog]
    'open-progress': [exerciseId: string]
  }>()

  const meta = computed(() => getExerciseGroupMeta(props.exercises.length))
  const tone = computed(() => getGroupToneClasses(meta.value.tone))
  const isSuperset = computed(() => meta.value.kind !== 'single')
  const headingId = computed(() => `exercise-group-${props.groupIndex}`)
  const listLabel = computed(() => `${meta.value.title}: ${meta.value.hint}`)
</script>
