<script setup lang="ts">
import { useColors } from '../../../composables/useColors'
import { useId } from '../../../composables/useId'
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-vue-next'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import BaseIcon from '../display/BaseIcon.vue'

// Props interface
interface AlertAction {
  label: string
  action: string
  href?: string
}

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
  actions?: AlertAction[]
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
})

// Emits
const emit = defineEmits<{
  dismiss: []
  'update:show': [value: boolean]
  action: [action: AlertAction]
}>()

// Internal state
const show = ref(props.show)
const dismissTimer = ref<NodeJS.Timeout | null>(null)

// Unique IDs for accessibility using deterministic system
const titleId = useId('alert-title', {
  variant: props.variant,
  title: props.title,
})
const messageId = useId('alert-message', {
  variant: props.variant,
  message: props.message,
})

// Design system tokens
const { getSemanticColors } = useColors()
const semanticColors = getSemanticColors()

// State icons mapping
const stateIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
  neutral: Info,
}

// Variant classes based on semantic colors
const variantClasses = computed(() => {
  const colors = semanticColors.value.alerts
  const variant = props.variant as keyof typeof colors

  return `${colors[variant].background} ${colors[variant].border} ${colors[variant].text}`
})

// Size classes
const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'text-sm'
    case 'lg':
      return 'text-base'
    default:
      return 'text-sm'
  }
})

// Icon classes
const iconClasses = computed(() => {
  const colors = semanticColors.value.alerts
  const variant = props.variant as keyof typeof colors
  return colors[variant].text
})

// Title classes
const titleClasses = computed(() => {
  const colors = semanticColors.value.alerts
  const variant = props.variant as keyof typeof colors
  return colors[variant].text
})

// Message classes
const messageClasses = computed(() => {
  const colors = semanticColors.value.alerts
  const variant = props.variant as keyof typeof colors
  return colors[variant].text
})

// Action classes
const actionClasses = computed(() => {
  const colors = semanticColors.value.alerts
  const variant = props.variant as keyof typeof colors
  return colors[variant].text
})

// Close button classes
const closeButtonClasses = computed(() => {
  return 'flex-shrink-0 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400/50'
})

// Close icon classes
const closeIconClasses = computed(() => {
  const colors = semanticColors.value.alerts
  const variant = props.variant as keyof typeof colors
  return `w-4 h-4 ${colors[variant].text}`
})

// Icon color mapping
const getIconColor = (
  variant: string,
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

// Action handler
const handleAction = (action: AlertAction) => {
  emit('action', action)
}

// Auto-dismiss functionality
const startAutoDismiss = () => {
  if (!props.autoDismiss) return

  dismissTimer.value = setTimeout(() => {
    handleDismiss()
  }, props.dismissDelay)
}

const stopAutoDismiss = () => {
  if (dismissTimer.value) {
    clearTimeout(dismissTimer.value)
    dismissTimer.value = null
  }
}

// Watchers
watch(
  () => props.show,
  newValue => {
    show.value = newValue
    if (newValue && props.autoDismiss) {
      startAutoDismiss()
    } else {
      stopAutoDismiss()
    }
  },
)

watch(
  () => props.autoDismiss,
  newValue => {
    if (newValue && show.value) {
      startAutoDismiss()
    } else {
      stopAutoDismiss()
    }
  },
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

<template>
  <Transition name="alert" appear enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-2" enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-200 ease-in" leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-2">
    <div v-if="show" :id="id" class="relative overflow-hidden border rounded-lg transition-all duration-200" :class="[
      variantClasses,
      sizeClasses,
    ]" :role="role" :aria-labelledby="titleId" :aria-describedby="messageId" :aria-live="ariaLive"
      :data-variant="variant" :data-size="size">
      <!-- Main content -->
      <div class="flex items-start gap-3 p-4">
        <!-- Status icon -->
        <div v-if="showIcon" class="flex-shrink-0 mt-0.5" :class="[iconClasses]">
          <BaseIcon :icon="stateIcons[variant]" size="sm" :color="getIconColor(variant)" :aria-hidden="true" />
        </div>

        <!-- Text content -->
        <div class="flex-1 min-w-0">
          <!-- Title -->
          <h3 v-if="title" :id="titleId" class="font-semibold leading-5" :class="[titleClasses]">
            {{ title }}
          </h3>

          <!-- Message -->
          <div v-if="message" :id="messageId" class="text-sm leading-5 mt-1" :class="[messageClasses]">
            {{ message }}
          </div>

          <!-- Additional content slot -->
          <div v-if="$slots.default" class="mt-2">
            <slot />
          </div>

          <!-- Action links -->
          <div v-if="actions && actions.length > 0" class="mt-3 flex flex-wrap gap-3">
            <button v-for="(action, index) in actions" :key="index" type="button" class="text-sm font-medium underline hover:no-underline transition-all duration-200" :class="[
              actionClasses,
            ]" @click="handleAction(action)">
              {{ action.label }}
            </button>
          </div>
        </div>

        <!-- Close button -->
        <button v-if="dismissible" type="button" :aria-label="closeButtonAriaLabel" :class="closeButtonClasses"
          @click="handleDismiss">
          <X :class="closeIconClasses" />
          <span class="sr-only">×</span>
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Motion reduction support */
@media (prefers-reduced-motion: reduce) {
  .transition-all {
    transition: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .border {
    border-width: 2px;
  }
}

/* Focus visible for accessibility */
.focus\:ring-2:focus {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
</style>
