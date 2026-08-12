<template>
  <div class="mx-auto min-w-0 max-w-7xl px-2 py-6 sm:px-4 lg:px-8">
    <PageHeader :title="plan.title" actions>
      <template #actions>
        <TrainingExportButton :plan="plan" :week-start="weekStart" />
      </template>
    </PageHeader>

    <p class="mt-2 text-xs text-content-muted">Not saved remotely</p>

    <div class="mt-6 space-y-6">
      <PlanWeekStrip
        v-model:week-start="weekStart"
        v-model:selected-day="selectedDay"
        :day-statuses="dayStatuses"
      />
      <TrainingDaySession
        :training-day="selectedTrainingDay"
        :day-key="selectedDayKey"
        :logs="logs"
        :settings="settings"
        :bodyweight-kg="bodyweightKg"
        @update:logs="logs = $event"
        @update:settings="settings = $event"
        @update:bodyweight-kg="bodyweightKg = $event"
        @select-day="onSelectDay"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import PageHeader from '~/components/molecules/PageHeader.vue'
  import PlanWeekStrip from '~/components/molecules/PlanWeekStrip.vue'
  import TrainingDaySession from '~/components/molecules/TrainingDaySession.vue'
  import TrainingExportButton from '~/components/molecules/TrainingExportButton.vue'
  import {
    buildMockLoadSettings,
    buildMockTrainingLogs,
    MOCK_BODYWEIGHT_KG,
  } from '~/data/mockTrainingLogs'
  import { mockWeeklyPlan } from '~/data/mockWeeklyPlan'
  import {
    addDays,
    calendarDayKey,
    defaultSelectedDay,
    isSameCalendarDay,
    startOfWeekMonday,
  } from '~/utils/planWeek'
  import { dayLogStatus, type DayLogStatus } from '~/utils/trainingSetLog'
  import { buildWeekColumns } from '~/utils/trainingWeek'

  definePageMeta({
    title: 'Weekly plan',
    description: 'Weekly strength plan and set log',
  })

  const plan = mockWeeklyPlan
  const weekStart = ref(startOfWeekMonday(new Date()))
  const selectedDay = ref(defaultSelectedDay(weekStart.value))
  const logs = ref(buildMockTrainingLogs(weekStart.value))
  const settings = ref(buildMockLoadSettings())
  const bodyweightKg = ref<number | null>(MOCK_BODYWEIGHT_KG)

  watch(weekStart, start => {
    const inWeek = Array.from({ length: 7 }, (_, i) => addDays(start, i)).some(date =>
      isSameCalendarDay(date, selectedDay.value),
    )
    if (!inWeek) selectedDay.value = defaultSelectedDay(start)
  })

  const selectedDayKey = computed(() => calendarDayKey(selectedDay.value))

  const dayStatuses = computed(() => {
    const statuses: Record<string, DayLogStatus> = {}
    for (let i = 0; i < 7; i++) {
      const key = calendarDayKey(addDays(weekStart.value, i))
      statuses[key] = dayLogStatus(logs.value.filter(log => log.dayKey === key))
    }
    return statuses
  })

  const selectedTrainingDay = computed(() => {
    const columns = buildWeekColumns(weekStart.value, plan)
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
