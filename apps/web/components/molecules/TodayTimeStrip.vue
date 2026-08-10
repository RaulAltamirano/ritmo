<template>
  <ClientOnly>
    <div class="tts" data-testid="today-time-strip">
      <span class="tts-item">
        <span class="tts-label">Today</span>
        <span class="tts-value">{{ dayTotalLabel }}</span>
      </span>
      <span v-if="showIdle" class="tts-item tts-item--idle">
        <span class="tts-dot">·</span>
        <span class="tts-value">{{ idleLabel }} without a task</span>
      </span>
    </div>
    <template #fallback>
      <div class="tts" data-testid="today-time-strip">
        <span class="tts-item">
          <span class="tts-label">Today</span>
          <span class="tts-value">0m</span>
        </span>
      </div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
  import { computed, onMounted, onUnmounted, ref } from 'vue'
  import { useTimerStore } from '@/stores/timer'
  import { formatDurationMinutes, formatDurationSec } from '@/utils/workSessionDurations'

  interface Props {
    dayTotalSeconds: number
    lastSessionEndedAt: string | null
  }
  const props = defineProps<Props>()

  const timerStore = useTimerStore()
  const now = ref(Date.now())
  let tick: ReturnType<typeof setInterval> | null = null

  onMounted(() => {
    now.value = Date.now()
    tick = setInterval(() => {
      now.value = Date.now()
    }, 1000)
  })
  onUnmounted(() => {
    if (tick) clearInterval(tick)
  })

  const idleSeconds = computed(() => {
    if (!props.lastSessionEndedAt) return 0
    const ended = new Date(props.lastSessionEndedAt).getTime()
    return Math.max(0, Math.floor((now.value - ended) / 1000))
  })

  const showIdle = computed(() => {
    if (!props.lastSessionEndedAt) return false
    if (timerStore.isRunning || timerStore.isPaused) return false
    return true
  })

  const dayTotalLabel = computed(() => formatDurationMinutes(props.dayTotalSeconds))
  const idleLabel = computed(() => formatDurationSec(idleSeconds.value))
</script>

<style scoped>
  .tts {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8125rem;
    color: rgba(100, 116, 139, 0.9);
    margin-top: 0.5rem;
  }
  .dark .tts {
    color: rgba(148, 163, 184, 0.8);
  }
  .tts-item {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
  }
  .tts-label {
    font-weight: 500;
    letter-spacing: 0.02em;
  }
  .tts-value {
    font-variant-numeric: tabular-nums;
  }
  .tts-dot {
    opacity: 0.5;
  }
  .tts-item--idle {
    opacity: 0.85;
  }
</style>
