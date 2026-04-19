<template>
  <div :class="['inline-flex items-center justify-center', sizeClasses, className]" role="status"
    :aria-label="ariaLabel">
    <!-- Spinner circular orbital mejorado -->
    <div v-if="validVariant === 'circular'" :class="['loader']" :style="{
      '--spinner-color': getSpinnerColorValue(),
      width: getLoaderSize(),
      height: getLoaderSize(),
    }">
      <div v-for="i in 4" :key="i" :class="['orbe']" :style="{
        '--index': i,
        '--size-orbe': getOrbeSize(),
        '--delay': `${(i - 1) * 0.1}s`,
      }" />
    </div>

    <!-- Spinner de puntos mejorado -->
    <div v-else-if="validVariant === 'dots'" :class="['flex items-center space-x-1', dotsContainerClasses]">
      <div v-for="i in 3" :key="i" :class="['rounded-full', dotClasses, 'animate-bounce-subtle']" :style="{
        animationDelay: `${(i - 1) * 0.15}s`,
        animationDuration: '1.2s',
      }" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useColors } from '@ritmo/ui'
import { computed } from 'vue'

interface BaseSpinnerProps {
  variant?: 'circular' | 'dots'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?:
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral'
  | 'white'
  | 'auto'
  className?: string
  ariaLabel?: string
}

const props = withDefaults(defineProps<BaseSpinnerProps>(), {
  variant: 'circular',
  size: 'md',
  color: 'primary',
  ariaLabel: 'Loading',
})

// Composable de colores del sistema
const { getColor, getTextColor, getBorderColor } = useColors()

// Sistema de colores usando colores CSS directos
const colorMap = {
  primary: '#3b82f6',
  secondary: '#6b7280',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#06b6d4',
  neutral: '#6b7280',
  white: '#ffffff',
}

// Colores de fondo para detectar contexto del botón usando tokens
const buttonColorMap = {
  primary: getColor('primary', '600'),
  secondary: getColor('neutral', '600'),
  success: getColor('success', '600'),
  warning: getColor('warning', '600'),
  error: getColor('error', '600'),
  info: getColor('info', '600'),
  ghost: 'bg-transparent',
  outline: 'bg-transparent',
}

// Colores de spinner optimizados para contraste
const getSpinnerColor = (buttonVariant: string) => {
  // Para botones con fondo oscuro, usar colores claros sólidos
  if (
    ['primary', 'secondary', 'success', 'warning', 'error', 'info'].includes(
      buttonVariant,
    )
  ) {
    return `${getTextColor('neutral', '100')} dark:${getTextColor('neutral', '100')}` // Sin opacidad para mejor contraste
  }

  // Para botones ghost/outline, usar colores del tema
  if (buttonVariant === 'ghost') {
    return `${getColor('neutral', '600')} dark:${getColor('neutral', '400')}`
  }

  if (buttonVariant === 'outline') {
    return `${getColor('neutral', '600')} dark:${getColor('neutral', '400')}`
  }

  // Fallback al color primario
  return `${getColor('primary', '600')} dark:${getColor('primary', '500')}`
}

const getDotColor = (buttonVariant: string) => {
  // Para botones con fondo oscuro, usar colores claros sólidos
  if (
    ['primary', 'secondary', 'success', 'warning', 'error', 'info'].includes(
      buttonVariant,
    )
  ) {
    return 'bg-white dark:bg-white' // Sin opacidad para mejor contraste
  }

  // Para botones ghost/outline, usar colores del tema
  if (buttonVariant === 'ghost') {
    return `${getColor('neutral', '600')} dark:${getColor('neutral', '400')}`
  }

  if (buttonVariant === 'outline') {
    return `${getColor('neutral', '600')} dark:${getColor('neutral', '400')}`
  }

  // Fallback al color primario
  return `${getColor('primary', '600')} dark:${getColor('primary', '500')}`
}

// Tamaños optimizados
const sizeMap = {
  xs: {
    container: 'w-4 h-4',
    dots: 'w-1 h-1',
    space: 'space-x-0.5',
    loader: 16,
    orbe: 3,
  },
  sm: {
    container: 'w-5 h-5',
    dots: 'w-1.5 h-1.5',
    space: 'space-x-1',
    loader: 20,
    orbe: 4,
  },
  md: {
    container: 'w-6 h-6',
    dots: 'w-2 h-2',
    space: 'space-x-1',
    loader: 24,
    orbe: 5,
  },
  lg: {
    container: 'w-8 h-8',
    dots: 'w-2.5 h-2.5',
    space: 'space-x-1.5',
    loader: 32,
    orbe: 6,
  },
  xl: {
    container: 'w-10 h-10',
    dots: 'w-3 h-3',
    space: 'space-x-2',
    loader: 40,
    orbe: 8,
  },
}

// Funciones para calcular tamaños del loader orbital
const getLoaderSize = () => {
  const size = sizeMap[props.size] || sizeMap.md
  return `${size.loader}px`
}

const getOrbeSize = () => {
  const size = sizeMap[props.size] || sizeMap.md
  return `${size.orbe}px`
}

// Función para obtener el valor del color del spinner
const getSpinnerColorValue = () => {
  if (props.color && props.color !== 'auto') {
    const colorKey = props.color as keyof typeof colorMap
    return colorMap[colorKey] || colorMap.primary
  }
  // Para uso automático, usar blanco sólido para mejor contraste en botones oscuros
  return colorMap.white
}

// Clases computadas
const sizeClasses = computed(() => {
  const size = sizeMap[props.size] || sizeMap.md
  return size.container
})

const spinnerColorClasses = computed(() => {
  // Usar el color del tema si se especifica, o detectar automáticamente
  if (props.color && props.color !== 'auto') {
    if (props.color === 'white') {
      return 'text-white' // Clase de texto blanco para mejor contraste
    }
    return colorMap[props.color] || colorMap.primary
  }

  // Para uso automático en botones, usar colores optimizados
  return getSpinnerColor('primary') // Fallback
})

const dotsContainerClasses = computed(() => {
  const size = sizeMap[props.size] || sizeMap.md
  return size.space
})

const dotClasses = computed(() => {
  const size = sizeMap[props.size] || sizeMap.md
  const dotSize = size.dots

  // Usar el color del tema si se especifica, o detectar automáticamente
  let color
  if (props.color && props.color !== 'auto') {
    if (props.color === 'white') {
      color = 'bg-white' // Color blanco sólido para mejor contraste
    } else {
      // Mapear colores a clases de Tailwind
      const colorClassMap = {
        primary: 'bg-blue-600',
        secondary: 'bg-gray-600',
        success: 'bg-green-600',
        warning: 'bg-yellow-600',
        error: 'bg-red-600',
        info: 'bg-cyan-600',
        neutral: 'bg-gray-600',
      }
      color =
        colorClassMap[props.color as keyof typeof colorClassMap] || 'bg-blue-600'
    }
  } else {
    // Para uso automático, usar color primario
    color = 'bg-blue-600'
  }

  return `${dotSize} ${color}`
})

// Validar variant
const validVariant = computed(() => {
  return ['circular', 'dots'].includes(props.variant) ? props.variant : 'circular'
})
</script>

<style scoped>
/* Spinner orbital mejorado */
.loader {
  position: relative;
  transform: rotate(45deg);
}

.orbe {
  position: absolute;
  width: 100%;
  height: 100%;
  animation: orbit7456 ease-in-out 1.5s var(--delay) infinite;
  opacity: calc(1 - calc(0.2 * var(--index)));
}

.orbe::after {
  position: absolute;
  content: '';
  top: 0;
  left: 0;
  width: var(--size-orbe);
  height: var(--size-orbe);
  background-color: var(--spinner-color, #ffffff);
  box-shadow: 0px 0px 20px 2px var(--spinner-color, #ffffff);
  border-radius: 50%;
  /* Asegurar que el color blanco sea visible */
  filter: brightness(1);
}

@keyframes orbit7456 {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* Animación verdaderamente fluida para el spinner circular (legacy) */
@keyframes spin-fluid {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@keyframes bounce-subtle {

  0%,
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }

  50% {
    transform: translateY(-4px) scale(1.1);
    opacity: 0.7;
  }
}

/* Aplicación de animaciones con easing profesional */
.animate-spin-fluid {
  animation: spin-fluid 1s linear infinite;
  will-change: transform;
  backface-visibility: hidden;
  perspective: 1000px;
  transform-origin: center;
}

.animate-bounce-subtle {
  animation: bounce-subtle 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
  will-change: transform, opacity;
}

/* Soporte para motion reducido */
@media (prefers-reduced-motion: reduce) {

  .animate-spin-fluid,
  .animate-bounce-subtle,
  .orbe {
    animation: none;
  }
}

/* Optimizaciones de rendimiento para dispositivos de alta resolución */
@media (-webkit-min-device-pixel-ratio: 2),
(min-resolution: 192dpi) {

  .animate-spin-fluid,
  .orbe::after {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}

/* Transiciones suaves para cambios de estado */
.animate-spin-fluid,
.orbe::after {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Efectos de hover sutiles para desarrollo */
.animate-spin-fluid:hover,
.orbe::after:hover {
  filter: brightness(1.1);
}
</style>
