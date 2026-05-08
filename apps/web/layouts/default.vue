<template>
  <div class="app-container">
    <!-- Main App Content -->
    <div>
      <!-- Navigation -->
      <MainNavbar />

      <!-- Page Content -->
      <main>
        <slot />
      </main>
    </div>

    <FloatingTimer />
    <DailyCheckinModal />
    <WorkBlockFeedbackModal />

    <!-- Toast Container -->
    <BaseToast position="top-right" :max-toasts="5" />
  </div>
</template>

<script setup lang="ts">
  import DailyCheckinModal from '@/components/molecules/DailyCheckinModal.vue'
  import FloatingTimer from '@/components/molecules/FloatingTimer.vue'
  import WorkBlockFeedbackModal from '@/components/molecules/WorkBlockFeedbackModal.vue'
  import MainNavbar from '@/components/organisms/MainNavbar.vue'
  import { useTimerStore } from '@/stores/timer'
  import BaseToast from '@ritmo/ui/components/atoms/feedback/BaseToast.vue'
  import { onMounted, onUnmounted } from 'vue'

  // Stores y composables
  const timerStore = useTimerStore()

  // Theme toggling lives in MainNavbar via $theme (see plugins/theme.client.ts)

  // Lifecycle
  onMounted(() => {
    // El tema ya se inicializa en nuxt.config.ts y useTheme
    // Solo cargar preferencias del timer
    timerStore.loadPreferences()
    timerStore.loadDaySummary()
  })

  // Cleanup on unmount
  onUnmounted(() => {
    timerStore.cleanup()
  })
</script>

<style scoped>
  .app-container {
    @apply min-h-screen bg-canvas;
  }

  .app-content {
    @apply transition-opacity duration-300 ease-in-out;
  }

  .main-content {
    @apply pt-16 min-h-screen;
  }

  /* Smooth transitions */
  .opacity-0 {
    opacity: 0;
  }

  /* Prevent content flash during initialization */
  .app-content:not(.opacity-0) {
    opacity: 1;
  }
</style>
