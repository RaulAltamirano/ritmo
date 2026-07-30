<template>
  <div class="app-container">
    <div>
      <MainNavbar />

      <main class="min-w-0 max-w-full overflow-x-hidden">
        <slot />
      </main>

      <MainBottomNav />
    </div>

    <FloatingTimer />
    <DailyCheckinModal />
    <WorkBlockFeedbackModal />

    <BaseToast position="top-right" :max-toasts="5" />
  </div>
</template>

<script setup lang="ts">
  import DailyCheckinModal from '@/components/molecules/DailyCheckinModal.vue'
  import FloatingTimer from '@/components/molecules/FloatingTimer.vue'
  import WorkBlockFeedbackModal from '@/components/molecules/WorkBlockFeedbackModal.vue'
  import MainBottomNav from '@/components/organisms/MainBottomNav.vue'
  import MainNavbar from '@/components/organisms/MainNavbar.vue'
  import { useTimerStore } from '@/stores/timer'
  import BaseToast from '@ritmo/ui/components/atoms/feedback/BaseToast.vue'
  import { onMounted, onUnmounted } from 'vue'

  const timerStore = useTimerStore()

  onMounted(() => {
    timerStore.loadPreferences()
    timerStore.loadDaySummary()
  })

  onUnmounted(() => {
    timerStore.cleanup()
  })
</script>

<style scoped>
  .app-container {
    @apply min-h-screen min-w-0 overflow-x-hidden bg-canvas;
  }
</style>
