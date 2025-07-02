<template>
  <div 
    class="loading-spinner"
    :class="[
      size === 'sm' ? 'w-4 h-4' : 
      size === 'md' ? 'w-6 h-6' : 
      size === 'lg' ? 'w-8 h-8' : 
      size === 'xl' ? 'w-12 h-12' : 'w-6 h-6'
    ]"
    role="status"
    :aria-label="ariaLabel"
  >
    <svg 
      class="animate-spin" 
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle 
        class="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        stroke-width="4"
      />
      <path 
        class="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  ariaLabel?: string
}

const props = withDefaults(defineProps<LoadingSpinnerProps>(), {
  size: 'md',
  ariaLabel: 'Loading...'
})
</script>

<style scoped>
.loading-spinner {
  @apply text-primary-600 dark:text-primary-400;
}

.loading-spinner svg {
  @apply w-full h-full;
}

/* Smooth animation */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style> 