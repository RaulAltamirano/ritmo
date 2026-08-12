<template>
  <section :aria-label="sectionLabel">
    <p v-if="!trainingDay" class="py-8 text-center text-sm text-content-secondary">
      Rest day
    </p>
    <div v-else class="space-y-3">
      <header>
        <h2 class="text-base font-semibold text-content" :class="titleClass">
          {{ trainingDay.name }}
        </h2>
      </header>
      <div class="flex flex-col gap-3">
        <ExerciseBlockGroup
          v-for="(group, groupIndex) in groups"
          :key="groupIndex"
          :exercises="group"
          :group-index="groupIndex"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import ExerciseBlockGroup from '~/components/molecules/ExerciseBlockGroup.vue'
  import type { TrainingDay } from '~/types/training'
  import { groupExercisesByBlock } from '~/utils/groupExercisesByBlock'

  const props = defineProps<{
    trainingDay: TrainingDay | null
  }>()

  const sectionLabel = computed(() =>
    props.trainingDay ? props.trainingDay.name : 'Rest day',
  )

  const titleClass = computed(() => {
    if (props.trainingDay?.focus === 'upper') return 'text-brand-text'
    if (props.trainingDay?.focus === 'lower') {
      return 'text-warning-800 dark:text-warning-300'
    }
    return 'text-content-secondary'
  })

  const groups = computed(() =>
    groupExercisesByBlock(props.trainingDay?.exercises ?? []),
  )
</script>
