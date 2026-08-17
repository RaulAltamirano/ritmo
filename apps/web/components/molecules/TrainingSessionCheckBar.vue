<template>
  <div class="flex flex-wrap items-center gap-2">
    <p
      v-if="sessionCheck.startStatus === 'saved'"
      class="text-xs text-content-muted"
    >
      Checked in
    </p>
    <p
      v-if="sessionCheck.endStatus === 'saved'"
      class="text-xs text-content-muted"
    >
      Wrapped up
    </p>
    <BaseButton
      v-if="sessionCheck.startStatus !== 'saved'"
      variant="secondary"
      size="sm"
      aria-label="Check in"
      @click="emit('check-in')"
    >
      Check in
    </BaseButton>
    <BaseButton
      v-if="sessionCheck.endStatus !== 'saved'"
      size="sm"
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

  defineProps<{
    sessionCheck: TrainingSessionCheck
    plannedComplete: boolean
  }>()

  const emit = defineEmits<{
    'check-in': []
    'finish-session': []
  }>()
</script>
