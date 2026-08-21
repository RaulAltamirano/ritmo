<template>
  <div class="flex w-full flex-wrap items-center gap-2 md:w-auto">
    <span
      v-if="sessionCheck.startStatus === 'saved'"
      data-testid="session-check-status-start"
      role="status"
      class="inline-flex min-h-[2rem] items-center gap-1.5 rounded-lg bg-success-50 px-3 py-1.5 text-sm font-medium text-success-700 motion-safe:transition-opacity motion-safe:duration-200 dark:bg-success-950/50 dark:text-success-300"
    >
      <CheckCircle :size="16" aria-hidden="true" />
      Checked in
    </span>
    <BaseButton
      v-else
      variant="secondary"
      size="sm"
      :icon="ClipboardCheck"
      aria-label="Check in"
      @click="emit('check-in')"
    >
      Check in
    </BaseButton>

    <span
      v-if="sessionCheck.endStatus === 'saved'"
      data-testid="session-check-status-end"
      role="status"
      class="inline-flex min-h-[2rem] items-center gap-1.5 rounded-lg bg-success-50 px-3 py-1.5 text-sm font-medium text-success-700 motion-safe:transition-opacity motion-safe:duration-200 dark:bg-success-950/50 dark:text-success-300"
    >
      <CheckCircle2 :size="16" aria-hidden="true" />
      Wrapped up
    </span>
    <BaseButton
      v-else
      size="sm"
      :icon="Flag"
      aria-label="Finish session"
      :variant="plannedComplete ? 'primary' : 'outline'"
      @click="emit('finish-session')"
    >
      Finish session
    </BaseButton>
  </div>
</template>

<script setup lang="ts">
  import type { TrainingSessionCheck } from '@/types/training'
  import BaseButton from '@ritmo/ui/components/atoms/interactive/BaseButton.vue'
  import { CheckCircle, CheckCircle2, ClipboardCheck, Flag } from 'lucide-vue-next'

  defineProps<{
    sessionCheck: TrainingSessionCheck
    plannedComplete: boolean
  }>()

  const emit = defineEmits<{
    'check-in': []
    'finish-session': []
  }>()
</script>
