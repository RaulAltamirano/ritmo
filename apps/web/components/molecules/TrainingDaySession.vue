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
          :logs="logs"
          :last-session-line-by-id="lastSessionLineById"
          :settings-by-id="settingsById"
          :day-key="dayKey"
          @update:log="onUpdateLog"
          @open-progress="progressExerciseId = $event"
        />
      </div>
    </div>
    <ExerciseProgressSheet
      v-if="progressExercise"
      is-open
      :exercise-name="progressExercise.name"
      :logs="progressLogs"
      :today-key="dayKey"
      :settings="progressSettings"
      :bodyweight-kg="bodyweightKg"
      @update:is-open="onProgressOpen"
      @update:settings="onProgressSettings"
      @update:bodyweight-kg="emit('update:bodyweightKg', $event)"
      @select-day="emit('select-day', $event)"
    />
  </section>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import ExerciseBlockGroup from '~/components/molecules/ExerciseBlockGroup.vue'
  import ExerciseProgressSheet from '~/components/molecules/ExerciseProgressSheet.vue'
  import type {
    ExerciseLoadSettings,
    ExerciseLog,
    LoadUnit,
    SetLog,
    TrainingDay,
  } from '~/types/training'
  import { groupExercisesByBlock } from '~/utils/groupExercisesByBlock'
  import { findLastSessionLine, findLoadSettings } from '~/utils/trainingLogLookup'

  const props = withDefaults(
    defineProps<{
      trainingDay: TrainingDay | null
      dayKey?: string
      logs?: ExerciseLog[]
      settings?: ExerciseLoadSettings[]
      bodyweightKg?: number | null
    }>(),
    {
      dayKey: '',
      logs: () => [],
      settings: () => [],
      bodyweightKg: null,
    },
  )

  const emit = defineEmits<{
    'update:logs': [value: ExerciseLog[]]
    'update:settings': [value: ExerciseLoadSettings[]]
    'update:bodyweightKg': [value: number | null]
    'select-day': [dayKey: string]
  }>()

  const progressExerciseId = ref<string | null>(null)

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

  const settingsById = computed(() => {
    const map: Record<string, ExerciseLoadSettings> = {}
    for (const exercise of props.trainingDay?.exercises ?? []) {
      map[exercise.id] = findLoadSettings(props.settings, exercise.id)
    }
    return map
  })

  const lastSessionLineById = computed(() => {
    const map: Record<string, string | null> = {}
    for (const exercise of props.trainingDay?.exercises ?? []) {
      const { plateKg } = findLoadSettings(props.settings, exercise.id)
      map[exercise.id] = findLastSessionLine(
        props.logs,
        exercise.id,
        props.dayKey,
        plateKg,
        props.bodyweightKg,
      )
    }
    return map
  })

  const progressExercise = computed(
    () =>
      props.trainingDay?.exercises.find(ex => ex.id === progressExerciseId.value) ??
      null,
  )

  const progressLogs = computed(() =>
    props.logs.filter(log => log.exerciseId === progressExerciseId.value),
  )

  const progressSettings = computed(() =>
    findLoadSettings(props.settings, progressExerciseId.value ?? ''),
  )

  function onUpdateLog(updated: ExerciseLog) {
    emit('update:logs', replaceLog(props.logs, updated))
    const current = findLoadSettings(props.settings, updated.exerciseId)
    const unit = lastDifferingUnit(updated.sets, current.lastUnit)
    if (!unit) return
    emit(
      'update:settings',
      upsertSettings(props.settings, { ...current, lastUnit: unit }),
    )
  }

  function onProgressOpen(open: boolean) {
    if (!open) progressExerciseId.value = null
  }

  function onProgressSettings(next: ExerciseLoadSettings) {
    emit('update:settings', upsertSettings(props.settings, next))
  }

  function replaceLog(list: ExerciseLog[], next: ExerciseLog): ExerciseLog[] {
    const index = list.findIndex(
      log => log.exerciseId === next.exerciseId && log.dayKey === next.dayKey,
    )
    if (index === -1) return [...list, next]
    return list.map((log, i) => (i === index ? next : log))
  }

  function upsertSettings(
    list: ExerciseLoadSettings[],
    next: ExerciseLoadSettings,
  ): ExerciseLoadSettings[] {
    const index = list.findIndex(item => item.exerciseId === next.exerciseId)
    if (index === -1) return [...list, next]
    return list.map((item, i) => (i === index ? next : item))
  }

  function lastDifferingUnit(sets: SetLog[], lastUnit: LoadUnit): LoadUnit | null {
    let found: LoadUnit | null = null
    for (const set of sets) {
      if (set.unit !== lastUnit) found = set.unit
    }
    return found
  }
</script>
