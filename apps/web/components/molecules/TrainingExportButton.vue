<template>
  <div class="relative" ref="rootRef">
    <button
      type="button"
      class="inline-flex items-center gap-2 rounded-full border border-outline-strong bg-surface px-3.5 py-1.5 text-sm font-medium text-content transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
      :aria-expanded="open"
      aria-haspopup="menu"
      @click="open = !open"
    >
      <Download :size="16" class="text-content-secondary" aria-hidden="true" />
      Export
      <ChevronDown :size="14" class="text-content-muted" aria-hidden="true" />
    </button>

    <div
      v-if="open"
      role="menu"
      class="absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-lg border border-outline bg-surface shadow-md"
    >
      <p
        class="border-b border-outline px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-content-muted"
      >
        Rutina en pantalla (4 días A/B)
      </p>
      <button
        type="button"
        role="menuitem"
        class="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-content transition-colors hover:bg-surface-raised"
        @click="exportCurrent('csv')"
      >
        <FileSpreadsheet :size="16" class="text-content-muted" aria-hidden="true" />
        CSV
      </button>
      <button
        type="button"
        role="menuitem"
        class="flex w-full items-center gap-2 border-t border-outline px-3 py-2.5 text-left text-sm text-content transition-colors hover:bg-surface-raised"
        @click="exportCurrent('excel')"
      >
        <Sheet :size="16" class="text-content-muted" aria-hidden="true" />
        Excel
      </button>

      <p
        class="border-t border-outline px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-content-muted"
      >
        Rutina 5 días Empuje / Tracción / Piernas
      </p>
      <button
        type="button"
        role="menuitem"
        class="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-content transition-colors hover:bg-surface-raised"
        @click="exportFiveDay('excel')"
      >
        <Sheet :size="16" class="text-content-muted" aria-hidden="true" />
        Excel · 5 días
      </button>
      <button
        type="button"
        role="menuitem"
        class="flex w-full items-center gap-2 border-t border-outline px-3 py-2.5 text-left text-sm text-content transition-colors hover:bg-surface-raised"
        @click="exportFiveDay('csv')"
      >
        <FileSpreadsheet :size="16" class="text-content-muted" aria-hidden="true" />
        CSV · 5 días
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onClickOutside } from '@vueuse/core'
  import { ChevronDown, Download, FileSpreadsheet, Sheet } from 'lucide-vue-next'
  import { ref } from 'vue'
  import { mockPushPullLegs5DayPlan } from '~/data/mockPushPullLegs5DayPlan'
  import type { WeeklyPlan } from '~/types/training'
  import {
    downloadWeeklyPlanExport,
    type WeeklyExportFormat,
  } from '~/utils/exportWeeklyPlan'

  const props = defineProps<{
    plan: WeeklyPlan
    weekStart: Date
  }>()

  const open = ref(false)
  const rootRef = ref<HTMLElement | null>(null)

  onClickOutside(rootRef, () => {
    open.value = false
  })

  function exportCurrent(format: WeeklyExportFormat) {
    downloadWeeklyPlanExport(props.plan, props.weekStart, format, '4d-ab')
    open.value = false
  }

  function exportFiveDay(format: WeeklyExportFormat) {
    downloadWeeklyPlanExport(
      mockPushPullLegs5DayPlan,
      props.weekStart,
      format,
      '5d-empuje-traccion-piernas',
    )
    open.value = false
  }
</script>
