<template>
  <div class="canvas">
    <div class="wrapper">
      <TodayHeader
        :phase-data="phaseData"
        :phase-loading="phaseLoading"
        @toggle-filters="$emit('toggle-filters')"
      />
      <TodayContent
        :tasks="tasks"
        :is-quick-task-loading="isQuickTaskLoading"
        @create-task="$emit('create-task', $event)"
        @delete-task="$emit('delete-task', $event)"
        @request-complete="handleRequestComplete"
        @reorder-tasks="$emit('reorder-tasks', $event)"
        @update-task="$emit('update-task', $event)"
        @add-note="(taskId, note) => $emit('add-note', taskId, note)"
      />
    </div>

    <TodayTaskFeedbackModal
      :is-open="isFeedbackModalOpen"
      :task="selectedTaskForCompletion"
      :loading="pendingFeedbackSubmit"
      :error="feedbackError"
      @update:is-open="handleModalVisibilityChange"
      @close="handleModalClose"
      @submit="handleFeedbackSubmit"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import type { Task, TaskCompletionFeedback } from '../../../types/task'
  import TodayContent from './TodayContent.vue'
  import TodayTaskFeedbackModal from './TodayTaskFeedbackModal.vue'
  import TodayHeader from './TodayHeader.vue'

  interface Props {
    tasks: Task[]
    isQuickTaskLoading: boolean
    phaseData?: any
    phaseLoading?: boolean
  }

  defineProps<Props>()

  const emit = defineEmits<{
    (e: 'toggle-filters'): void
    (e: 'create-task', taskName: string): void
    (e: 'request-complete', task: Task): void
    (
      e: 'complete-task-with-feedback',
      task: Task,
      feedback: TaskCompletionFeedback,
      resolve: () => void,
      reject: (error?: Error) => void,
    ): void
    (e: 'delete-task', taskId: string): void
    (e: 'reorder-tasks', tasks: Task[]): void
    (e: 'update-task', task: Task): void
    (e: 'add-note', taskId: string, note: string): void
  }>()

  const selectedTaskForCompletion = ref<Task | null>(null)
  const isFeedbackModalOpen = ref(false)
  const pendingFeedbackSubmit = ref(false)
  const feedbackError = ref<string | null>(null)

  const resetFeedbackState = () => {
    selectedTaskForCompletion.value = null
    isFeedbackModalOpen.value = false
    pendingFeedbackSubmit.value = false
    feedbackError.value = null
  }

  const handleRequestComplete = (task: Task) => {
    emit('request-complete', task)
    selectedTaskForCompletion.value = task
    feedbackError.value = null
    isFeedbackModalOpen.value = true
  }

  const handleModalVisibilityChange = (isOpen: boolean) => {
    if (isOpen) {
      isFeedbackModalOpen.value = true
      return
    }

    handleModalClose()
  }

  const handleModalClose = () => {
    if (pendingFeedbackSubmit.value) return
    resetFeedbackState()
  }

  const handleFeedbackSubmit = async (feedback: TaskCompletionFeedback) => {
    if (!selectedTaskForCompletion.value || pendingFeedbackSubmit.value) return

    pendingFeedbackSubmit.value = true
    feedbackError.value = null

    try {
      await new Promise<void>((resolve, reject) => {
        emit(
          'complete-task-with-feedback',
          selectedTaskForCompletion.value as Task,
          feedback,
          resolve,
          error => reject(error ?? new Error('No se pudo completar la tarea')),
        )
      })

      resetFeedbackState()
    } catch (error) {
      feedbackError.value =
        error instanceof Error ? error.message : 'No se pudo completar la tarea'
    } finally {
      pendingFeedbackSubmit.value = false
    }
  }
</script>

<style>
  .canvas {
    min-height: 100vh;
    position: relative;
    background-color: #f7f6f3;
    overflow-x: hidden;
    overflow-y: visible;
    border-bottom: none;
    outline: none;
    box-shadow: none;
  }

  .dark .canvas {
    background-color: #141418;
  }

  /*
   * Fade grain + glow at TOP (under fixed nav) and BOTTOM.
   * Bottom seam: ::after radial sits low (white tint) and reads as a horizontal line above whatever is below the canvas.
   */
  .canvas::before,
  .canvas::after {
    -webkit-mask-image: linear-gradient(
      to bottom,
      transparent 0,
      black 5.25rem,
      black max(5.25rem, calc(100% - 5.25rem)),
      transparent 100%
    );
    mask-image: linear-gradient(
      to bottom,
      transparent 0,
      black 5.25rem,
      black max(5.25rem, calc(100% - 5.25rem)),
      transparent 100%
    );
    mask-repeat: no-repeat;
    mask-size: 100% 100%;
  }

  /* Paper grain texture */
  .canvas::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n' x='0' y='0'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");
    background-repeat: repeat;
    opacity: 0.04;
    pointer-events: none;
    z-index: 0;
  }

  .dark .canvas::before {
    opacity: 0.03;
  }

  /*
   * Breathing glow — opacity only (no scale).
   */
  .canvas::after {
    content: '';
    position: absolute;
    inset: 0;
    /* Centered — avoids brightening the bottom edge (was ~82% Y → visible “line” at end of .canvas) */
    background: radial-gradient(ellipse 70% 45% at 50% 42%, rgba(255, 255, 255, 0.06) 0%, transparent 68%);
    animation: breathe-glow 75s ease-in-out infinite;
    pointer-events: none;
    z-index: 0;
  }

  .dark .canvas::after {
    background: radial-gradient(ellipse 65% 42% at 50% 38%, rgba(255, 255, 255, 0.014) 0%, transparent 70%);
  }

  @keyframes breathe-glow {
    0%,
    100% {
      opacity: 0.92;
    }
    50% {
      opacity: 1;
    }
  }

  .wrapper {
    position: relative;
    z-index: 1;
    max-width: 680px;
    margin: 0 auto;
    padding: 2.5rem 1.5rem 5rem;
  }

  @media (min-width: 640px) {
    .wrapper {
      padding: 3.5rem 2.5rem 6rem;
    }
  }
</style>
