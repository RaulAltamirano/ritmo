<script setup lang="ts">
import { useAtomicDesign } from '../../../composables/useAtomicDesign'
import { useColors } from '../../../composables/useColors'
import { useId } from '../../../composables/useId'
import { useTypography } from '../../../composables/useTypography'
import { useEventListener, useRafFn, useThrottleFn } from '@vueuse/core'
import type { Component } from 'vue'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from '../../../i18n'
import type { ButtonSize, ButtonVariant } from '../../../types/button'
import BaseIcon from '../display/BaseIcon.vue'
import BaseSpinner from '../display/BaseSpinner.vue'

interface BaseButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: Component
  iconRight?: boolean
  iconOnly?: boolean
  disabled?: boolean
  loading?: boolean
  loadingVariant?: 'circular' | 'dots'
  type?: 'button' | 'submit' | 'reset'
  fullWidth?: boolean
  clickable?: boolean
  ariaLabel?: string
  ariaDescribedby?: string
  ariaControls?: string
  ariaHasPopup?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog'
  pressed?: boolean
  expanded?: boolean
  loadingText?: string
}

const props = withDefaults(defineProps<BaseButtonProps>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  loadingVariant: 'circular',
  type: 'button',
  fullWidth: false,
  clickable: true,
  iconRight: false,
  iconOnly: false,
  pressed: false,
  expanded: false,
  loadingText: 'Cargando...',
})

const emit = defineEmits<{
  click: [event: MouseEvent | KeyboardEvent]
  arrowRight: [event: KeyboardEvent]
  arrowLeft: [event: KeyboardEvent]
  pointerDown: [event: PointerEvent]
  pointerUp: [event: PointerEvent]
}>()

// Referencias del DOM
const buttonRef = ref<HTMLButtonElement>()

// Estado local para interactividad (más robusto que VueUse en Storybook)
const isHovered = ref(false)
const isFocused = ref(false)
const isPressed = ref(false)
const prefersReducedMotion = ref(false)
const isShiftPressed = ref(false)
const isCtrlPressed = ref(false)
const isAltPressed = ref(false)
let motionMediaQuery: MediaQueryList | null = null

const handleModifierKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Shift') isShiftPressed.value = true
  if (e.key === 'Control') isCtrlPressed.value = true
  if (e.key === 'Alt') isAltPressed.value = true
}

const handleModifierKeyUp = (e: KeyboardEvent) => {
  if (e.key === 'Shift') isShiftPressed.value = false
  if (e.key === 'Control') isCtrlPressed.value = false
  if (e.key === 'Alt') isAltPressed.value = false
}

const handleMotionPreferenceChange = (event: MediaQueryListEvent) => {
  prefersReducedMotion.value = event.matches
}

// Detectar preferencias de movimiento reducido
onMounted(() => {
  if (typeof globalThis.window !== 'undefined') {
    motionMediaQuery = globalThis.window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.value = motionMediaQuery.matches

    motionMediaQuery.addEventListener('change', handleMotionPreferenceChange)
    globalThis.window.addEventListener('keydown', handleModifierKeyDown)
    globalThis.window.addEventListener('keyup', handleModifierKeyUp)
  }
})

onUnmounted(() => {
  if (typeof globalThis.window !== 'undefined') {
    globalThis.window.removeEventListener('keydown', handleModifierKeyDown)
    globalThis.window.removeEventListener('keyup', handleModifierKeyUp)
  }
  motionMediaQuery?.removeEventListener('change', handleMotionPreferenceChange)
})

// Usar el sistema unificado de diseño atómico
const {
  useAtomicState,
  useAtomicSize,
  useAtomicColor,
  useAtomicAccessibility,
  useAtomicEvents,
  useAtomicTransitions,
  useAtomicStates,
  componentVariants,
  composeClasses,
} = useAtomicDesign()

// Usar tipografía unificada
const typography = useTypography()

// Usar colores del sistema de diseño
const {
  getSurface,
  getTextSemantic,
  getBorderSemantic,
  getColor,
  getTextColor,
  getButtonTextColor,
} = useColors()

// ID único para accesibilidad usando el sistema determinístico
const buttonId = useId('button', {
  variant: props.variant,
  size: props.size,
  type: props.type,
})

// i18n support
const { t } = useI18n()

// Función para obtener el estado actual mejorada con VueUse
const getCurrentState = () => {
  if (props.disabled) return 'disabled'
  if (props.loading) return 'loading'
  if (isFocused.value) return 'focused'
  if (isHovered.value) return 'hovered'
  if (isShiftPressed.value || isCtrlPressed.value || isAltPressed.value)
    return 'modifier-active'
  return 'default'
}

// Estado del componente usando sistema unificado
const { state, setHovered, setPressed, setFocused } = useAtomicState()

// Clases del sistema unificado
const sizeClasses = useAtomicSize(props.size)
const accessibilityProps = useAtomicAccessibility('button', props.ariaLabel)
const transitions = useAtomicTransitions('normal', 'out')
const interactiveStates = useAtomicStates(state.value)

// Computed para aria-describedby dinámico
const describedBy = computed(() => {
  const ids = []
  if (props.ariaDescribedby) ids.push(props.ariaDescribedby)
  if (props.loading) ids.push(`${buttonId.value}-loading`)
  return ids.length > 0 ? ids.join(' ') : undefined
})

// Función para aria-describedby con i18n
const getDescribedBy = () => {
  const ids = []
  if (props.ariaDescribedby) ids.push(props.ariaDescribedby)
  if (props.loading) ids.push(`${buttonId.value}-loading`)
  return ids.length > 0 ? ids.join(' ') : undefined
}

// Computed para icon aria-label
const iconAriaLabel = computed(() => {
  if (typeof props.icon === 'string') {
    return props.icon
  }
  return 'Icon'
})

// Función para obtener el tamaño del icono basado en el tamaño del botón
const getIconSize = (): 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' => {
  const sizeMap: Record<string, 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'> = {
    xs: 'xs',
    sm: 'sm',
    md: 'sm',
    lg: 'md',
    xl: 'lg',
  }
  return sizeMap[props.size] || 'sm'
}

// Clases del botón mejoradas con VueUse
const buttonClasses = computed(() => {
  const baseClasses = [
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'active:transform active:scale-95',
  ]

  // Clases de tamaño usando tokens
  const sizeClasses = {
    xs: props.iconOnly ? 'p-1 text-xs min-h-[1.5rem] min-w-[1.5rem]' : 'px-2 py-1 text-xs min-h-[1.5rem]',
    sm: props.iconOnly ? 'p-1.5 text-sm min-h-[2rem] min-w-[2rem]' : 'px-3 py-1.5 text-sm min-h-[2rem]',
    md: props.iconOnly ? 'p-2 text-sm min-h-[2.5rem] min-w-[2.5rem]' : 'px-4 py-2 text-sm min-h-[2.5rem]',
    lg: props.iconOnly ? 'p-3 text-base min-h-[3rem] min-w-[3rem]' : 'px-6 py-3 text-base min-h-[3rem]',
    xl: props.iconOnly ? 'p-4 text-lg min-h-[3.5rem] min-w-[3.5rem]' : 'px-8 py-4 text-lg min-h-[3.5rem]',
  }

  // Variantes usando clases directas de Tailwind
  const variantClasses = {
    primary: `bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-500 dark:text-white dark:hover:bg-blue-600`,
    secondary: `bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600`,
    success: `bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 dark:bg-green-500 dark:text-white dark:hover:bg-green-600`,
    warning: `bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500 dark:bg-yellow-500 dark:text-white dark:hover:bg-yellow-600`,
    error: `bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 dark:bg-red-500 dark:text-white dark:hover:bg-red-600`,
    info: `bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-500 dark:text-white dark:hover:bg-blue-600`,
    ghost: `bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-800`,
    outline: `bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800`,
    minimal: `bg-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800`,
  }

  // Clases dinámicas basadas en estado local
  const dynamicClasses = [
    // Hover con respeto a preferencias de movimiento
    isHovered.value && !prefersReducedMotion.value
      ? 'hover:scale-105 hover:shadow-lg'
      : '',

    // Focus mejorado
    isFocused.value ? 'ring-2 ring-offset-2' : '',

    // Modificadores de teclado
    isShiftPressed.value ? 'ring-2 ring-blue-500 ring-offset-2' : '',
    isCtrlPressed.value ? 'ring-2 ring-green-500 ring-offset-2' : '',
    isAltPressed.value ? 'ring-2 ring-yellow-500 ring-offset-2' : '',

    // Transiciones respetando preferencias
    prefersReducedMotion.value
      ? 'transition-none'
      : 'transition-all duration-200 ease-out',
  ]

  return [
    ...baseClasses,
    sizeClasses[props.size] || sizeClasses.md,
    variantClasses[props.variant] || variantClasses.primary,
    props.fullWidth ? 'w-full' : '',
    props.loading ? 'cursor-wait relative overflow-hidden' : '',
    props.disabled ? 'cursor-not-allowed' : '',
    ...dynamicClasses,
  ]
    .filter(Boolean)
    .join(' ')
})

// Event handlers optimizados con VueUse
const handleButtonClick = (event: MouseEvent | KeyboardEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}

const handleButtonKeyDown = (event: KeyboardEvent) => {
  if (props.disabled || props.loading) return

  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault()
      handleButtonClick(event)
      break
    case 'ArrowRight':
      emit('arrowRight', event)
      break
    case 'ArrowLeft':
      emit('arrowLeft', event)
      break
  }
}

const handleButtonPointerDown = (event: PointerEvent) => {
  if (!props.disabled && !props.loading) {
    isPressed.value = true
    emit('pointerDown', event)
  }
}

const handleButtonPointerUp = (event: PointerEvent) => {
  if (!props.disabled && !props.loading) {
    isPressed.value = false
    emit('pointerUp', event)
  }
}

const handleButtonPointerLeave = () => {
  if (!props.disabled && !props.loading) {
    isPressed.value = false
  }
}

const handleButtonMouseEnter = () => {
  if (!props.disabled && !props.loading) {
    isHovered.value = true
  }
}

const handleButtonMouseLeave = () => {
  if (!props.disabled && !props.loading) {
    isHovered.value = false
  }
}

const handleButtonFocus = () => {
  if (!props.disabled && !props.loading) {
    isFocused.value = true
  }
}

const handleButtonBlur = () => {
  if (!props.disabled && !props.loading) {
    isFocused.value = false
  }
}

// Sincronizar estado VueUse con estado interno
watch(isHovered, newValue => {
  setHovered(newValue)
})

// Event listeners globales optimizados
useEventListener('keydown', event => {
  if (isFocused.value && event.key === 'Escape') {
    event.preventDefault()
    buttonRef.value?.blur()
  }
})

// Throttle para eventos de movimiento para mejor performance
const throttledMouseMove = useThrottleFn((event: MouseEvent) => {
  // Lógica adicional de movimiento si es necesaria
}, 16) // ~60fps

// RAF para animaciones suaves
const { pause: pauseAnimation, resume: resumeAnimation } = useRafFn(() => {
  // Animaciones personalizadas si es necesario
})

// Computed para el color del spinner basado en el botón
const getSpinnerColorForButton = ():
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral'
  | 'white'
  | 'auto' => {
  // Para botones con fondo oscuro, usar colores claros con mejor contraste
  if (
    ['primary', 'secondary', 'success', 'warning', 'error', 'info'].includes(
      props.variant,
    )
  ) {
    return 'white' // Usar blanco sólido en lugar de 'auto' para mejor visibilidad
  }

  // Para botones ghost/outline, usar colores del tema
  if (props.variant === 'ghost') {
    return 'neutral'
  }

  if (props.variant === 'outline') {
    return 'neutral'
  }

  // Fallback
  return 'primary'
}

// Validar props con manejo de errores mejorado
const validVariants = [
  'primary',
  'secondary',
  'success',
  'warning',
  'error',
  'ghost',
  'outline',
  'info',
]
const validSizes = ['xs', 'sm', 'md', 'lg', 'xl']

const validateProps = () => {
  const errors = []

  if (!validVariants.includes(props.variant)) {
    errors.push(
      `Invalid variant '${props.variant}'. Valid variants are: ${validVariants.join(', ')}`,
    )
  }

  if (!validSizes.includes(props.size)) {
    errors.push(
      `Invalid size '${props.size}'. Valid sizes are: ${validSizes.join(', ')}`,
    )
  }

  if (errors.length > 0) {
    console.warn('BaseButton validation errors:', errors.join(', '))
    return false
  }

  return true
}

// Validar en mounted
onMounted(() => {
  validateProps()
  // Iniciar animaciones si no hay preferencia de movimiento reducido
  if (!prefersReducedMotion.value) {
    resumeAnimation()
  }
})

// Validar en watch
watch([() => props.variant, () => props.size], () => {
  validateProps()
})

// Watch preferencias de movimiento
watch(prefersReducedMotion, reduced => {
  if (reduced) {
    pauseAnimation()
  } else {
    resumeAnimation()
  }
})
</script>

<template>
  <button ref="buttonRef" :id="buttonId" :class="buttonClasses" :disabled="disabled || loading" :type="type"
    :aria-label="ariaLabel" :aria-busy="loading" :aria-pressed="pressed" :aria-expanded="expanded"
    :aria-describedby="getDescribedBy()" :aria-live="loading ? 'polite' : 'off'" :aria-controls="ariaControls"
    :aria-haspopup="ariaHasPopup" :tabindex="clickable ? '0' : undefined" :data-variant="variant" :data-size="size"
    :data-state="getCurrentState()" @click="handleButtonClick" @keydown="handleButtonKeyDown"
    @pointerdown="handleButtonPointerDown" @pointerup="handleButtonPointerUp" @pointerleave="handleButtonPointerLeave"
    @mouseenter="handleButtonMouseEnter" @mouseleave="handleButtonMouseLeave" @focus="handleButtonFocus"
    @blur="handleButtonBlur">
    <!-- Loading spinner with better accessibility -->
    <div v-if="loading" :id="`${buttonId}-loading`"
      class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10"
      :aria-hidden="true">
      <BaseSpinner size="sm" :variant="loadingVariant" :color="getSpinnerColorForButton()" data-testid="base-spinner" />
    </div>

    <!-- Content container with loading opacity -->
    <div class="flex items-center justify-center transition-opacity duration-200" :class="[
      loading ? 'opacity-0' : 'opacity-100',
    ]">
      <!-- Left icon with better accessibility -->
      <BaseIcon v-if="icon && !iconRight && !iconOnly" :icon="icon" :size="getIconSize()" color="current" class="mr-1.5"
        :aria-label="`${iconAriaLabel} icono`" role="img" data-testid="base-icon" />

      <!-- Icon-only button (centered) -->
      <BaseIcon v-if="icon && iconOnly" :icon="icon" :size="getIconSize()" color="current"
        :aria-label="`${iconAriaLabel} icono`" role="img" data-testid="base-icon" />

      <!-- Button content -->
      <span :class="{ 'sr-only': icon && !$slots.default }" :data-content="!!$slots.default"
        :id="`${buttonId}-content`">
        <slot />
      </span>

      <!-- Right icon -->
      <BaseIcon v-if="icon && iconRight && !iconOnly" :icon="icon" :size="getIconSize()" color="current" class="ml-1.5"
        :aria-label="`${iconAriaLabel} icono`" role="img" data-testid="base-icon" />
    </div>

    <!-- Screen reader only loading text -->
    <span v-if="loading" class="sr-only" aria-live="polite">
      {{ t('button.loading') }}
    </span>
  </button>
</template>

<style scoped>
/* Solo estilos específicos que no se pueden lograr con Tailwind */

/* High contrast mode support */
@media (prefers-contrast: high) {
  button {
    border-width: 2px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  button {
    transition: none !important;
    transform: none !important;
  }
}

/* Focus visible support for all browsers */
button:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

/* High DPI displays optimization */
@media (-webkit-min-device-pixel-ratio: 2),
(min-resolution: 192dpi) {
  button {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}
</style>
