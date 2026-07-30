<template>
  <div class="min-w-0 max-w-full">
    <div
      class="flex gap-3 overflow-x-auto overscroll-x-contain pb-2 [-webkit-overflow-scrolling:touch]"
      role="list"
      aria-label="Week days"
    >
      <div
        v-for="(column, index) in columns"
        :key="column.key"
        role="listitem"
        class="w-72 shrink-0 motion-safe:animate-fade-in motion-safe:[animation-fill-mode:backwards] motion-reduce:animate-none sm:w-80"
        :style="dayEnterStyle(index)"
      >
        <TrainingDayColumn :column="column" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import TrainingDayColumn from '~/components/molecules/TrainingDayColumn.vue'
  import type { WeeklyPlan } from '~/types/training'
  import { buildWeekColumns } from '~/utils/trainingWeek'

  const props = defineProps<{
    plan: WeeklyPlan
    weekStart: Date
  }>()

  const columns = computed(() => buildWeekColumns(props.weekStart, props.plan))

  function dayEnterStyle(index: number) {
    return {
      animationDelay: `${index * 40}ms`,
    }
  }
</script>
