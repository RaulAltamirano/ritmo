<script setup lang="ts">
import * as LucideIcons from 'lucide-vue-next'
import { computed, ref, useSlots } from 'vue'
import BaseIcon from '../display/BaseIcon.vue'
import BaseSpinner from '../display/BaseSpinner.vue'

// Props
const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
  },
  size: {
    type: String,
    default: 'md',
  },
  content: {
    type: String,
    default: '',
  },
  count: {
    type: Number,
    default: undefined,
  },
  maxCount: {
    type: Number,
    default: 99,
  },
  leftIcon: {
    type: [String, Object],
    default: undefined,
  },
  rightIcon: {
    type: [String, Object],
    default: undefined,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  clickable: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  tag: {
    type: String,
    default: 'span',
  },
  ariaLabel: {
    type: String,
    default: '',
  },
})

// Emits
const emit = defineEmits(['click'])

// Composables
const slots = useSlots()

// Función para obtener icono dinámicamente
const getIconComponent = (iconName) => {
  if (!iconName) return null

  // Si ya es un componente, devolverlo
  if (typeof iconName === 'object') {
    return iconName
  }

  // Convertir string a componente de Lucide
  const iconKey = iconName.charAt(0).toUpperCase() + iconName.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase())
  return LucideIcons[iconKey] || null
}

// Estado interno
const isPressed = ref(false)
const badgeRef = ref()

// Computed properties
const tag = computed(() => {
  if (props.clickable) return 'button'
  return props.tag
})

const tabindex = computed(() => {
  if (props.clickable && !props.disabled) return 0
  return undefined
})

const computedRole = computed(() => {
  if (props.clickable) return 'button'
  return 'generic'
})

const ariaLive = computed(() => {
  if (props.loading) return 'polite'
  return undefined
})

const hasContent = computed(() => {
  return !props.loading && (props.content || !!slots.default)
})

const showCount = computed(() => {
  return props.count !== undefined && props.count > 0
})

const formattedCount = computed(() => {
  if (!props.count) return ''

  if (props.count > props.maxCount) {
    return `${props.maxCount}+`
  }

  if (props.count >= 1000) {
    return props.count >= 1000000
      ? `${(props.count / 1000000).toFixed(1)}M`
      : `${(props.count / 1000).toFixed(1)}K`
  }

  return props.count.toString()
})

const countAriaLabel = computed(() => {
  return `${props.count} elementos`
})

const iconSize = computed(() => {
  const sizeMap = {
    xs: 'xs',
    sm: 'xs',
    md: 'sm',
    lg: 'sm',
  }
  return sizeMap[props.size] || 'sm'
})

const spinnerColor = computed(() => {
  // Para variantes con fondo oscuro, usar 'auto' para detección automática
  if (['primary', 'success', 'warning', 'error', 'info'].includes(props.variant)) {
    return 'auto'
  }
  return 'neutral'
})

// Obtener los iconos como componentes
const leftIconComponent = computed(() => getIconComponent(props.leftIcon))
const rightIconComponent = computed(() => getIconComponent(props.rightIcon))

// Clases CSS optimizadas para 2025
const badgeClasses = computed(() => {
  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'font-medium',
    'transition-all',
    'duration-200',
    'ease-out',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-1',
  ]

  // Clases de tamaño
  const sizeClasses = {
    xs: 'px-2 py-0.5 text-xs h-5 min-w-[1.25rem] rounded-md',
    sm: 'px-2.5 py-1 text-sm h-6 min-w-[1.5rem] rounded-lg',
    md: 'px-3 py-1.5 text-sm h-7 min-w-[1.75rem] rounded-lg',
    lg: 'px-4 py-2 text-base h-8 min-w-[2rem] rounded-xl',
  }

  // Clases de variante - diseño minimalista 2025 con soporte completo para dark mode
  const variantClasses = {
    primary: [
      'bg-blue-600 text-white dark:bg-blue-500 dark:text-white',
      'hover:bg-blue-700 dark:hover:bg-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400',
      'disabled:bg-blue-300 dark:disabled:bg-blue-800 disabled:cursor-not-allowed',
    ],
    secondary: [
      'bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600',
      'hover:bg-gray-200 dark:hover:bg-gray-700 focus:ring-gray-500 dark:focus:ring-gray-400',
      'disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:text-gray-400 dark:disabled:text-gray-600',
    ],
    success: [
      'bg-green-600 text-white dark:bg-green-500 dark:text-white',
      'hover:bg-green-700 dark:hover:bg-green-600 focus:ring-green-500 dark:focus:ring-green-400',
      'disabled:bg-green-300 dark:disabled:bg-green-800',
    ],
    warning: [
      'bg-amber-500 text-white dark:bg-amber-500 dark:text-white',
      'hover:bg-amber-600 dark:hover:bg-amber-600 focus:ring-amber-400 dark:focus:ring-amber-300',
      'disabled:bg-amber-300 dark:disabled:bg-amber-800',
    ],
    error: [
      'bg-red-600 text-white dark:bg-red-500 dark:text-white',
      'hover:bg-red-700 dark:hover:bg-red-600 focus:ring-red-500 dark:focus:ring-red-400',
      'disabled:bg-red-300 dark:disabled:bg-red-800',
    ],
    info: [
      'bg-cyan-600 text-white dark:bg-cyan-500 dark:text-white',
      'hover:bg-cyan-700 dark:hover:bg-cyan-600 focus:ring-cyan-500 dark:focus:ring-cyan-400',
      'disabled:bg-cyan-300 dark:disabled:bg-cyan-800',
    ],
    neutral: [
      'bg-gray-600 text-white dark:bg-gray-500 dark:text-white',
      'hover:bg-gray-700 dark:hover:bg-gray-600 focus:ring-gray-500 dark:focus:ring-gray-400',
      'disabled:bg-gray-400 dark:disabled:bg-gray-700',
    ],
    subtle: [
      'bg-gray-50 text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600',
      'hover:bg-surface-overlay focus:ring-gray-400 dark:focus:ring-gray-500',
      'disabled:bg-gray-25 dark:disabled:bg-gray-900 disabled:text-gray-400 dark:disabled:text-gray-600',
    ],
  }

  // Clases de estado
  const stateClasses = []

  if (props.clickable && !props.disabled) {
    stateClasses.push('cursor-pointer', 'active:scale-95')
  }

  if (props.disabled) {
    stateClasses.push('opacity-50', 'cursor-not-allowed')
  }

  return [
    ...baseClasses,
    sizeClasses[props.size] || sizeClasses.md,
    ...(variantClasses[props.variant] || variantClasses.primary),
    ...stateClasses,
  ].join(' ')
})

const contentClasses = computed(() => {
  return [
    'flex-shrink-0',
    'leading-none',
    'font-medium',
  ].join(' ')
})

const iconClasses = computed(() => {
  return [
    'flex-shrink-0',
    'transition-transform',
    'duration-200',
  ].join(' ')
})

const countClasses = computed(() => {
  const baseClasses = [
    'flex-shrink-0',
    'rounded-full',
    'px-1.5',
    'py-0.5',
    'text-xs',
    'font-bold',
    'leading-none',
    'min-w-[1.25rem]',
    'h-5',
  ]

  // Color del contador basado en la variante con soporte para dark mode
  const countColorClasses = {
    primary: 'bg-blue-700 text-white dark:bg-blue-600 dark:text-white',
    secondary: 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200',
    success: 'bg-green-700 text-white dark:bg-green-600 dark:text-white',
    warning: 'bg-amber-600 text-white dark:bg-amber-500 dark:text-white',
    error: 'bg-red-700 text-white dark:bg-red-600 dark:text-white',
    info: 'bg-cyan-700 text-white dark:bg-cyan-600 dark:text-white',
    neutral: 'bg-gray-700 text-white dark:bg-gray-600 dark:text-white',
    subtle: 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200',
  }

  return [
    ...baseClasses,
    countColorClasses[props.variant] || countColorClasses.primary,
  ].join(' ')
})

// Event handlers
const handleClick = (event) => {
  if (props.disabled || props.loading) return

  emit('click', event)

  if (props.clickable) {
    isPressed.value = true
    // Reset pressed state immediately for simplicity
    isPressed.value = false
  }
}

const handleKeyDown = (event) => {
  if (props.disabled || props.loading || !props.clickable) return

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    handleClick(event)
  }
}

// Expose
defineExpose({
  focus: () => badgeRef.value?.focus(),
})
</script>

<template>
  <component :is="tag" ref="badgeRef" :class="badgeClasses" :role="computedRole" :tabindex="tabindex"
    :aria-label="ariaLabel" :aria-pressed="isPressed" :aria-live="ariaLive" :aria-busy="loading" :disabled="disabled"
    @click="handleClick" @keydown="handleKeyDown">
    <!-- Icono izquierdo -->
    <BaseIcon v-if="leftIconComponent" :icon="leftIconComponent" :size="iconSize" :class="iconClasses" class="mr-1"
      aria-hidden />

    <!-- Spinner de carga -->
    <BaseSpinner v-if="loading" :size="iconSize" :color="spinnerColor" class="flex-shrink-0 mr-1" aria-hidden />

    <!-- Contenido del badge -->
    <span v-if="hasContent" :class="[contentClasses, { 'mr-1': rightIconComponent || showCount }]">
      <slot>{{ content }}</slot>
    </span>

    <!-- Icono derecho -->
    <BaseIcon v-if="rightIconComponent" :icon="rightIconComponent" :size="iconSize" :class="iconClasses" class="mr-1"
      aria-hidden />

    <!-- Contador -->
    <span v-if="showCount" :class="countClasses" :aria-label="countAriaLabel">
      {{ formattedCount }}
    </span>
  </component>
</template>

<style scoped>
/* Optimizaciones para 2025 con soporte completo para dark mode */

/* Soporte para modo oscuro */
@media (prefers-color-scheme: dark) {
  .dark {
    color-scheme: dark;
  }
}

/* Asegurar que las clases dark: funcionen correctamente */
:global(.dark) {
  color-scheme: dark;
}

/* Reducir movimiento para usuarios sensibles */
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    animation: none !important;
  }
}

/* Alto contraste */
@media (prefers-contrast: high) {
  .border {
    border-width: 2px;
  }

  /* Mejorar contraste en dark mode */
  :global(.dark) .border {
    border-color: currentColor;
  }
}

/* Optimizaciones para pantallas de alta densidad */
@media (-webkit-min-device-pixel-ratio: 2),
(min-resolution: 192dpi) {
  .badge {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}

/* Optimizaciones para impresión */
@media print {
  .badge {
    border: 1px solid #000;
    background-color: white !important;
    color: black !important;
    box-shadow: none !important;
  }
}

/* Transiciones suaves y modernas */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Estados de focus mejorados con soporte para dark mode */
.focus\:ring-2:focus {
  box-shadow: 0 0 0 2px currentColor;
}

:global(.dark) .focus\:ring-2:focus {
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5);
}

/* Animaciones de escala optimizadas */
.active\:scale-95:active {
  transform: scale(0.95);
}

/* Soporte para colores personalizados */
.bg-gray-25 {
  background-color: #fafafa;
}

:global(.dark) .bg-gray-25 {
  background-color: #1f2937;
}

/* Asegurar que los iconos se vean bien en dark mode */
:global(.dark) .icon {
  filter: brightness(1.1);
}

/* Mejorar la visibilidad de los badges en dark mode */
:global(.dark) .badge {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3);
}

/* Estados hover mejorados para dark mode */
:global(.dark) .badge:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
}

/* Asegurar que los contadores sean visibles en dark mode */
:global(.dark) .count {
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
}
</style>
