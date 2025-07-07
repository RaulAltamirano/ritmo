<template>
  <Transition
    name="loading-fade"
    appear
    mode="out-in"
  >
    <div 
      v-if="isVisible"
      class="loading-screen"
      :class="variantClasses"
      role="status"
      :aria-label="ariaLabel"
      :aria-live="ariaLive"
    >
      <div class="loading-content">
        <!-- Check mark cuando el progreso llega al 100% -->
        <div v-if="showProgress && progress === 100" class="check-container">
          <div class="check-icon">
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>

        <!-- Logo animado -->
        <div v-else-if="showLogo" class="logo-container">
          <svg 
            class="logo-animated"
            width="48" 
            height="48" 
            viewBox="0 0 40 40" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <g class="logo-bars">
              <rect x="10" y="22" width="3" height="8" rx="1.5" class="bar bar-1" fill="currentColor"/>
              <rect x="17" y="16" width="3" height="14" rx="1.5" class="bar bar-2" fill="currentColor"/>
              <rect x="24" y="20" width="3" height="10" rx="1.5" class="bar bar-3" fill="currentColor"/>
              <rect x="31" y="12" width="3" height="18" rx="1.5" class="bar bar-4" fill="currentColor"/>
            </g>
          </svg>
        </div>

        <!-- Spinner tradicional -->
        <LoadingSpinner 
          v-else
          :size="spinnerSize" 
          :aria-label="spinnerAriaLabel"
          class="loading-spinner"
        />
        
        <div v-if="loadingText || $slots.default" class="loading-text">
          <p v-if="loadingText" class="text-sm font-medium text-gray-700 dark:text-gray-200">
            {{ progress === 100 ? '¡Completado!' : loadingText }}
          </p>
          <slot />
        </div>

        <div v-if="showProgress && progress !== null" class="loading-progress">
          <div class="progress-bar">
            <div 
              class="progress-fill"
              :style="{ width: `${progress}%` }"
            />
          </div>
          <span class="progress-text">{{ Math.round(progress) }}%</span>
        </div>

        <!-- Puntos de carga animados -->
        <div v-if="showDots && progress !== 100" class="loading-dots">
          <span class="dot dot-1"></span>
          <span class="dot dot-2"></span>
          <span class="dot dot-3"></span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import LoadingSpinner from './LoadingSpinner.vue'

interface LoadingScreenProps {
  variant?: 'overlay' | 'full' | 'inline' | 'minimal'
  loadingText?: string
  spinnerSize?: 'sm' | 'md' | 'lg' | 'xl'
  showProgress?: boolean
  progress?: number | null
  isVisible?: boolean
  ariaLabel?: string
  ariaLive?: 'polite' | 'assertive' | 'off'
  showLogo?: boolean
  showDots?: boolean
}

const props = withDefaults(defineProps<LoadingScreenProps>(), {
  variant: 'full',
  loadingText: '',
  spinnerSize: 'xl',
  showProgress: false,
  progress: null,
  isVisible: true,
  ariaLabel: 'Loading content',
  ariaLive: 'polite',
  showLogo: false,
  showDots: true
})

const variantClasses = computed(() => {
  const baseClasses = 'transition-all duration-500 ease-out'
  
  switch (props.variant) {
    case 'overlay':
      return `${baseClasses} fixed inset-0 z-[9999] bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg`
    case 'full':
      return `${baseClasses} fixed inset-0 z-[9999] bg-white dark:bg-gray-900`
    case 'inline':
      return `${baseClasses} w-full h-full bg-transparent`
    case 'minimal':
      return `${baseClasses} w-full h-full bg-transparent flex items-center justify-center`
    default:
      return baseClasses
  }
})

const spinnerAriaLabel = computed(() => {
  return props.loadingText ? `Loading: ${props.loadingText}` : 'Loading...'
})
</script>

<style scoped>
.loading-screen {
  @apply flex items-center justify-center;
}

.loading-content {
  @apply flex flex-col items-center justify-center space-y-6 text-center;
}

.loading-spinner {
  @apply text-primary-600 dark:text-primary-400;
}

.loading-text {
  @apply max-w-sm mx-auto;
}

.loading-progress {
  @apply w-full max-w-xs space-y-3;
}

.progress-bar {
  @apply w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner;
}

.progress-fill {
  @apply h-full bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-400 dark:to-primary-500 transition-all duration-300 ease-out rounded-full shadow-sm;
}

.progress-text {
  @apply text-xs font-semibold text-gray-600 dark:text-gray-300;
}

/* Logo animado */
.logo-container {
  @apply mb-2;
}

.logo-animated {
  @apply text-primary-600 dark:text-primary-400;
}

.logo-bars {
  @apply transition-all duration-300 ease-out;
}

.bar {
  @apply fill-current transition-all duration-300 ease-out;
  animation: barPulse 1.5s ease-in-out infinite;
  transform-origin: bottom;
}

.bar-1 {
  animation-delay: 0s;
}

.bar-2 {
  animation-delay: 0.15s;
}

.bar-3 {
  animation-delay: 0.3s;
}

.bar-4 {
  animation-delay: 0.45s;
}

@keyframes barPulse {
  0%, 100% {
    opacity: 0.4;
    transform: scaleY(0.8);
  }
  50% {
    opacity: 1;
    transform: scaleY(1.3);
  }
}

/* Check mark */
.check-container {
  @apply mb-2;
}

.check-icon {
  @apply w-12 h-12 bg-green-500 dark:bg-green-600 text-white rounded-full flex items-center justify-center;
  animation: checkAppear 0.4s ease-out;
}

@keyframes checkAppear {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Puntos de carga */
.loading-dots {
  @apply flex space-x-2 mt-4;
}

.dot {
  @apply w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full;
  animation: dotBounce 1.4s ease-in-out infinite both;
}

.dot-1 {
  animation-delay: -0.32s;
}

.dot-2 {
  animation-delay: -0.16s;
}

.dot-3 {
  animation-delay: 0s;
}

@keyframes dotBounce {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Smooth backdrop blur */
.backdrop-blur-lg {
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

/* Transiciones mejoradas */
.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.loading-fade-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}

.loading-fade-leave-to {
  opacity: 0;
  transform: scale(1.1) translateY(-20px);
}

/* Fondo sólido para modo oscuro */
.dark .loading-screen {
  background: #111827;
}

/* Efectos hover para modo oscuro */
.dark .progress-bar {
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.3);
}

.dark .progress-fill {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .loading-content {
    @apply space-y-4;
  }
  
  .loading-text {
    @apply max-w-xs;
  }
  
  .logo-animated {
    width: 40px;
    height: 40px;
  }
}

/* Animaciones adicionales para mejor fluidez */
.loading-content {
  animation: contentFloat 3s ease-in-out infinite;
}

@keyframes contentFloat {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
}

/* Efecto de brillo en modo oscuro */
.dark .logo-animated {
  filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.3));
}

/* Transiciones suaves para cambios de tema */
* {
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}
</style> 