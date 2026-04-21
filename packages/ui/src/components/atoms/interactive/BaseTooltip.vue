<script setup lang="ts">
import { useId } from '../../../composables/useId'
import { useEventListener } from '@vueuse/core'
import type { Component } from 'vue'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import BaseIcon from '../display/BaseIcon.vue'

interface BaseTooltipProps {
  // Content
  content?: string
  icon?: Component
  iconColor?:
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'muted'

  // Behavior
  trigger?: 'hover' | 'click' | 'focus' | 'manual'
  delay?: number
  duration?: number
  persistent?: boolean

  // Visual
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
  showArrow?: boolean

  // Accessibility
  ariaLive?: 'polite' | 'assertive' | 'off'
  triggerRole?: string
  triggerTabindex?: number

  // Model
  visible?: boolean
}

const props = withDefaults(defineProps<BaseTooltipProps>(), {
  trigger: 'hover',
  delay: 200,
  duration: 100,
  persistent: false,
  variant: 'default',
  size: 'md',
  showArrow: true,
  ariaLive: 'polite',
  triggerRole: 'button',
  triggerTabindex: 0,
  visible: false,
})

// Emits
const emit = defineEmits<{
  show: []
  hide: []
  'update:visible': [value: boolean]
}>()

// Refs
const triggerRef = ref<HTMLElement>()
const tooltipRef = ref<HTMLElement>()
const isVisible = ref(props.visible)
const isHovered = ref(false)
const showTimer = ref<ReturnType<typeof setTimeout>>()
const hideTimer = ref<ReturnType<typeof setTimeout>>()

// Unique ID for accessibility
const tooltipId = useId('tooltip')

// Computed properties
const iconColor = computed(() => {
  if (props.iconColor) return props.iconColor
  return props.variant === 'default' ? 'muted' : props.variant
})

const variantClasses = computed(() => {
  // Modern minimalista con gradientes sutiles y backdrop-blur
  const modernColors = {
    default:
      'bg-white/95 dark:bg-gray-900/95 text-gray-900 dark:text-white border-gray-100/50 dark:border-gray-800/50',
    primary:
      'bg-white/95 dark:bg-gray-900/95 text-gray-900 dark:text-white border-blue-100/50 dark:border-blue-800/50',
    success:
      'bg-white/95 dark:bg-gray-900/95 text-gray-900 dark:text-white border-green-100/50 dark:border-green-800/50',
    warning:
      'bg-white/95 dark:bg-gray-900/95 text-gray-900 dark:text-white border-amber-100/50 dark:border-amber-800/50',
    error:
      'bg-white/95 dark:bg-gray-900/95 text-gray-900 dark:text-white border-red-100/50 dark:border-red-800/50',
    info: 'bg-white/95 dark:bg-gray-900/95 text-gray-900 dark:text-white border-sky-100/50 dark:border-sky-800/50',
  }

  return (
    modernColors[props.variant as keyof typeof modernColors] || modernColors.default
  )
})

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'text-xs px-3 py-2.5 sm:px-4 sm:py-3 min-w-[220px] sm:min-w-[240px]',
    md: 'text-sm px-4 py-3 sm:px-5 sm:py-4 min-w-[260px] sm:min-w-[280px]',
    lg: 'text-base px-5 py-4 sm:px-6 sm:py-5 min-w-[300px] sm:min-w-[320px]',
  }
  return sizes[props.size] || sizes.md
})

// Arrow styling
const arrowClasses = computed(() => {
  const arrowColors = {
    default:
      'bg-white/95 dark:bg-gray-900/95 border-gray-100/50 dark:border-gray-800/50',
    primary:
      'bg-white/95 dark:bg-gray-900/95 border-blue-100/50 dark:border-blue-800/50',
    success:
      'bg-white/95 dark:bg-gray-900/95 border-green-100/50 dark:border-green-800/50',
    warning:
      'bg-white/95 dark:bg-gray-900/95 border-amber-100/50 dark:border-amber-800/50',
    error: 'bg-white/95 dark:bg-gray-900/95 border-red-100/50 dark:border-red-800/50',
    info: 'bg-white/95 dark:bg-gray-900/95 border-sky-100/50 dark:border-sky-800/50',
  }
  return arrowColors[props.variant as keyof typeof arrowColors] || arrowColors.default
})

// Simple positioning logic
const tooltipStyles = computed(() => {
  if (!triggerRef.value || !isVisible.value) return {}

  const triggerRect = triggerRef.value.getBoundingClientRect()
  const offset = 12 // Increased offset for better spacing

  // Use default dimensions for initial positioning
  const tooltipWidth = 280
  const tooltipHeight = 120
  const margin = 20 // Safety margin to prevent cutting

  let top = 0
  let left = 0

  // Calculate available space in each direction
  const spaceBelow = window.innerHeight - triggerRect.bottom - offset - margin
  const spaceAbove = triggerRect.top - offset - margin
  const spaceRight = window.innerWidth - triggerRect.right - offset - margin
  const spaceLeft = triggerRect.left - offset - margin

  // Determine best position based on available space
  if (spaceBelow >= tooltipHeight) {
    // Position below - center horizontally
    top = triggerRect.bottom + offset
    left = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2
  } else if (spaceAbove >= tooltipHeight) {
    // Position above - center horizontally
    top = triggerRect.top - tooltipHeight - offset
    left = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2
  } else if (spaceRight >= tooltipWidth) {
    // Position to the right - center vertically
    top = triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2
    left = triggerRect.right + offset
  } else if (spaceLeft >= tooltipWidth) {
    // Position to the left - center vertically
    top = triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2
    left = triggerRect.left - tooltipWidth - offset
  } else {
    // Fallback: position in the center of the screen
    top = (window.innerHeight - tooltipHeight) / 2
    left = (window.innerWidth - tooltipWidth) / 2
  }

  // Ensure tooltip stays within viewport bounds
  left = Math.max(margin, Math.min(left, window.innerWidth - tooltipWidth - margin))
  top = Math.max(margin, Math.min(top, window.innerHeight - tooltipHeight - margin))

  // Additional check: if tooltip would be cut off, adjust position
  if (left + tooltipWidth > window.innerWidth - margin) {
    left = window.innerWidth - tooltipWidth - margin
  }
  if (left < margin) {
    left = margin
  }
  if (top + tooltipHeight > window.innerHeight - margin) {
    top = window.innerHeight - tooltipHeight - margin
  }
  if (top < margin) {
    top = margin
  }

  return {
    top: `${top}px`,
    left: `${left}px`,
  }
})

// Arrow positioning
const arrowStyles = computed(() => {
  if (!triggerRef.value || !isVisible.value) return {}

  const triggerRect = triggerRef.value.getBoundingClientRect()
  const tooltipRect = tooltipRef.value?.getBoundingClientRect()

  if (!tooltipRect) return {}

  // Calculate arrow position relative to tooltip
  const arrowLeft = triggerRect.left + triggerRect.width / 2 - tooltipRect.left - 6 // 6px is half of arrow width
  const arrowTop = -6 // Position arrow at top of tooltip

  return {
    left: `${arrowLeft}px`,
    top: `${arrowTop}px`,
  }
})

// Methods
const show = () => {
  if (props.trigger === 'manual' && !props.persistent) return

  clearTimeout(hideTimer.value!)
  clearTimeout(showTimer.value!)

  if (props.delay > 0 && !isHovered.value) {
    showTimer.value = setTimeout(() => {
      isVisible.value = true
      emit('show')
      emit('update:visible', true)
    }, props.delay)
  } else {
    isVisible.value = true
    emit('show')
    emit('update:visible', true)
  }
}

const hide = () => {
  if (props.persistent && isHovered.value) return

  clearTimeout(showTimer.value!)
  clearTimeout(hideTimer.value!)

  hideTimer.value = setTimeout(() => {
    isVisible.value = false
    emit('hide')
    emit('update:visible', false)
  }, props.duration)
}

const handleMouseEnter = () => {
  if (props.trigger === 'hover') {
    isHovered.value = true
    clearTimeout(hideTimer.value!)
    show()
  }
}

const handleMouseLeave = () => {
  if (props.trigger === 'hover') {
    isHovered.value = false
    hide()
  }
}

const handleFocus = () => {
  if (props.trigger === 'focus') {
    show()
  }
}

const handleBlur = () => {
  if (props.trigger === 'focus') {
    hide()
  }
}

const handleTooltipMouseEnter = () => {
  if (props.trigger === 'hover') {
    isHovered.value = true
    clearTimeout(hideTimer.value!)
  }
}

const handleTooltipMouseLeave = () => {
  if (props.trigger === 'hover') {
    isHovered.value = false
    hide()
  }
}

const handleEnter = () => {
  // Small delay to ensure tooltip is rendered before positioning
  nextTick(() => {
    // Force a re-render to get accurate dimensions
    if (tooltipRef.value) {
      // Trigger a reflow to ensure dimensions are calculated
      tooltipRef.value.offsetHeight
    }
  })
}

const handleLeave = () => {
  // Clean up any ongoing animations
}

// Event listeners
useEventListener('resize', () => {
  if (isVisible.value) {
    // Force re-render on resize to recalculate position
    nextTick(() => {
      // The computed tooltipStyles will automatically recalculate
    })
  }
})

useEventListener('scroll', () => {
  if (isVisible.value) {
    // Hide tooltip on scroll to avoid positioning issues
    hide()
  }
})

// Watchers
watch(
  () => props.visible,
  newValue => {
    isVisible.value = newValue
  },
)

// Watch for tooltip visibility changes to recalculate position
watch(isVisible, newValue => {
  if (newValue) {
    // Force recalculation of position when tooltip becomes visible
    nextTick(() => {
      // The computed tooltipStyles will automatically recalculate
    })
  }
})

// Lifecycle
onMounted(() => {
  if (props.visible) {
    isVisible.value = true
  }
})

onUnmounted(() => {
  clearTimeout(showTimer.value!)
  clearTimeout(hideTimer.value!)
})
</script>

<template>
  <div ref="triggerRef" class="relative inline-block" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave"
    @focus="handleFocus" @blur="handleBlur" @keydown.escape="hide">
    <!-- Trigger element -->
    <div :tabindex="triggerTabindex" :role="triggerRole" :aria-describedby="tooltipId" :aria-expanded="isVisible"
      class="inline-block">
      <slot name="trigger" />
    </div>

    <!-- Tooltip content rendered in portal -->
    <Teleport to="body">
      <Transition name="tooltip" appear @enter="handleEnter" @leave="handleLeave">
        <div v-if="isVisible" :id="tooltipId" ref="tooltipRef" class="fixed z-[99999] pointer-events-none min-w-[280px] max-w-sm lg:max-w-md sm:min-w-[280px] min-w-[260px] px-4 py-3 sm:px-5 sm:py-4 text-sm leading-relaxed rounded-2xl border border-transparent transition-all duration-300 ease-out transform-gpu backdrop-blur-xl will-change-transform shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04),0_0_0_1px_rgba(255,255,255,0.1)] dark:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.25),0_10px_10px_-5px_rgba(0,0,0,0.1),0_0_0_1px_rgba(255,255,255,0.05)]" :class="[
          variantClasses,
          sizeClasses,
        ]" :style="tooltipStyles" role="tooltip" :aria-live="ariaLive" :aria-atomic="true"
          @mouseenter="handleTooltipMouseEnter" @mouseleave="handleTooltipMouseLeave">
          <!-- Content -->
          <div class="flex items-start gap-3">
            <!-- Icon (optional) -->
            <BaseIcon v-if="icon" :icon="icon" size="sm" :color="iconColor" class="flex-shrink-0 mt-0.5"
              :aria-hidden="true" />

            <!-- Text content -->
            <div class="flex-1 min-w-0">
              <slot />
            </div>
          </div>

          <!-- Modern arrow -->
          <div v-if="showArrow" class="absolute w-3 h-3 transform rotate-45" :class="arrowClasses"
            :style="arrowStyles" />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* Modern animations with improved timing */
.tooltip-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tooltip-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 1, 1);
}

.tooltip-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(-4px);
}

.tooltip-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-2px);
}

/* Improved backdrop blur */
.backdrop-blur-xl {
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}

/* Enhanced shadows for better depth */
.shadow-\[0_20px_25px_-5px_rgba\(0\,0\,0\,0\.1\)\,0_10px_10px_-5px_rgba\(0\,0\,0\,0\.04\)\,0_0_0_1px_rgba\(255\,255\,255\,0\.1\)\] {
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04),
    0 0 0 1px rgba(255, 255, 255, 0.1);
}

.dark .shadow-\[0_20px_25px_-5px_rgba\(0\,0\,0\,0\.25\)\,0_10px_10px_-5px_rgba\(0\,0\,0\,0\.1\)\,0_0_0_1px_rgba\(255\,255\,255\,0\.05\)\] {
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.25),
    0 10px 10px -5px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.05);
}

/* Smooth transitions for all properties */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Optimized transform for better performance */
.transform-gpu {
  transform: translateZ(0);
  will-change: transform;
}

/* Enhanced border radius for modern look */
.rounded-2xl {
  border-radius: 1rem;
}
</style>
