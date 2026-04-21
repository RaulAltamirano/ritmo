<template>
  <div class="canvas bg-gray-50 dark:bg-gray-900" :style="canvasVars">
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
  import { computed, ref } from 'vue'
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

  const props = defineProps<Props>()

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

  const canvasVars = computed(() => {
    const color = props.phaseData?.color || '#94a3b8'
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color)
    const r = m ? Number.parseInt(m[1], 16) : 148
    const g = m ? Number.parseInt(m[2], 16) : 163
    const b = m ? Number.parseInt(m[3], 16) : 184
    return {
      '--ph': color,
      '--ph-r': r,
      '--ph-g': g,
      '--ph-b': b,
    }
  })

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
    background-image:
      radial-gradient(
        ellipse 90% 55% at -5% -10%,
        rgba(var(--ph-r), var(--ph-g), var(--ph-b), 0.09) 0%,
        transparent 60%
      ),
      radial-gradient(
        ellipse 65% 55% at 108% 108%,
        rgba(var(--ph-r), var(--ph-g), var(--ph-b), 0.05) 0%,
        transparent 55%
      );
    transition: background-image 1.8s ease;
  }

  .wrapper {
    max-width: 680px;
    margin: 0 auto;
    padding: 2.5rem 1.5rem 5rem;
  }

  @media (min-width: 640px) {
    .wrapper {
      padding: 3.5rem 2.5rem 6rem;
    }
  }

  /* Dark: reduce gradient intensity */
  .dark .canvas {
    background-image:
      radial-gradient(
        ellipse 90% 55% at -5% -10%,
        rgba(var(--ph-r), var(--ph-g), var(--ph-b), 0.07) 0%,
        transparent 60%
      ),
      radial-gradient(
        ellipse 65% 55% at 108% 108%,
        rgba(var(--ph-r), var(--ph-g), var(--ph-b), 0.04) 0%,
        transparent 55%
      );
  }
</style>
