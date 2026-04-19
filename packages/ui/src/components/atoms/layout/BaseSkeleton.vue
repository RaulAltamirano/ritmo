<template>
  <div :class="[
    'animate-pulse min-h-px min-w-px',
    skeletonClasses,
    sizeClasses,
    variantClasses,
    roundedClasses,
    className,
  ]" :style="customStyles" role="status" :aria-label="ariaLabel" />
</template>

<script setup lang="ts">
import { useColors } from '@ritmo/ui'
import { computed } from 'vue'

interface BaseSkeletonProps {
  variant?: 'default' | 'text' | 'circular' | 'rectangular'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  width?: string | number
  height?: string | number
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full'
  className?: string
  ariaLabel?: string
}

const props = withDefaults(defineProps<BaseSkeletonProps>(), {
  variant: 'default',
  size: 'md',
  rounded: 'md',
  ariaLabel: 'Loading content',
})

// Composables del sistema de diseño
const { getSurface } = useColors()

// Clases de colores usando tokens del sistema
const skeletonClasses = computed(() => {
  // Usar clases Tailwind directamente para evitar problemas de composables
  return 'bg-gray-200 dark:bg-gray-700'
})

// Clases de tamaño
const sizeClasses = computed(() => {
  const sizes = {
    xs: 'h-2 w-16',
    sm: 'h-3 w-24',
    md: 'h-4 w-32',
    lg: 'h-6 w-40',
    xl: 'h-8 w-48',
  }
  return sizes[props.size]
})

// Clases de variante
const variantClasses = computed(() => {
  const variants = {
    default: '',
    text: 'h-4 w-full',
    circular: 'rounded-full',
    rectangular: 'w-full',
  }
  return variants[props.variant]
})

// Clases de bordes redondeados
const roundedClasses = computed(() => {
  const rounded = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  }
  return rounded[props.rounded]
})

// Estilos personalizados para width y height
const customStyles = computed(() => {
  const styles: Record<string, string> = {}

  if (props.width) {
    styles.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  }

  if (props.height) {
    styles.height =
      typeof props.height === 'number' ? `${props.height}px` : props.height
  }

  return styles
})
</script>

<style scoped>
/* Animación de pulso personalizada */
@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Soporte para motion reducido */
@media (prefers-reduced-motion: reduce) {
  .animate-pulse {
    animation: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .skeleton {
    @apply border border-current;
  }
}

/* Transiciones suaves */
.skeleton {
  @apply transition-all duration-200 ease-in-out;
}

/* Estados de hover para debugging */
.skeleton:hover {
  @apply opacity-80;
}
</style>
