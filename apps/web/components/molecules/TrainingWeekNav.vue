<template>
  <div class="flex flex-wrap items-center gap-2 sm:gap-3">
    <button
      type="button"
      class="rounded-full border border-outline-strong bg-surface px-3.5 py-1.5 text-sm font-medium text-content transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
      @click="goToCurrentWeek"
    >
      Today
    </button>

    <div class="flex items-center">
      <button
        type="button"
        class="inline-flex h-8 w-8 items-center justify-center rounded-full text-content-secondary transition-colors hover:bg-surface-raised hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        aria-label="Previous week"
        @click="shiftWeek(-1)"
      >
        <ChevronLeft :size="18" />
      </button>
      <button
        type="button"
        class="inline-flex h-8 w-8 items-center justify-center rounded-full text-content-secondary transition-colors hover:bg-surface-raised hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        aria-label="Next week"
        @click="shiftWeek(1)"
      >
        <ChevronRight :size="18" />
      </button>
    </div>

    <p class="text-base font-medium text-content sm:text-lg" aria-live="polite">
      {{ weekLabel }}
    </p>
  </div>
</template>

<script setup lang="ts">
  import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
  import { computed } from 'vue'
  import { addDays, formatWeekLabel, startOfWeekSunday } from '~/utils/trainingWeek'

  const weekStart = defineModel<Date>({ required: true })

  const weekLabel = computed(() => {
    const start = weekStart.value
    const end = addDays(start, 6)
    return formatWeekLabel(start, end)
  })

  function goToCurrentWeek() {
    weekStart.value = startOfWeekSunday(new Date())
  }

  function shiftWeek(delta: number) {
    weekStart.value = addDays(weekStart.value, delta * 7)
  }
</script>
