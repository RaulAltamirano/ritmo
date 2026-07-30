<template>
  <section
    class="flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-outline bg-surface shadow-sm"
    :aria-labelledby="headingId"
  >
    <header class="border-b border-outline px-4 py-3.5" :class="headerToneClass">
      <p class="text-xs font-semibold uppercase tracking-wider" :class="eyebrowClass">
        {{ weekdayLabel }}
        <span class="font-medium opacity-80">· {{ dateLabel }}</span>
      </p>
      <h2 :id="headingId" class="mt-1 text-base font-semibold" :class="titleClass">
        {{ titleLabel }}
      </h2>
    </header>

    <div
      v-if="!column.trainingDay"
      class="flex flex-1 items-center justify-center p-6 text-center text-sm text-content-muted"
    >
      Rest day
    </div>

    <div
      v-else-if="groups.length === 0"
      class="p-4 text-center text-sm text-content-secondary"
    >
      No exercises in this day.
    </div>

    <div v-else class="flex flex-col gap-3.5 p-3 sm:gap-4 sm:p-3.5">
      <ul
        v-for="(group, groupIndex) in groups"
        :key="`${column.key}-group-${groupIndex}`"
        class="overflow-hidden rounded-lg border border-outline bg-canvas/40 divide-y divide-outline"
      >
        <ExerciseRow
          v-for="exercise in group"
          :key="exercise.id"
          :exercise="exercise"
        />
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import ExerciseRow from '~/components/molecules/ExerciseRow.vue'
  import type { ExerciseEntry, WeekColumn } from '~/types/training'

  const props = defineProps<{
    column: WeekColumn
  }>()

  const headingId = computed(() => `training-day-${props.column.key}`)

  const weekdayLabel = computed(() =>
    new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(props.column.date)
  )

  const dateLabel = computed(() =>
    new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(
      props.column.date
    )
  )

  const titleLabel = computed(
    () => props.column.trainingDay?.name ?? 'Rest'
  )

  const focus = computed(() => props.column.trainingDay?.focus ?? null)

  const headerToneClass = computed(() => {
    if (focus.value === 'upper') return 'bg-brand-subtle/55'
    if (focus.value === 'lower') {
      return 'bg-accent-50/70 dark:bg-accent-950/35'
    }
    return 'bg-surface-raised/40'
  })

  const eyebrowClass = computed(() => {
    if (focus.value === 'upper') return 'text-brand-text/85'
    if (focus.value === 'lower') {
      return 'text-accent-800/80 dark:text-accent-300/85'
    }
    return 'text-content-muted'
  })

  const titleClass = computed(() => {
    if (focus.value === 'upper') return 'text-brand-text'
    if (focus.value === 'lower') {
      return 'text-accent-900/90 dark:text-accent-200/90'
    }
    return 'text-content-secondary'
  })

  const groups = computed(() => {
    const exercises = props.column.trainingDay?.exercises ?? []
    const result: ExerciseEntry[][] = []
    let current: ExerciseEntry[] = []

    for (const exercise of exercises) {
      if (exercise.block === 'a' && current.length > 0) {
        result.push(current)
        current = []
      }
      current.push(exercise)
    }

    if (current.length > 0) {
      result.push(current)
    }

    return result
  })
</script>
