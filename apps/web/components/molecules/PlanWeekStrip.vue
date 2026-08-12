<template>
  <div class="space-y-3">
    <div class="flex flex-wrap items-center gap-2 sm:gap-3">
      <div class="flex items-center">
        <button
          type="button"
          class="inline-flex h-8 w-8 items-center justify-center rounded-full text-content-secondary transition-colors hover:bg-surface-raised hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
          aria-label="Previous week"
          @click="shiftWeek(-1)"
        >
          <ChevronLeft :size="18" />
        </button>
        <button
          type="button"
          class="inline-flex h-8 w-8 items-center justify-center rounded-full text-content-secondary transition-colors hover:bg-surface-raised hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 disabled:opacity-40 disabled:pointer-events-none"
          aria-label="Next week"
          :disabled="!canGoNext"
          @click="shiftWeek(1)"
        >
          <ChevronRight :size="18" />
        </button>
      </div>
      <p class="text-base font-medium text-content sm:text-lg" aria-live="polite">
        {{ weekLabel }}
      </p>
    </div>

    <div
      class="flex gap-1 sm:gap-2 overflow-x-auto overscroll-x-contain pb-1"
      role="tablist"
      aria-label="Week days"
    >
      <button
        v-for="day in days"
        :key="day.key"
        type="button"
        role="tab"
        class="flex min-w-[2.75rem] flex-1 flex-col items-center gap-1 rounded-xl px-1.5 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
        :class="
          isSelected(day.date)
            ? 'bg-primary-500 text-white'
            : 'text-content-secondary hover:bg-surface-raised'
        "
        :aria-selected="isSelected(day.date)"
        :aria-label="dayAriaLabel(day)"
        @click="selectDay(day.date)"
      >
        <span class="text-[0.65rem] font-medium uppercase tracking-wide">
          {{ day.weekdayShort }}
        </span>
        <span class="text-sm font-semibold tabular-nums">{{ day.dayNumber }}</span>
        <span class="flex h-1.5 items-center justify-center gap-0.5" aria-hidden="true">
          <span
            v-if="showFilledDot(day)"
            class="h-1 w-1 rounded-full"
            :class="isSelected(day.date) ? 'bg-white/90' : 'bg-primary-500'"
          />
          <span
            v-else-if="showHollowRing(day)"
            class="box-border h-1.5 w-1.5 rounded-full border bg-transparent"
            :class="isSelected(day.date) ? 'border-white/90' : 'border-primary-500'"
          />
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
  import { computed } from 'vue'
  import type { Task } from '~/types/task'
  import {
    addDays,
    buildWeekDayCells,
    canGoToNextWeek,
    formatWeekLabel,
    isSameCalendarDay,
    type WeekDayCell,
  } from '~/utils/planWeek'

  type DayLogStatus = 'none' | 'incomplete' | 'logged'

  const props = withDefaults(
    defineProps<{
      scheduledTasks?: Task[]
      dayCounts?: Record<string, number>
      dayStatuses?: Record<string, DayLogStatus>
    }>(),
    { scheduledTasks: () => [] },
  )

  const weekStart = defineModel<Date>('weekStart', { required: true })
  const selectedDay = defineModel<Date>('selectedDay', { required: true })

  const weekLabel = computed(() =>
    formatWeekLabel(weekStart.value, addDays(weekStart.value, 6)),
  )

  const canGoNext = computed(() => canGoToNextWeek(weekStart.value))

  const days = computed(() =>
    buildWeekDayCells(weekStart.value, props.scheduledTasks, props.dayCounts),
  )

  function dayStatus(day: WeekDayCell): DayLogStatus | null {
    if (!props.dayStatuses) return null
    return props.dayStatuses[day.key] ?? 'none'
  }

  function dayAriaLabel(day: WeekDayCell) {
    const base = `${day.weekdayShort} ${day.dayNumber}`
    const status = dayStatus(day)
    if (status === 'incomplete') return `${base} incomplete`
    if (status === 'logged') return `${base} logged`
    return base
  }

  function showFilledDot(day: WeekDayCell) {
    const status = dayStatus(day)
    if (status !== null) return status === 'logged'
    return day.taskCount > 0
  }

  function showHollowRing(day: WeekDayCell) {
    return dayStatus(day) === 'incomplete'
  }

  function isSelected(date: Date) {
    return isSameCalendarDay(date, selectedDay.value)
  }

  function selectDay(date: Date) {
    selectedDay.value = date
  }

  function shiftWeek(delta: number) {
    if (delta > 0 && !canGoNext.value) return
    weekStart.value = addDays(weekStart.value, delta * 7)
  }
</script>
