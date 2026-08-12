<template>
  <BaseModal
    :is-open="isOpen"
    :title="exerciseName"
    size="lg"
    position="bottom"
    close-on-escape
    close-on-backdrop-click
    show-close-button
    @update:is-open="onIsOpenUpdate"
  >
    <div class="flex flex-col gap-4">
      <div class="flex flex-wrap items-baseline justify-between gap-2">
        <p v-if="latestNative" class="text-sm text-content-secondary">
          {{ latestNative }}
        </p>
        <p
          v-if="loadDelta"
          class="font-mono text-lg font-semibold tabular-nums text-content"
        >
          {{ loadDelta }}
        </p>
      </div>

      <div class="flex flex-wrap gap-1" role="group" aria-label="Progress metric">
        <button
          v-for="option in METRICS"
          :key="option.id"
          type="button"
          class="min-h-11 rounded-md border px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          :class="
            metric === option.id
              ? 'border-brand bg-brand-subtle text-brand-text'
              : 'border-outline text-content-secondary'
          "
          :aria-pressed="metric === option.id"
          @click="metric = option.id"
        >
          {{ option.label }}
        </button>
      </div>

      <div
        v-for="warning in warnings"
        :key="warning.key"
        role="status"
        class="flex flex-col gap-2 rounded-lg border border-outline bg-surface p-3"
      >
        <p class="text-sm text-content">{{ warning.message }}</p>
        <label class="flex flex-col gap-1 text-sm text-content-secondary">
          {{ warning.label }}
          <input
            type="number"
            inputmode="decimal"
            min="0"
            step="0.5"
            class="min-h-11 w-full rounded-md border border-outline bg-surface px-2 tabular-nums text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            :value="warning.value"
            @input="warning.onInput"
          />
        </label>
      </div>

      <div v-if="logs.length === 0" class="flex flex-col items-start gap-3 py-2">
        <p class="text-sm text-content-secondary">
          No sets logged for this exercise yet
        </p>
        <button
          type="button"
          class="min-h-11 rounded-md border border-outline px-3 text-sm font-medium text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          @click="onBack"
        >
          Back to session
        </button>
      </div>

      <svg
        v-if="drawChart"
        viewBox="0 0 320 120"
        class="h-auto w-full text-brand"
        role="img"
        :aria-label="chartAriaLabel"
      >
        <polyline
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          :points="chartPoints"
        />
        <circle
          v-for="(pt, index) in chartDots"
          :key="index"
          :cx="pt.cx"
          :cy="pt.cy"
          r="4"
          fill="currentColor"
        />
      </svg>

      <div v-else-if="logs.length > 0" class="grid grid-cols-3 gap-2">
        <div
          v-for="card in cards"
          :key="card.label"
          class="rounded-lg border border-outline bg-surface p-3"
        >
          <p class="text-xs text-content-secondary">{{ card.label }}</p>
          <p class="font-mono text-lg tabular-nums text-content">
            {{ card.value }}
          </p>
        </div>
      </div>

      <table class="w-full text-left text-sm text-content">
        <caption class="mb-2 text-left text-xs font-medium text-content-secondary">
          Session history
        </caption>
        <thead>
          <tr class="border-b border-outline text-content-secondary">
            <th class="py-1.5 pr-2 font-medium">Date</th>
            <th class="py-1.5 pr-2 font-medium">Reps</th>
            <th class="py-1.5 pr-2 font-medium">RPE</th>
            <th class="py-1.5 pr-2 font-medium">Load</th>
            <th class="py-1.5 font-medium">kg</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.dayKey" class="border-b border-outline/60">
            <td class="py-1.5 pr-2 tabular-nums">{{ row.dayKey }}</td>
            <td class="py-1.5 pr-2 tabular-nums">{{ row.reps }}</td>
            <td class="py-1.5 pr-2 tabular-nums">{{ row.rpe }}</td>
            <td class="py-1.5 pr-2 tabular-nums">{{ row.load }}</td>
            <td class="py-1.5 tabular-nums">{{ row.kg }}</td>
          </tr>
        </tbody>
      </table>

      <ul v-if="logs.length > 0" class="flex flex-col gap-1">
        <li v-for="log in newestLogs" :key="log.dayKey">
          <button
            type="button"
            class="flex min-h-11 w-full items-center justify-between gap-2 rounded-md px-2 text-left text-sm text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            @click="emit('select-day', log.dayKey)"
          >
            <span class="tabular-nums text-content-secondary">{{ log.dayKey }}</span>
            <span class="tabular-nums">{{
              compactSets(log, settings.plateKg, bodyweightKg)
            }}</span>
          </button>
        </li>
      </ul>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
  import BaseModal from '@ritmo/ui/components/atoms/interactive/BaseModal.vue'
  import { computed, ref } from 'vue'
  import type { ExerciseLoadSettings, ExerciseLog } from '~/types/training'
  import {
    bestMetricPoint,
    chartCircles,
    chartMetricValues,
    compactSets,
    historyRows,
    logsNewestFirst,
    logsUseUnit,
    parseKgInput,
    previousConvertible,
    rowBestSet,
    sessionPoints,
    statCards,
    todayConvertible,
  } from '~/utils/trainingChart'
  import { formatNativeLoad } from '~/utils/trainingLoad'
  import type { ProgressMetric } from '~/utils/trainingSessionMetrics'
  import { formatLoadDelta, shouldDrawLineChart } from '~/utils/trainingSessionMetrics'

  const METRICS: { id: ProgressMetric; label: string }[] = [
    { id: 'load', label: 'Load' },
    { id: 'performance', label: 'Performance' },
    { id: 'volume', label: 'Volume' },
  ]

  const props = defineProps<{
    isOpen: boolean
    exerciseName: string
    logs: ExerciseLog[]
    todayKey: string
    settings: ExerciseLoadSettings
    bodyweightKg: number | null
  }>()

  const emit = defineEmits<{
    'update:isOpen': [value: boolean]
    'update:settings': [value: ExerciseLoadSettings]
    'update:bodyweightKg': [value: number | null]
    'select-day': [dayKey: string]
  }>()

  const metric = ref<ProgressMetric>('load')

  function onIsOpenUpdate(value: boolean) {
    emit('update:isOpen', value)
  }

  function onBack() {
    emit('update:isOpen', false)
  }

  function onPlateKg(event: Event) {
    const plateKg = parseKgInput((event.target as HTMLInputElement).value)
    emit('update:settings', { ...props.settings, plateKg })
  }

  function onBodyweight(event: Event) {
    emit('update:bodyweightKg', parseKgInput((event.target as HTMLInputElement).value))
  }

  const points = computed(() =>
    sessionPoints(props.logs, props.settings.plateKg, props.bodyweightKg),
  )
  const newestLogs = computed(() => logsNewestFirst(props.logs))
  const drawChart = computed(() => shouldDrawLineChart(points.value))
  const chartDots = computed(() =>
    chartCircles(chartMetricValues(points.value, metric.value)),
  )
  const chartPoints = computed(() =>
    chartDots.value.map(pt => `${pt.cx},${pt.cy}`).join(' '),
  )
  const chartAriaLabel = computed(() => {
    const label = METRICS.find(option => option.id === metric.value)?.label
    return `${label} over ${chartDots.value.length} sessions`
  })
  const todayPoint = computed(() => todayConvertible(points.value, props.todayKey))
  const previousPoint = computed(() =>
    previousConvertible(points.value, props.todayKey),
  )
  const bestPoint = computed(() => bestMetricPoint(points.value, metric.value))
  const loadDelta = computed(() => {
    const todayKg = todayPoint.value?.kgEq
    const prevKg = previousPoint.value?.kgEq
    if (typeof todayKg !== 'number' || typeof prevKg !== 'number') return null
    return formatLoadDelta(todayKg, prevKg)
  })
  const latestNative = computed(() => {
    const newest = newestLogs.value[0]
    if (!newest) return null
    const set = rowBestSet(newest, props.settings.plateKg, props.bodyweightKg)
    return set ? formatNativeLoad(set.load, set.unit) : null
  })
  const warnings = computed(() => {
    const items: {
      key: string
      message: string
      label: string
      value: number | ''
      onInput: (event: Event) => void
    }[] = []
    if (logsUseUnit(props.logs, 'plates') && props.settings.plateKg === null) {
      items.push({
        key: 'plate',
        message: 'Set plate weight to see kg',
        label: '1 plate = kg',
        value: props.settings.plateKg ?? '',
        onInput: onPlateKg,
      })
    }
    if (logsUseUnit(props.logs, 'bw') && props.bodyweightKg === null) {
      items.push({
        key: 'bw',
        message: 'Save body weight to see kg',
        label: 'Body weight (kg)',
        value: props.bodyweightKg ?? '',
        onInput: onBodyweight,
      })
    }
    return items
  })
  const cards = computed(() =>
    statCards(todayPoint.value, previousPoint.value, bestPoint.value, metric.value),
  )
  const rows = computed(() =>
    historyRows(props.logs, props.settings.plateKg, props.bodyweightKg),
  )
</script>
