<template>
  <div class="text-center py-12">
    <!-- Spinner -->
    <div class="mb-6">
      <BaseSpinner :variant="spinnerVariant" :size="spinnerSize" :color="spinnerColor" :aria-label="ariaLabel" />
    </div>

    <!-- Content -->
    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
      {{ title }}
    </h3>
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
      {{ description }}
    </p>

    <!-- Simple progress indicator -->
    <div v-if="showProgress && progress !== null" class="w-full max-w-xs mx-auto">
      <div class="flex justify-between items-center text-sm mb-3">
        <span class="text-gray-600 dark:text-gray-400">{{ progressLabel }}</span>
        <span class="font-medium text-gray-900 dark:text-white">{{ Math.round(progress) }}%</span>
      </div>

      <!-- Clean progress bar -->
      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div class="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
          :style="{ width: `${progress}%` }"></div>
      </div>
    </div>

    <!-- Action (optional) -->
    <div v-if="$slots.default" class="mt-6">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseSpinner from '../../atoms/display/BaseSpinner.vue'

interface LoadingStateProps {
  title: string
  description: string
  spinnerVariant?: 'circular' | 'dots'
  spinnerSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  spinnerColor?:
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral'
  | 'white'
  | 'auto'
  ariaLabel?: string
  showProgress?: boolean
  progress?: number | null
  progressLabel?: string
}

const props = withDefaults(defineProps<LoadingStateProps>(), {
  spinnerVariant: 'circular',
  spinnerSize: 'lg',
  spinnerColor: 'primary',
  ariaLabel: 'Loading content',
  showProgress: false,
  progress: null,
  progressLabel: 'Loading',
})
</script>

<style scoped>
/* Simple progress bar transition */
.progress-bar {
  transition: width 0.5s ease-out;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .progress-bar {
    transition: none;
  }
}
</style>
