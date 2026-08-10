<template>
  <section aria-label="Training session">
    <p v-if="!trainingDay" class="py-8 text-center text-sm text-content-secondary">
      Rest day
    </p>
    <div v-else class="space-y-3">
      <header>
        <h2 class="text-base font-semibold text-content" :class="titleClass">
          {{ trainingDay.name }}
        </h2>
      </header>
      <ul
        v-for="(group, groupIndex) in groups"
        :key="groupIndex"
        class="overflow-hidden rounded-xl border border-outline bg-surface divide-y divide-outline"
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
  import type { TrainingDay } from '~/types/training'
  import { groupExercisesByBlock } from '~/utils/groupExercisesByBlock'

  const props = defineProps<{
    trainingDay: TrainingDay | null
  }>()

  const titleClass = computed(() => {
    if (props.trainingDay?.focus === 'upper') return 'text-brand-text'
    if (props.trainingDay?.focus === 'lower') {
      return 'text-accent-900/90 dark:text-accent-200/90'
    }
    return 'text-content-secondary'
  })

  const groups = computed(() =>
    groupExercisesByBlock(props.trainingDay?.exercises ?? []),
  )
</script>
