<template>
  <div class="mx-auto min-w-0 max-w-7xl px-2 py-6 sm:px-4 lg:px-8">
    <PageHeader :title="plan.title" actions>
      <template #actions>
        <TrainingExportButton :plan="plan" :week-start="weekStart" />
      </template>
    </PageHeader>

    <div class="mt-6 space-y-6">
      <PlanWeekStrip
        v-model:week-start="weekStart"
        v-model:selected-day="selectedDay"
        :day-counts="sessionCounts"
      />
      <TrainingDaySession :training-day="selectedTrainingDay" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import PageHeader from '~/components/molecules/PageHeader.vue'
  import PlanWeekStrip from '~/components/molecules/PlanWeekStrip.vue'
  import TrainingDaySession from '~/components/molecules/TrainingDaySession.vue'
  import TrainingExportButton from '~/components/molecules/TrainingExportButton.vue'
  import { mockWeeklyPlan } from '~/data/mockWeeklyPlan'
  import {
    defaultSelectedDay,
    isSameCalendarDay,
    startOfWeekMonday,
  } from '~/utils/planWeek'
  import {
    buildWeekColumns,
    sessionCountByDayKey,
  } from '~/utils/trainingWeek'

  definePageMeta({
    title: 'Weekly plan',
    description: 'Read-only weekly strength training plan',
  })

  const plan = mockWeeklyPlan
  const weekStart = ref(startOfWeekMonday(new Date()))
  const selectedDay = ref(defaultSelectedDay(weekStart.value))

  watch(weekStart, start => {
    selectedDay.value = defaultSelectedDay(start)
  })

  const sessionCounts = computed(() =>
    sessionCountByDayKey(weekStart.value, plan),
  )

  const selectedTrainingDay = computed(() => {
    const columns = buildWeekColumns(weekStart.value, plan)
    const column = columns.find(c => isSameCalendarDay(c.date, selectedDay.value))
    return column?.trainingDay ?? null
  })
</script>
