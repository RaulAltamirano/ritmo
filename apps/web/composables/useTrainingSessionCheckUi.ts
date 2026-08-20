import type { ComputedRef } from 'vue'
import { computed, ref, watch } from 'vue'
import type {
  ExerciseLog,
  TrainingDay,
  TrainingSessionCheck,
  TrainingSessionFeedbackSubmit,
} from '~/types/training'
import {
  isPlannedSessionComplete,
  saveSessionCheckEnd,
  saveSessionCheckStart,
  skipSessionCheckPhase,
} from '~/utils/trainingSessionCheck'

interface TrainingSessionCheckUiOptions {
  trainingDay: () => TrainingDay | null
  dayKey: () => string
  logs: () => ExerciseLog[]
  isToday: () => boolean
  currentCheck: ComputedRef<TrainingSessionCheck>
  emitUpdate: (check: TrainingSessionCheck) => void
}

export function useTrainingSessionCheckUi(options: TrainingSessionCheckUiOptions) {
  const feedbackOpen = ref(false)
  const feedbackPhase = ref<'start' | 'end'>('start')
  const plannedComplete = computed(() =>
    isPlannedSessionComplete(options.trainingDay(), options.logs(), options.dayKey()),
  )

  function openPhase(phase: 'start' | 'end') {
    if (phase === 'start' && options.currentCheck.value.startStatus === 'saved') return
    if (phase === 'end' && options.currentCheck.value.endStatus === 'saved') return
    feedbackPhase.value = phase
    feedbackOpen.value = true
  }

  function onFeedbackOpen(open: boolean) {
    if (!open && feedbackOpen.value) {
      onFeedbackSkip()
      return
    }
    feedbackOpen.value = open
  }

  function onFeedbackSkip() {
    feedbackOpen.value = false
    options.emitUpdate(
      skipSessionCheckPhase(options.currentCheck.value, feedbackPhase.value),
    )
  }

  function onFeedbackSubmit(payload: TrainingSessionFeedbackSubmit) {
    feedbackOpen.value = false
    const next =
      payload.phase === 'start'
        ? saveSessionCheckStart(options.currentCheck.value, payload.check)
        : saveSessionCheckEnd(options.currentCheck.value, payload.check)
    options.emitUpdate(next)
  }

  let observedDayKey = options.dayKey()

  watch(
    [
      options.dayKey,
      options.isToday,
      () => options.trainingDay()?.id,
      () => options.currentCheck.value.startStatus,
      () => options.currentCheck.value.endStatus,
      plannedComplete,
    ],
    () => {
      const dayKey = options.dayKey()
      if (dayKey !== observedDayKey) {
        feedbackOpen.value = false
        observedDayKey = dayKey
      }

      if (!options.isToday() || !options.trainingDay()) return
      if (options.currentCheck.value.startStatus === 'none') {
        openPhase('start')
        return
      }
      if (feedbackOpen.value && feedbackPhase.value === 'start') return
      if (plannedComplete.value && options.currentCheck.value.endStatus === 'none') {
        openPhase('end')
      }
    },
    { immediate: true },
  )

  return {
    feedbackOpen,
    feedbackPhase,
    plannedComplete,
    openPhase,
    onFeedbackOpen,
    onFeedbackSkip,
    onFeedbackSubmit,
  }
}
