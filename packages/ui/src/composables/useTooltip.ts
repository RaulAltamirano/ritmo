import { useEventListener, usePreferredReducedMotion } from '@vueuse/core'
import { computed, onMounted, onUnmounted, ref } from 'vue'

export interface TooltipOptions {
  // Behavior
  trigger?: 'hover' | 'click' | 'focus' | 'manual'
  delay?: number
  duration?: number
  persistent?: boolean

  // Positioning
  position?:
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'top-start'
    | 'top-end'
    | 'bottom-start'
    | 'bottom-end'
    | 'left-start'
    | 'left-end'
    | 'right-start'
    | 'right-end'
  offset?: number
  autoPosition?: boolean

  // Accessibility
  ariaLive?: 'polite' | 'assertive' | 'off'

  // Animation
  disableAnimation?: boolean
}

export function useTooltip(options: TooltipOptions = {}) {
  const {
    trigger = 'hover',
    delay = 200,
    duration = 300,
    persistent = false,
    position = 'top',
    offset = 8,
    autoPosition = true,
    disableAnimation = false,
  } = options

  // State
  const isVisible = ref(false)
  const isHovered = ref(false)
  const currentPosition = ref(position)
  const showTimer = ref<NodeJS.Timeout | null>(null)
  const hideTimer = ref<NodeJS.Timeout | null>(null)

  // Composables
  const prefersReducedMotion = usePreferredReducedMotion()

  // Computed
  const shouldAnimate = computed(() => {
    return !disableAnimation && !prefersReducedMotion.value
  })

  // Methods
  const show = () => {
    if (trigger === 'manual' && !persistent) return

    clearTimeout(hideTimer.value!)
    clearTimeout(showTimer.value!)

    if (delay > 0 && !isHovered.value) {
      showTimer.value = setTimeout(() => {
        isVisible.value = true
      }, delay)
    } else {
      isVisible.value = true
    }
  }

  const hide = () => {
    if (persistent && isHovered.value) return

    clearTimeout(showTimer.value!)
    clearTimeout(hideTimer.value!)

    hideTimer.value = setTimeout(() => {
      isVisible.value = false
    }, duration)
  }

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      isHovered.value = true
      clearTimeout(hideTimer.value!)
      show()
    }
  }

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      isHovered.value = false
      hide()
    }
  }

  const handleFocus = () => {
    if (trigger === 'focus') {
      show()
    }
  }

  const handleBlur = () => {
    if (trigger === 'focus') {
      hide()
    }
  }

  const handleClick = () => {
    if (trigger === 'click') {
      if (isVisible.value) {
        hide()
      } else {
        show()
      }
    }
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && isVisible.value) {
      hide()
    }
  }

  const calculatePosition = (
    triggerElement: HTMLElement,
    tooltipElement: HTMLElement,
  ) => {
    if (!autoPosition) return currentPosition.value

    const triggerRect = triggerElement.getBoundingClientRect()
    const tooltipRect = tooltipElement.getBoundingClientRect()
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    }

    // Check if tooltip fits in current position
    const positions = ['top', 'bottom', 'left', 'right'] as const
    let bestPosition: TooltipOptions['position'] = currentPosition.value

    for (const pos of positions) {
      let fits = true

      switch (pos) {
        case 'top':
          fits = triggerRect.top - tooltipRect.height - offset >= 0
          break
        case 'bottom':
          fits = triggerRect.bottom + tooltipRect.height + offset <= viewport.height
          break
        case 'left':
          fits = triggerRect.left - tooltipRect.width - offset >= 0
          break
        case 'right':
          fits = triggerRect.right + tooltipRect.width + offset <= viewport.width
          break
      }

      if (fits) {
        bestPosition = pos as TooltipOptions['position']
        break
      }
    }

    if (bestPosition !== currentPosition.value) {
      currentPosition.value = bestPosition
    }

    return currentPosition.value
  }

  // Event listeners
  onMounted(() => {
    if (autoPosition) {
      useEventListener(window, 'resize', () => {
        // Recalculate position on resize
      })
      useEventListener(window, 'scroll', () => {
        // Recalculate position on scroll
      })
    }
  })

  onUnmounted(() => {
    clearTimeout(showTimer.value!)
    clearTimeout(hideTimer.value!)
  })

  return {
    // State
    isVisible: computed(() => isVisible.value),
    currentPosition: computed(() => currentPosition.value),
    shouldAnimate,

    // Methods
    show,
    hide,
    handleMouseEnter,
    handleMouseLeave,
    handleFocus,
    handleBlur,
    handleClick,
    handleKeyDown,
    calculatePosition,
  }
}
