<template>
  <div class="inline-flex flex-col items-center justify-center animate-bounce" :class="[
    size === 'xs' ? 'space-y-2' : '',
    size === 'sm' ? 'space-y-3' : '',
    size === 'md' ? 'space-y-4' : '',
    size === 'lg' ? 'space-y-5' : '',
    size === 'xl' ? 'space-y-6' : '',
    size === '2xl' ? 'space-y-7' : '',
    variant === 'minimal' ? 'loading-text:hidden' : '',
    variant === 'with-text' ? 'loading-text:block' : '',
  ]" role="status" :aria-label="ariaLabel">
    <!-- Animated Ritmo logo mejorado -->
    <div class="flex items-center justify-center">
      <svg :class="[
        logoClasses,
        'transition-all duration-300 ease-out will-change-transform',
      ]" :width="sizeValue" :height="sizeValue" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true">
        <g class="transition-all duration-300 ease-out">
          <rect x="10" y="22" width="3" height="8" rx="1.5"
            class="transition-all duration-300 ease-out origin-bottom animate-pulse"
            :style="{ animationDelay: '0s' }" />
          <rect x="17" y="16" width="3" height="14" rx="1.5"
            class="transition-all duration-300 ease-out origin-bottom animate-pulse"
            :style="{ animationDelay: '0.15s' }" />
          <rect x="24" y="20" width="3" height="10" rx="1.5"
            class="transition-all duration-300 ease-out origin-bottom animate-pulse"
            :style="{ animationDelay: '0.3s' }" />
          <rect x="31" y="12" width="3" height="18" rx="1.5"
            class="transition-all duration-300 ease-out origin-bottom animate-pulse"
            :style="{ animationDelay: '0.45s' }" />
        </g>
      </svg>
    </div>

    <!-- Loading text mejorado -->
    <div v-if="showText" class="max-w-xs mx-auto text-center sm:max-w-[200px]">
      <p :class="[getLoadingTypography(), 'transition-colors duration-200', textClasses]">
        {{ loadingText }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useColors, useTypography } from '@ritmo/ui'
import { computed } from 'vue'

interface BaseLoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  variant?: 'default' | 'minimal' | 'with-text'
  loadingText?: string
  showText?: boolean
  ariaLabel?: string
}

const props = withDefaults(defineProps<BaseLoadingSpinnerProps>(), {
  size: 'md',
  variant: 'default',
  loadingText: 'Cargando...',
  showText: true,
  ariaLabel: 'Cargando contenido',
})

// Usar tipografía y colores unificados
const { getVariantClasses } = useTypography()
const { getColor, getTextSemantic } = useColors()

const getLoadingTypography = () => getVariantClasses('body')

// Tamaño del logo
const sizeValue = computed(() => {
  const sizes = {
    xs: 20,
    sm: 24,
    md: 32,
    lg: 40,
    xl: 48,
    '2xl': 56,
  }
  return sizes[props.size]
})

// Clases de colores centralizadas
const logoClasses = computed(() => {
  return `text-blue-500 dark:text-blue-400`
})

const textClasses = computed(() => {
  return `${getTextSemantic('tertiary').value} dark:${getTextSemantic('tertiary').value}`
})
</script>

<style scoped>
/* Animaciones personalizadas */
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

/* Transiciones suaves */
svg {
  @apply transition-all duration-300 ease-out;
}

/* Efectos de hover */
svg:hover {
  @apply transform scale-110;
}

/* Estados de animación */
.loading-text\:hidden .loading-text {
  @apply hidden;
}

.loading-text\:block .loading-text {
  @apply block;
}
</style>
