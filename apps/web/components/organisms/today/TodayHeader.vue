<template>
  <header class="today-hdr">
    <ClientOnly>
      <div>
        <div class="text-sm text-gray-400 dark:text-gray-500 capitalize tracking-wide mb-1">
          {{ formattedDate }}
        </div>
        <div class="hdr-time text-gray-900 dark:text-white">
          {{ formattedTime }}
        </div>
      </div>
      <template #fallback>
        <div>
          <div
            class="text-sm text-gray-400 dark:text-gray-500 capitalize tracking-wide mb-1"
            aria-hidden="true"
          >
            &nbsp;
          </div>
          <div class="hdr-time text-gray-900 dark:text-white" aria-hidden="true">
            &nbsp;
          </div>
        </div>
      </template>
    </ClientOnly>

    <CircadianPhaseCard />

    <TodayTimeStrip
      :day-total-seconds="dayTotalSeconds"
      :last-session-ended-at="lastSessionEndedAt"
    />

    <div class="hdr-gap"></div>
  </header>
</template>

<script setup lang="ts">
  import { onMounted, onUnmounted, ref, computed } from 'vue'
  import CircadianPhaseCard from '@/components/molecules/CircadianPhaseCard.vue'
  import TodayTimeStrip from '@/components/molecules/TodayTimeStrip.vue'

  interface Props {
    phaseData?: unknown
    phaseLoading?: boolean
    dayTotalSeconds: number
    lastSessionEndedAt: string | null
  }
  defineProps<Props>()
  defineEmits<{ (e: 'toggle-filters'): void }>()

  const now = ref(new Date())
  let tick: ReturnType<typeof setInterval> | null = null

  onMounted(() => {
    now.value = new Date()
    tick = setInterval(() => {
      now.value = new Date()
    }, 1000)
  })

  onUnmounted(() => {
    if (tick) clearInterval(tick)
  })

  const formattedDate = computed(() =>
    now.value.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  )

  const formattedTime = computed(() =>
    now.value.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
  )
</script>

<style scoped>
  .today-hdr {
    margin-bottom: 2.75rem;
  }

  .hdr-time {
    font-family: 'Instrument Serif', Georgia, serif;
    font-style: italic;
    font-size: clamp(3.75rem, 11vw, 6rem);
    line-height: 1;
    letter-spacing: -0.025em;
    margin-bottom: 1.75rem;
  }

  .hdr-gap {
    height: 0;
  }
</style>
