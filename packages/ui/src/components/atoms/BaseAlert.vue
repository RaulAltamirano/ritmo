<template>
  <Transition
    name="alert"
    appear
    enter-active-class="transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
    enter-from-class="opacity-0 scale-[0.95] translate-y-2 blur-sm"
    enter-to-class="opacity-100 scale-100 translate-y-0 blur-0"
    leave-active-class="transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
    leave-from-class="opacity-100 scale-100 translate-y-0 blur-0"
    leave-to-class="opacity-0 scale-[0.95] translate-y-2 blur-sm"
  >
    <div
      v-if="show"
      :id="id"
      :class="[
        'group relative overflow-hidden backdrop-blur-sm',
        'border border-transparent',
        'bg-white/80 dark:bg-gray-900/80',
        'shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]',
        'dark:shadow-[0_1px_3px_0_rgba(255,255,255,0.1),0_1px_2px_-1px_rgba(255,255,255,0.1)]',
        'hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]',
        'dark:hover:shadow-[0_4px_6px_-1px_rgba(255,255,255,0.1),0_2px_4px_-1px_rgba(255,255,255,0.06)]',
        'focus-within:ring-2 focus-within:ring-offset-2',
        'transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
        variantClasses,
        sizeClasses,
      ]"
      :role="role"
      :aria-labelledby="titleId"
      :aria-describedby="messageId"
      :aria-live="ariaLive"
      :data-variant="variant"
      :data-size="size"
      tabindex="0"
    >
      <!-- Progress bar with modern design -->
      <div
        v-if="autoDismiss && showProgress"
        class="absolute top-0 left-0 right-0 h-[2px] origin-left transform-gpu transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        :class="progressClasses"
        :style="{ transform: `scaleX(${progress})` }"
        role="progressbar"
        :aria-valuenow="Math.round(progress * 100)"
        aria-valuemin="0"
        aria-valuemax="100"
      />

      <!-- Main content with modern spacing -->
      <div class="flex items-center gap-4 p-6">
        <!-- Status icon with modern positioning -->
        <div
          v-if="showIcon"
          :class="[
            'flex-shrink-0 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
            'group-hover:scale-105 group-hover:rotate-1',
          ]"
        >
          <BaseIcon
            :icon="stateIcons[variant]"
            size="md"
            :color="getIconColor(variant)"
            :aria-hidden="true"
          />
        </div>

        <!-- Text content with modern typography -->
        <div class="flex-1 min-w-0">
          <!-- Title with 2025 typography trends -->
          <h3
            v-if="title"
            :id="titleId"
            :class="[
              typography.getAlertTypography('title').value,
              'mb-1 text-gray-900 dark:text-white',
              titleClasses,
            ]"
          >
            {{ title }}
          </h3>

          <!-- Message with modern readability -->
          <div
            v-if="message"
            :id="messageId"
            :class="[
              typography.getAlertTypography('body').value,
              'text-gray-700 dark:text-gray-300',
              messageClasses,
            ]"
          >
            {{ message }}
          </div>

          <!-- Additional content slot -->
          <div v-if="$slots.default" class="mt-3">
            <slot />
          </div>
        </div>

        <!-- Close button with modern design and proper positioning -->
        <button
          v-if="dismissible"
          type="button"
          :aria-label="closeButtonAriaLabel"
          :class="closeButtonClasses"
          @click="handleDismiss"
        >
          <X
            :class="[
              `w-5 h-5 ${getTextSemantic('tertiary').value} dark:${getTextSemantic('tertiary').value} hover:${getTextSemantic('secondary').value} dark:hover:${getTextSemantic('secondary').value} transition-colors duration-200`,
            ]"
          />
          <span class="sr-only">×</span>
        </button>
      </div>

      <!-- Subtle status indicator -->
      <div
        :class="[
          'absolute bottom-0 left-0 right-0 h-[1px]',
          'transform-gpu transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
          statusIndicatorClasses,
        ]"
      />
    </div>
  </Transition>
</template>

<script setup lang="ts">
  import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-vue-next'
  import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
  import { useColors } from '../../composables/useColors'
  import { useId } from '../../composables/useId'
  import { useTypography } from '../../composables/useTypography'
  import BaseIcon from './BaseIcon.vue'

  // Modern props interface
  interface BaseAlertProps {
    variant?: 'info' | 'success' | 'warning' | 'error' | 'neutral'
    size?: 'sm' | 'md' | 'lg'
    title?: string
    message?: string
    show?: boolean
    dismissible?: boolean
    autoDismiss?: boolean
    dismissDelay?: number
    role?: string
    ariaLive?: 'polite' | 'assertive' | 'off'
    closeButtonAriaLabel?: string
    showIcon?: boolean
    showProgress?: boolean
    id?: string
  }

  const props = withDefaults(defineProps<BaseAlertProps>(), {
    variant: 'info',
    size: 'md',
    show: true,
    dismissible: false,
    autoDismiss: false,
    dismissDelay: 5000,
    role: 'alert',
    ariaLive: 'polite',
    closeButtonAriaLabel: 'Cerrar alerta',
    showIcon: true,
    showProgress: true,
  })

  // Emits
  const emit = defineEmits<{
    dismiss: []
    'update:show': [value: boolean]
  }>()

  // Internal state
  const show = ref(props.show)
  const progress = ref(1)
  const dismissTimer = ref<NodeJS.Timeout | null>(null)
  const progressTimer = ref<NodeJS.Timeout | null>(null)

  // Unique IDs for accessibility
  const titleId = useId('alert-title')
  const messageId = useId('alert-message')

  // Design system tokens
  const { getColor, getSurface, getTextSemantic } = useColors()
  const typography = useTypography()

  // Modern state icons mapping
  const stateIcons = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertCircle,
    neutral: Info,
  }

  // 2025 color system using design system tokens
  const variantClasses = computed(() => {
    const baseClasses = 'border'

    switch (props.variant) {
      case 'info':
        return `${baseClasses} bg-blue-50/60 border-blue-200/50 text-blue-800 dark:bg-blue-950/30 dark:border-blue-800/50 dark:text-blue-200`
      case 'success':
        return `${baseClasses} bg-green-50/60 border-green-200/50 text-green-800 dark:bg-green-950/30 dark:border-green-800/50 dark:text-green-200`
      case 'warning':
        return `${baseClasses} bg-yellow-50/60 border-yellow-200/50 text-yellow-800 dark:bg-yellow-950/30 dark:border-yellow-800/50 dark:text-yellow-200`
      case 'error':
        return `${baseClasses} bg-red-50/60 border-red-200/50 text-red-800 dark:bg-red-950/30 dark:border-red-800/50 dark:text-red-200`
      case 'neutral':
        return `${baseClasses} bg-gray-50/60 border-gray-200/50 text-gray-800 dark:bg-gray-950/30 dark:border-gray-800/50 dark:text-gray-200`
      default:
        return `${baseClasses} bg-gray-50/60 border-gray-200/50 text-gray-800 dark:bg-gray-950/30 dark:border-gray-800/50 dark:text-gray-200`
    }
  })

  // Modern size system with better proportions
  const sizeClasses = computed(() => {
    switch (props.size) {
      case 'sm':
        return 'rounded-2xl'
      case 'lg':
        return 'rounded-3xl'
      default:
        return 'rounded-2xl'
    }
  })

  // Modern icon color system using design system tokens
  const iconClasses = computed(() => {
    const colorMap = {
      info: 'text-blue-600 dark:text-blue-400',
      success: 'text-green-600 dark:text-green-400',
      warning: 'text-yellow-600 dark:text-yellow-400',
      error: 'text-red-600 dark:text-red-400',
      neutral: 'text-gray-600 dark:text-gray-400',
    }
    return colorMap[props.variant] || colorMap.neutral
  })

  // Modern title typography using design system tokens
  const titleClasses = computed(() => {
    return `${typography.getAlertTypography('title').value} ${getTextSemantic('primary').value} dark:${getTextSemantic('primary').value}`
  })

  // Modern message typography using design system tokens
  const messageClasses = computed(() => {
    return `${typography.getAlertTypography('body').value} ${getTextSemantic('secondary').value} dark:${getTextSemantic('secondary').value}`
  })

  // Modern progress bar colors using design system tokens
  const progressClasses = computed(() => {
    const colorMap = {
      info: 'bg-gradient-to-r from-blue-500 to-blue-600',
      success: 'bg-gradient-to-r from-green-500 to-green-600',
      warning: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
      error: 'bg-gradient-to-r from-red-500 to-red-600',
      neutral: 'bg-gradient-to-r from-gray-500 to-gray-600',
    }
    return colorMap[props.variant] || colorMap.neutral
  })

  // Modern status indicator using design system tokens
  const statusIndicatorClasses = computed(() => {
    const colorMap = {
      info: 'bg-blue-400/40',
      success: 'bg-green-400/40',
      warning: 'bg-yellow-400/40',
      error: 'bg-red-400/40',
      neutral: 'bg-gray-400/40',
    }
    return colorMap[props.variant] || colorMap.neutral
  })

  // Close button classes using design system tokens
  const closeButtonClasses = computed(() => {
    const baseClasses =
      'relative z-10 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 focus:outline-none opacity-0 group-hover:opacity-100 transform-gpu hover:scale-110'

    return `${baseClasses} hover:bg-black/5 dark:hover:bg-white/5 focus:ring-2 focus:ring-gray-400/50 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900`
  })

  // Icon color mapping
  const getIconColor = (
    variant: string
  ): 'primary' | 'success' | 'warning' | 'error' | 'info' | 'muted' => {
    const colorMap = {
      info: 'info',
      success: 'success',
      warning: 'warning',
      error: 'error',
      neutral: 'muted',
    }
    return colorMap[variant] || 'muted'
  }

  // Dismiss handler
  const handleDismiss = () => {
    show.value = false
    emit('dismiss')
    emit('update:show', false)
  }

  // Optimized auto-dismiss with smooth progress
  const startAutoDismiss = () => {
    if (!props.autoDismiss || !props.showProgress) return

    const startTime = Date.now()
    const endTime = startTime + props.dismissDelay

    progressTimer.value = setInterval(() => {
      const remaining = Math.max(0, endTime - Date.now())
      progress.value = remaining / props.dismissDelay

      if (remaining <= 0) {
        handleDismiss()
      }
    }, 16) // ~60fps

    dismissTimer.value = setTimeout(() => {
      handleDismiss()
    }, props.dismissDelay)
  }

  // Stop auto-dismiss
  const stopAutoDismiss = () => {
    if (dismissTimer.value) {
      clearTimeout(dismissTimer.value)
      dismissTimer.value = null
    }
    if (progressTimer.value) {
      clearInterval(progressTimer.value)
      progressTimer.value = null
    }
  }

  // Watchers
  watch(
    () => props.show,
    (newValue) => {
      show.value = newValue
      if (newValue && props.autoDismiss) {
        progress.value = 1
        startAutoDismiss()
      } else {
        stopAutoDismiss()
      }
    }
  )

  watch(
    () => props.autoDismiss,
    (newValue) => {
      if (newValue && show.value) {
        progress.value = 1
        startAutoDismiss()
      } else {
        stopAutoDismiss()
      }
    }
  )

  // Lifecycle
  onMounted(() => {
    if (props.autoDismiss && show.value) {
      startAutoDismiss()
    }
  })

  onUnmounted(() => {
    stopAutoDismiss()
  })

  // Expose methods
  defineExpose({
    dismiss: handleDismiss,
    show: () => (show.value = true),
    hide: () => (show.value = false),
  })
</script>

<style scoped>
  /* 2025 Modern Design System */

  /* Motion reduction support */
  @media (prefers-reduced-motion: reduce) {
    .transition-all,
    .transition-transform,
    .transition-opacity {
      transition: none;
    }

    .group-hover\:scale-110,
    .group-hover\:rotate-3,
    .hover\:scale-110 {
      transform: none;
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .border {
      border-width: 2px;
    }

    /* Background colors handled by design system tokens */
  }

  /* Focus visible for accessibility */
  .focus-within\:ring-2:focus-within {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }

  /* Modern glassmorphism effects */
  .backdrop-blur-sm {
    backdrop-filter: blur(4px);
  }

  /* Smooth transitions with modern easing */
  .group {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Subtle hover effects */
  .group:hover {
    transform: translateY(-2px);
  }

  /* Modern border radius system */
  .rounded-2xl {
    border-radius: 1rem;
  }

  .rounded-3xl {
    border-radius: 1.5rem;
  }

  /* Enhanced icon animations */
  .group-hover\:scale-105 {
    transform: scale(1.05);
  }

  .group-hover\:rotate-1 {
    transform: rotate(1deg);
  }

  /* Button hover effects */
  .hover\:scale-105 {
    transform: scale(1.05);
  }

  /* GPU acceleration for smooth animations */
  .transform-gpu {
    transform: translateZ(0);
    backface-visibility: hidden;
    perspective: 1000px;
  }

  /* Progress bar enhancements */
  .h-\[2px\] {
    height: 2px;
  }

  /* Modern spacing system */
  .p-6 {
    padding: 1.5rem;
  }

  .gap-4 {
    gap: 1rem;
  }

  .min-w-0 {
    min-width: 0;
  }

  .flex-1 {
    flex: 1 1 0%;
  }

  .flex-shrink-0 {
    flex-shrink: 0;
  }

  .items-center {
    align-items: center;
  }

  .mb-1 {
    margin-bottom: 0.25rem;
  }

  .mt-3 {
    margin-top: 0.75rem;
  }
</style>
