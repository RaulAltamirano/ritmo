<template>
  <div class="min-h-screen min-w-0 overflow-x-hidden bg-canvas">
    <div class="mx-auto min-w-0 max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader :title="plan.title" actions>
        <template #actions>
          <div
            class="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end"
          >
            <TrainingWeekNav v-model="weekStart" />
            <TrainingExportButton :plan="plan" :week-start="weekStart" />
          </div>
        </template>
      </PageHeader>

      <WeeklyPlanGrid :plan="plan" :week-start="weekStart" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import PageHeader from '~/components/molecules/PageHeader.vue'
  import TrainingExportButton from '~/components/molecules/TrainingExportButton.vue'
  import TrainingWeekNav from '~/components/molecules/TrainingWeekNav.vue'
  import WeeklyPlanGrid from '~/components/organisms/WeeklyPlanGrid.vue'
  import { mockWeeklyPlan } from '~/data/mockWeeklyPlan'
  import { startOfWeekSunday } from '~/utils/trainingWeek'

  definePageMeta({
    title: 'Weekly plan',
    description: 'Read-only weekly strength training plan',
  })

  const plan = mockWeeklyPlan
  const weekStart = ref(startOfWeekSunday(new Date()))
</script>
