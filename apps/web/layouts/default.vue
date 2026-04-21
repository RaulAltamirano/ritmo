<template>
  <div class="app-container">
    <!-- Main App Content -->
    <div>
      <!-- Navigation -->
      <MainNavbar @toggle-dark-mode="toggleDarkMode" />

      <!-- Page Content -->
      <main>
        <slot />
      </main>
    </div>

    <FloatingTimer />

    <!-- Toast Container -->
    <BaseToast position="top-right" :max-toasts="5" />
  </div>
</template>

<script setup lang="ts">
import FloatingTimer from '@/components/molecules/FloatingTimer.vue'
import MainNavbar from '@/components/organisms/MainNavbar.vue'
import { useTimerStore } from '@/stores/timer'
import BaseToast from '@ritmo/ui/components/atoms/feedback/BaseToast.vue'
import { onMounted, onUnmounted } from 'vue'

// Stores y composables
const timerStore = useTimerStore()

// Usar tema global del plugin
const { $theme } = useNuxtApp()
const { isDark, setTheme } = $theme || {}

// Toggle dark mode - delegar al composable
const toggleDarkMode = () => {
  if (isDark && setTheme) {
    const currentTheme = isDark.value ? 'dark' : 'light'
    setTheme(currentTheme === 'dark' ? 'light' : 'dark')
  }
}

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

// El tema se maneja globalmente a través de useTheme
// No necesitamos provide/inject ya que cada componente usa useTheme directamente
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
