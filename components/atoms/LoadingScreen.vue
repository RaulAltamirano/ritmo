<template>
  <div 
    class="loading-screen"
    :class="[
      variant === 'overlay' ? 'fixed inset-0 z-[9999] bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm' : '',
      variant === 'full' ? 'fixed inset-0 z-[9999] bg-white dark:bg-gray-900' : '',
      variant === 'inline' ? 'w-full h-full bg-transparent' : ''
    ]"
    role="status"
    :aria-label="loadingText"
  >
    <div class="flex flex-col items-center justify-center h-full min-h-screen">
      <LoadingSpinner size="xl" aria-label="Loading..." />
      <p v-if="loadingText" class="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">{{ loadingText }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import LoadingSpinner from './LoadingSpinner.vue'

interface LoadingScreenProps {
  variant?: 'overlay' | 'full' | 'inline'
  loadingText?: string
}

const props = withDefaults(defineProps<LoadingScreenProps>(), {
  variant: 'full',
  loadingText: ''
})
</script>

<style scoped>
.loading-screen {
  @apply transition-all duration-300 ease-in-out;
}

/* Smooth backdrop blur */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

/* Pulse animation for logo */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Bounce animation for dots */
.animate-bounce {
  animation: bounce 1.4s ease-in-out infinite both;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}
</style> 