<template>
  <component :is="icon" :size="getIconSize()" :class="[iconClasses.base, iconClasses.size, iconClasses.color]"
    :aria-hidden="safeAriaHidden" :aria-label="accessibilityProps['aria-label']" :role="accessibilityProps.role"
    :tabindex="accessibilityProps.tabindex" :data-icon-size="size" :data-icon-color="color" />
</template>

<script setup lang="ts">
import { useColors } from '@ritmo/ui'
import type { Component } from 'vue'
import { computed } from 'vue'

interface BaseIconProps {
  icon: Component
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  color?:
  | 'current'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'muted'
  ariaHidden?: boolean
  ariaLabel?: string
  role?: string
}

const props = withDefaults(defineProps<BaseIconProps>(), {
  size: 'md',
  color: 'current',
  ariaHidden: true,
  role: 'img',
})

// Composable de colores del sistema
const { getTextColor, getTextSemantic } = useColors()

// Función para obtener clases de tamaño por defecto
const getSizeClasses = (size: string) => {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
    '2xl': 'w-12 h-12',
  }
  return sizes[size] || sizes.md
}

// Función para obtener el tamaño numérico para iconos de Lucide
const getIconSize = () => {
  const sizeMap = {
    xs: 12,
    sm: 16,
    md: 24,
    lg: 32,
    xl: 40,
    '2xl': 48,
  }
  return sizeMap[props.size] || sizeMap.md
}

// Clases de icono usando tokens del sistema
const iconClasses = computed(() => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
    '2xl': 'w-12 h-12',
  }

  // Colores usando tokens del sistema
  const colorClasses = {
    current: 'text-current',
    primary: `${getTextColor('primary', '600').value} dark:${getTextColor('primary', '400').value}`,
    secondary: `${getTextColor('neutral', '600').value} dark:${getTextColor('neutral', '400').value}`,
    success: `${getTextColor('success', '600').value} dark:${getTextColor('success', '400').value}`,
    warning: `${getTextColor('warning', '600').value} dark:${getTextColor('warning', '400').value}`,
    error: `${getTextColor('error', '600').value} dark:${getTextColor('error', '400').value}`,
    info: `${getTextColor('info', '600').value} dark:${getTextColor('info', '400').value}`,
    muted: `${getTextColor('neutral', '500').value} dark:${getTextColor('neutral', '400').value}`,
  }

  return {
    base: 'inline-block',
    size: sizeClasses[props.size] || getSizeClasses('md'),
    color: colorClasses[props.color] || getTextSemantic('current').value,
  }
})

// Asegurar que ariaHidden sea siempre un boolean
const safeAriaHidden = computed(() => {
  if (typeof props.ariaHidden === 'boolean') {
    return props.ariaHidden
  }
  if (typeof props.ariaHidden === 'string') {
    return props.ariaHidden === 'true'
  }
  return true // valor por defecto
})

// Props de accesibilidad simplificadas
const accessibilityProps = computed(() => ({
  'aria-label': props.ariaLabel || undefined,
  role: props.role || 'img',
  tabindex: undefined,
}))

// Validar props
const validSizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
const validColors = [
  'current',
  'primary',
  'secondary',
  'success',
  'warning',
  'error',
  'info',
  'muted',
]

if (!validSizes.includes(props.size)) {
  console.warn(
    `BaseIcon: Invalid size '${props.size}'. Valid sizes are: ${validSizes.join(', ')}`,
  )
}

if (!validColors.includes(props.color)) {
  console.warn(
    `BaseIcon: Invalid color '${props.color}'. Valid colors are: ${validColors.join(', ')}`,
  )
}
</script>

<style scoped>
/* Optimizaciones para iconos SVG nítidos */
svg {
  shape-rendering: geometricPrecision;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  svg {
    stroke-width: 1.5;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none;
  }
}

/* High DPI displays optimization */
@media (-webkit-min-device-pixel-ratio: 2),
(min-resolution: 192dpi) {
  svg {
    shape-rendering: crispEdges;
  }
}

/* Print optimization */
@media print {
  svg {
    shape-rendering: crispEdges;
  }
}
</style>
