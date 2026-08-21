<template>
  <div class="relative inline-block">
    <button
      type="button"
      class="inline-flex min-h-11 items-center gap-2 rounded-full border border-outline-strong bg-surface px-3.5 py-1.5 text-sm font-medium text-content transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:cursor-not-allowed disabled:opacity-55"
      :aria-expanded="open"
      aria-haspopup="menu"
      aria-label="Export"
      :disabled="!plan"
      @click="open = !open"
    >
      <Download :size="16" class="text-content-secondary" aria-hidden="true" />
      <span data-testid="export-label" class="hidden sm:inline">Export</span>
      <ChevronDown :size="14" class="text-content-muted" aria-hidden="true" />
    </button>

    <div
      v-if="open"
      role="menu"
      class="absolute right-0 z-20 mt-2 w-44 rounded-xl border border-outline bg-surface-raised p-1 shadow-lg"
    >
      <button
        type="button"
        role="menuitem"
        class="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-medium text-content transition-colors hover:bg-surface"
        @click="downloadCsv"
      >
        <FileSpreadsheet :size="16" class="text-content-secondary" aria-hidden="true" />
        CSV
      </button>
      <button
        type="button"
        role="menuitem"
        class="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-medium text-content transition-colors hover:bg-surface"
        @click="downloadExcel"
      >
        <FileSpreadsheet :size="16" class="text-content-secondary" aria-hidden="true" />
        Excel
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ChevronDown, Download, FileSpreadsheet } from 'lucide-vue-next'
  import { ref } from 'vue'
  import type { WeeklyPlan } from '~/types/training'
  import { buildWeeklyPlanCsv } from '~/utils/exportWeeklyPlanCsv'
  import { downloadWeeklyPlanExport } from '~/utils/exportWeeklyPlan'

  const props = defineProps<{
    plan: WeeklyPlan | null
    weekStart: Date
  }>()

  const open = ref(false)

  function closeMenu() {
    open.value = false
  }

  function downloadCsv() {
    if (!props.plan) return
    const content = buildWeeklyPlanCsv(props.plan, props.weekStart)
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `ritmo-semana-${formatDate(props.weekStart)}.csv`
    link.rel = 'noopener'
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    closeMenu()
  }

  function downloadExcel() {
    if (!props.plan) return
    downloadWeeklyPlanExport(props.plan, props.weekStart)
    closeMenu()
  }

  function formatDate(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
</script>
