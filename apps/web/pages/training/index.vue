<template>
  <div class="mx-auto min-w-0 max-w-7xl px-2 py-6 sm:px-4 lg:px-8">
    <PageHeader :title="plan?.title ?? 'Weekly plan'" actions>
      <template #actions>
        <div class="flex items-center gap-2">
          <TrainingExportButton v-if="plan" :plan="plan" :week-start="weekStart" />
          <PlanAiWeekGenerator @open="generateModalOpen = true" />
        </div>
      </template>
    </PageHeader>

    <div class="mt-6 space-y-6">
      <PlanWeekStrip
        v-model:week-start="weekStart"
        v-model:selected-day="selectedDay"
        :day-statuses="dayStatuses"
      />
      <TrainingDaySession
        v-if="plan"
        :training-day="selectedTrainingDay"
        :day-key="selectedDayKey"
        :logs="logs"
        :settings="settings"
        :bodyweight-kg="bodyweightKg"
        :session-check="currentCheck"
        :is-today="isToday"
        @update:logs="onUpdateLogs"
        @update:settings="settings = $event"
        @update:bodyweight-kg="bodyweightKg = $event"
        @update:session-check="onUpdateSessionCheck"
        @select-day="onSelectDay"
      />
      <section
        v-else
        class="rounded-2xl border border-dashed border-outline bg-surface/60 px-6 py-12 text-center"
        aria-label="Rest day"
      >
        <h2 class="text-base font-semibold text-content">Rest day</h2>
        <p class="mt-2 text-sm text-content-secondary">
          There is no training week for these dates yet.
        </p>
        <div class="mt-5 flex justify-center">
          <PlanAiWeekGenerator @open="generateModalOpen = true" />
        </div>
      </section>
    </div>

    <TrainingGenerateWeekModal
      v-model:is-open="generateModalOpen"
      :week-start="weekStart"
      @applied="generateModalOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
  import { storeToRefs } from 'pinia'
  import { computed, ref, watch } from 'vue'
  import PageHeader from '~/components/molecules/PageHeader.vue'
  import PlanAiWeekGenerator from '~/components/molecules/PlanAiWeekGenerator.vue'
  import PlanWeekStrip from '~/components/molecules/PlanWeekStrip.vue'
  import TrainingDaySession from '~/components/molecules/TrainingDaySession.vue'
  import TrainingExportButton from '~/components/molecules/TrainingExportButton.vue'
  import TrainingGenerateWeekModal from '~/components/organisms/TrainingGenerateWeekModal.vue'
  import { buildMockLoadSettings, MOCK_BODYWEIGHT_KG } from '~/data/mockTrainingLogs'
  import { useTrainingStore } from '~/stores/training'
  import type { ExerciseLog, TrainingSessionCheck } from '~/types/training'
  import {
    addDays,
    calendarDayKey,
    defaultSelectedDay,
    isSameCalendarDay,
    startOfWeekMonday,
  } from '~/utils/planWeek'
  import { findSessionCheck, upsertSessionCheck } from '~/utils/trainingSessionCheck'
  import { dayLogStatus, type DayLogStatus } from '~/utils/trainingSetLog'
  import { buildWeekColumns } from '~/utils/trainingWeek'

  definePageMeta({
    title: 'Weekly plan',
    description: 'Weekly strength plan and set log',
  })

  const trainingStore = useTrainingStore()
  const { logs, sessionChecks, week: plan } = storeToRefs(trainingStore)
  const weekStart = ref(startOfWeekMonday(new Date()))
  const selectedDay = ref(defaultSelectedDay(weekStart.value))
  const generateModalOpen = ref(false)
  const settings = ref(buildMockLoadSettings())
  const bodyweightKg = ref<number | null>(MOCK_BODYWEIGHT_KG)

  watch(
    weekStart,
    start => {
      trainingStore.clearWeekData()
      const inWeek = Array.from({ length: 7 }, (_, i) => addDays(start, i)).some(date =>
        isSameCalendarDay(date, selectedDay.value),
      )
      if (!inWeek) selectedDay.value = defaultSelectedDay(start)
      const dayKeys = Array.from({ length: 7 }, (_, i) =>
        calendarDayKey(addDays(start, i)),
      )
      void Promise.all([
        trainingStore.loadWeek(dayKeys[0]!),
        trainingStore.loadLogs(dayKeys[0]!, dayKeys[6]!),
        trainingStore.loadSessionChecks(dayKeys),
      ]).catch(() => undefined)
    },
    { immediate: true },
  )

  const selectedDayKey = computed(() => calendarDayKey(selectedDay.value))

  const isToday = computed(() => isSameCalendarDay(selectedDay.value, new Date()))

  const currentCheck = computed(() =>
    findSessionCheck(sessionChecks.value, selectedDayKey.value),
  )

  function onUpdateLogs(next: ExerciseLog[]) {
    const changed = next.filter(nextLog => {
      const current = logs.value.find(
        log => log.dayKey === nextLog.dayKey && log.exerciseId === nextLog.exerciseId,
      )
      return current !== nextLog
    })
    logs.value = next
    if (changed.length) void trainingStore.saveLogs(changed).catch(() => undefined)
  }

  function onUpdateSessionCheck(next: TrainingSessionCheck) {
    sessionChecks.value = upsertSessionCheck(sessionChecks.value, next)
    void trainingStore.saveSessionCheck(next).catch(() => undefined)
  }

  const dayStatuses = computed(() => {
    const statuses: Record<string, DayLogStatus> = {}
    for (let i = 0; i < 7; i++) {
      const key = calendarDayKey(addDays(weekStart.value, i))
      statuses[key] = dayLogStatus(logs.value.filter(log => log.dayKey === key))
    }
    return statuses
  })

  const selectedTrainingDay = computed(() => {
    if (!plan.value) return null
    const columns = buildWeekColumns(weekStart.value, plan.value)
    const column = columns.find(c => isSameCalendarDay(c.date, selectedDay.value))
    return column?.trainingDay ?? null
  })

  function onSelectDay(dayKey: string) {
    const [year, month, day] = dayKey.split('-').map(Number)
    const date = new Date(year ?? 0, (month ?? 1) - 1, day ?? 1)
    weekStart.value = startOfWeekMonday(date)
    selectedDay.value = date
  }
</script>
