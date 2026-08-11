<template>
  <div
    v-if="hasMeta"
    class="plan-task-meta"
    :class="dense ? 'plan-task-meta--dense' : ''"
    data-testid="plan-task-meta"
  >
    <span
      v-if="timerMinutes != null"
      class="plan-task-meta__chip"
      tabindex="0"
      role="img"
      :aria-label="timerAria"
    >
      <Timer class="plan-task-meta__icon" aria-hidden="true" />
      <span class="plan-task-meta__text">{{ timerLabel }}</span>
      <span class="plan-task-meta__tip" role="tooltip">{{ timerTip }}</span>
    </span>

    <span
      v-if="technique"
      class="plan-task-meta__chip"
      :class="dense ? 'plan-task-meta__chip--icon-only' : ''"
      tabindex="0"
      role="img"
      :aria-label="techniqueAria"
      data-testid="plan-task-technique"
    >
      <component
        :is="technique.icon"
        class="plan-task-meta__icon"
        aria-hidden="true"
      />
      <span
        v-if="!dense"
        class="plan-task-meta__text plan-task-meta__text--technique"
      >
        {{ technique.label }}
      </span>
      <span class="plan-task-meta__tip" role="tooltip">
        <strong class="plan-task-meta__tip-title">{{ technique.label }}</strong>
        {{ technique.tooltip }}
      </span>
    </span>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { Timer } from 'lucide-vue-next'
  import type { Task } from '~/types/task'
  import {
    formatPlanTimerLabel,
    planTimerTooltip,
    resolveStudyTechnique,
    taskDurationMinutes,
  } from '~/utils/studyTechniques'

  const props = withDefaults(
    defineProps<{
      task: Task
      /** Timeline: icon-only technique; unscheduled: icon + short label. */
      dense?: boolean
    }>(),
    { dense: false },
  )

  const technique = computed(() => resolveStudyTechnique(props.task))
  const timerMinutes = computed(() => taskDurationMinutes(props.task))
  const timerLabel = computed(() =>
    timerMinutes.value != null ? formatPlanTimerLabel(timerMinutes.value) : '',
  )
  const timerTip = computed(() =>
    timerMinutes.value != null ? planTimerTooltip(timerMinutes.value) : '',
  )
  const timerAria = computed(() =>
    timerMinutes.value != null
      ? `Focus time: ${formatPlanTimerLabel(timerMinutes.value)}. ${timerTip.value}`
      : '',
  )
  const techniqueAria = computed(() =>
    technique.value
      ? `Study technique: ${technique.value.label}. ${technique.value.tooltip}`
      : '',
  )
  const hasMeta = computed(
    () => timerMinutes.value != null || technique.value != null,
  )
</script>

<style scoped>
  .plan-task-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.375rem 0.625rem;
    margin-top: 0.25rem;
  }

  .plan-task-meta--dense {
    margin-top: 0.1875rem;
  }

  .plan-task-meta__chip {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    min-height: 1.75rem;
    max-width: 100%;
    color: var(--color-content-secondary, #94a3b8);
    border-radius: 0.375rem;
    outline: none;
    cursor: help;
    transition:
      color 0.15s ease,
      background-color 0.15s ease;
  }

  .plan-task-meta__chip:hover,
  .plan-task-meta__chip:focus-visible {
    color: var(--color-primary-500, #14b8a6);
    background: rgba(20, 184, 166, 0.08);
  }

  .plan-task-meta__chip:focus-visible {
    box-shadow: 0 0 0 2px var(--color-primary-500, #14b8a6);
  }

  .plan-task-meta__chip--icon-only {
    justify-content: center;
    min-width: 1.75rem;
    padding: 0.125rem;
  }

  .plan-task-meta__icon {
    width: 0.875rem;
    height: 0.875rem;
    flex-shrink: 0;
  }

  .plan-task-meta__text {
    font-size: 0.75rem;
    line-height: 1.25;
    white-space: nowrap;
  }

  .plan-task-meta__text--technique {
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 10rem;
  }

  .plan-task-meta__tip {
    position: absolute;
    left: 0;
    bottom: calc(100% + 0.4rem);
    z-index: 30;
    width: max-content;
    max-width: min(16rem, 70vw);
    padding: 0.5rem 0.625rem;
    border-radius: 0.5rem;
    border: 1px solid rgba(148, 163, 184, 0.25);
    background: rgba(15, 23, 42, 0.96);
    color: #f8fafc;
    font-size: 0.6875rem;
    font-weight: 400;
    line-height: 1.4;
    white-space: normal;
    text-align: left;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transform: translateY(2px);
    transition:
      opacity 0.15s ease,
      transform 0.15s ease,
      visibility 0.15s ease;
  }

  .plan-task-meta__tip-title {
    display: block;
    margin-bottom: 0.125rem;
    font-weight: 600;
    color: #5eead4;
  }

  .plan-task-meta__chip:hover .plan-task-meta__tip,
  .plan-task-meta__chip:focus-visible .plan-task-meta__tip {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  @media (prefers-reduced-motion: reduce) {
    .plan-task-meta__chip,
    .plan-task-meta__tip {
      transition: none;
    }

    .plan-task-meta__chip:hover .plan-task-meta__tip,
    .plan-task-meta__chip:focus-visible .plan-task-meta__tip {
      transform: none;
    }
  }
</style>
