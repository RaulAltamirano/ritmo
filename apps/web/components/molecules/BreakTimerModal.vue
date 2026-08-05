<template>
  <BaseModal
    :is-open="isOpen"
    aria-label="Descanso"
    :show-close-button="false"
    close-on-backdrop-click
    close-on-escape
    size="lg"
    backdrop="blur"
    @update:is-open="onIsOpenUpdate"
  >
    <div class="flex flex-col items-center gap-5 py-2 text-center">
      <BreakRestIllustration class="h-auto w-40 text-primary-400" />
      <h2 class="text-2xl font-semibold text-content">Descanso</h2>

      <div class="relative h-48 w-48">
        <svg class="h-full w-full -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
          <circle
            cx="60"
            cy="60"
            :r="ringRadius"
            fill="none"
            class="stroke-outline"
            stroke-width="8"
          />
          <circle
            cx="60"
            cy="60"
            :r="ringRadius"
            fill="none"
            class="stroke-primary-500 transition-[stroke-dashoffset] duration-500 motion-reduce:transition-none"
            stroke-linecap="round"
            stroke-width="8"
            :stroke-dasharray="ringCircumference"
            :stroke-dashoffset="ringDashOffset"
          />
        </svg>
        <p class="absolute inset-0 flex flex-col items-center justify-center">
          <span class="font-mono text-3xl font-semibold text-primary-400">
            {{ formatted }}
          </span>
          <span class="text-sm text-content-secondary">restante</span>
        </p>
      </div>

      <p class="max-w-sm text-sm text-content-secondary">
        Aprovecha para desconectar unos minutos.
      </p>

      <div class="flex w-full max-w-xs flex-col gap-2">
        <button
          type="button"
          data-testid="break-modal-close"
          class="rounded-full bg-primary-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          @click="timerStore.dismissBreakModal()"
        >
          Cerrar
        </button>
        <button
          type="button"
          data-testid="break-modal-pause"
          class="rounded-full border border-outline bg-surface px-5 py-3 text-sm font-semibold text-content transition-colors hover:border-primary-400 hover:text-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          :disabled="skipBusy"
          @click="togglePause"
        >
          {{ timerStore.isPaused ? 'Reanudar' : 'Pausar' }}
        </button>
        <button
          type="button"
          data-testid="break-modal-skip"
          class="rounded-full px-5 py-3 text-sm font-medium text-content-secondary transition-colors hover:bg-primary-500/10 hover:text-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:opacity-50"
          :disabled="skipBusy || timerStore.breakFinishInFlight"
          @click="onSkip"
        >
          Saltar
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
  import BreakRestIllustration from '@/components/atoms/BreakRestIllustration.vue'
  import { useTimerStore } from '@/stores/timer'
  import BaseModal from '@ritmo/ui/components/atoms/interactive/BaseModal.vue'
  import { computed, ref } from 'vue'

  const timerStore = useTimerStore()
  const skipBusy = ref(false)
  const fullPercentage = 100
  const ringRadius = 54
  const ringCircumference = 2 * Math.PI * ringRadius

  const isOpen = computed(
    () => timerStore.breakModalOpen && timerStore.phase === 'break',
  )
  const formatted = computed(() => timerStore.getFormattedTimeLeft)
  const remainingPercentage = computed(() =>
    Math.min(
      fullPercentage,
      Math.max(0, fullPercentage - timerStore.getProgressPercentage),
    ),
  )
  const ringDashOffset = computed(
    () => ringCircumference * (1 - remainingPercentage.value / fullPercentage),
  )

  function onIsOpenUpdate(value: boolean) {
    if (!value) timerStore.dismissBreakModal()
  }

  function togglePause() {
    timerStore.isPaused ? timerStore.resumeTimer() : timerStore.pauseTimer()
  }

  async function onSkip() {
    if (skipBusy.value || timerStore.breakFinishInFlight) return
    skipBusy.value = true
    try {
      await timerStore.skipBreak()
    } catch {
      /* store already notifies */
    } finally {
      skipBusy.value = false
    }
  }
</script>
