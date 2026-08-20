<template>
  <section :aria-label="sectionLabel">
    <div v-if="!trainingDay" class="py-14 text-center" role="status">
      <div class="mb-3 text-3xl leading-none text-gray-300 dark:text-gray-700">◎</div>
      <p class="mb-1 text-sm text-gray-400 dark:text-gray-500">Rest day</p>
      <p class="text-xs text-gray-300 dark:text-gray-700">
        No session planned for this day
      </p>
    </div>
    <div v-else class="space-y-3">
      <header class="flex flex-wrap items-center justify-between gap-3">
        <h2 class="text-base font-semibold text-content" :class="titleClass">
          {{ trainingDay.name }}
        </h2>
        <TrainingSessionCheckBar
          :session-check="currentCheck"
          :planned-complete="plannedComplete"
          @check-in="openPhase('start')"
          @finish-session="openPhase('end')"
        />
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
    <TrainingSessionFeedbackModal
      :is-open="feedbackOpen"
      :phase="feedbackPhase"
      :session-name="trainingDay?.name ?? ''"
      :start-strength="currentCheck.start?.strength ?? null"
      @update:is-open="onFeedbackOpen"
      @skip="onFeedbackSkip"
      @submit="onFeedbackSubmit"
    />
  </section>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useTrainingSessionCheckUi } from '~/composables/useTrainingSessionCheckUi'
  import ExerciseBlockGroup from '~/components/molecules/ExerciseBlockGroup.vue'
  import ExerciseProgressSheet from '~/components/molecules/ExerciseProgressSheet.vue'
  import TrainingSessionCheckBar from '~/components/molecules/TrainingSessionCheckBar.vue'
  import TrainingSessionFeedbackModal from '~/components/molecules/TrainingSessionFeedbackModal.vue'
  import type {
    ExerciseLoadSettings,
    ExerciseLog,
    LoadUnit,
    SetLog,
    TrainingDay,
    TrainingSessionCheck,
  } from '~/types/training'
  import { groupExercisesByBlock } from '~/utils/groupExercisesByBlock'
  import { findExerciseLog, findLastSessionLine, findLoadSettings } from '~/utils/trainingLogLookup'
  import { emptySessionCheck } from '~/utils/trainingSessionCheck'

  const props = withDefaults(
    defineProps<{
      trainingDay: TrainingDay | null
      dayKey?: string
      logs?: ExerciseLog[]
      settings?: ExerciseLoadSettings[]
      bodyweightKg?: number | null
      sessionCheck?: TrainingSessionCheck
      isToday?: boolean
    }>(),
    {
      dayKey: '',
      logs: () => [],
      settings: () => [],
      bodyweightKg: null,
      sessionCheck: undefined,
      isToday: false,
    },
  )

  const emit = defineEmits<{
    'update:logs': [value: ExerciseLog[]]
    'update:settings': [value: ExerciseLoadSettings[]]
    'update:bodyweightKg': [value: number | null]
    'select-day': [dayKey: string]
    'update:sessionCheck': [value: TrainingSessionCheck]
  }>()

  const progressExerciseId = ref<string | null>(null)

  const sectionLabel = computed(() =>
    props.trainingDay ? props.trainingDay.name : 'Rest day',
  )
  const currentCheck = computed(
    () => props.sessionCheck ?? emptySessionCheck(props.dayKey),
  )
  const {
    feedbackOpen,
    feedbackPhase,
    plannedComplete,
    openPhase,
    onFeedbackOpen,
    onFeedbackSkip,
    onFeedbackSubmit,
  } = useTrainingSessionCheckUi({
    trainingDay: () => props.trainingDay,
    dayKey: () => props.dayKey,
    logs: () => props.logs,
    isToday: () => props.isToday,
    currentCheck,
    emitUpdate: check => emit('update:sessionCheck', check),
  })

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
    const previous = findExerciseLog(props.logs, updated.exerciseId, updated.dayKey)
    emit('update:logs', replaceLog(props.logs, updated))
    const current = findLoadSettings(props.settings, updated.exerciseId)
    const unit = lastChangedSetUnit(
      previous?.sets ?? [],
      updated.sets,
      current.lastUnit,
    )
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

  function lastChangedSetUnit(
    previous: SetLog[],
    next: SetLog[],
    lastUnit: LoadUnit,
  ): LoadUnit | null {
    let found: LoadUnit | null = null
    for (const set of next) {
      const prior = previous.find(item => item.id === set.id)
      const from = prior?.unit ?? lastUnit
      if (set.unit !== from) found = set.unit
    }
    return found
  }
</script>
