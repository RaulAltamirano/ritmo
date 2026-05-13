<template>
  <div class="tts" data-testid="today-time-strip">
    <span class="tts-item">
      <span class="tts-label">Hoy</span>
      <span class="tts-value">{{ formatTotal(dayTotalSeconds) }}</span>
    </span>
    <span v-if="showIdle" class="tts-item tts-item--idle">
      <span class="tts-dot">·</span>
      <span class="tts-value">{{ formatIdle(idleSeconds) }} sin tarea</span>
    </span>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, onUnmounted, ref } from 'vue'
  import { useTimerStore } from '@/stores/timer'

  interface Props {
    dayTotalSeconds: number
    lastSessionEndedAt: string | null
  }
  const props = defineProps<Props>()

  const timerStore = useTimerStore()
  const now = ref(Date.now())
  let tick: ReturnType<typeof setInterval> | null = null

  onMounted(() => {
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

  const formatTotal = (sec: number): string => {
    const s = Math.max(0, Math.floor(sec))
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }

  const formatIdle = (sec: number): string => {
    const s = Math.max(0, Math.floor(sec))
    if (s < 60) return `${s}s`
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }
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
