<template>
  <div class="inline-block">
    <svg :width="size" :height="size" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"
      :style="logoStyle" :data-variant="variant" :aria-label="ariaLabel" :aria-describedby="descriptionId" role="img"
      :class="logoClasses">
      <g>
        <rect x="10" y="22" width="3" height="8" rx="1.5" :fill="logoColor" />
        <rect x="17" y="16" width="3" height="14" rx="1.5" :fill="logoColor" />
        <rect x="24" y="20" width="3" height="10" rx="1.5" :fill="logoColor" />
        <rect x="31" y="12" width="3" height="18" rx="1.5" :fill="logoColor" />
      </g>
    </svg>

    <!-- Descripción oculta para screen readers -->
    <span :id="descriptionId" class="sr-only">
      {{ ariaDescription }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { useId } from '@ritmo/ui'
import { usePreferredReducedMotion } from '@vueuse/core'
import { computed } from 'vue'

interface RitmoLogoProps {
  size?: number
  variant?: 'default' | 'primary' | 'monochrome' | 'white'
  ariaLabel?: string
  ariaDescription?: string
  interactive?: boolean
}

const props = withDefaults(defineProps<RitmoLogoProps>(), {
  size: 40,
  variant: 'default',
  ariaLabel: 'Ritmo Logo',
  ariaDescription: 'Logo de la aplicación Ritmo',
  interactive: true,
})

// Composable de preferencias de movimiento
const prefersReducedMotion = usePreferredReducedMotion()

// ID único para accesibilidad usando el sistema determinístico
const descriptionId = useId('ritmo-logo-description', {
  variant: props.variant,
  size: props.size,
})

// Color del logo basado en la variante usando colores directos
const logoColor = computed(() => {
  switch (props.variant) {
    case 'primary':
      return '#2563eb' // Azul primario
    case 'monochrome':
      return 'currentColor' // Usa el color del texto padre
    case 'white':
      return '#ffffff' // Blanco
    default:
      return 'currentColor' // Usa el color del texto padre
  }
})

// Clases del logo con soporte para preferencias de movimiento
const logoClasses = computed(() => {
  const baseClasses = 'will-change-transform'

  if (props.interactive && !prefersReducedMotion.value) {
    return `${baseClasses} transition-all duration-200 ease-in-out hover:scale-105`
  }

  return baseClasses
})

// Estilos del logo
const logoStyle = computed(() => ({
  willChange: 'transform',
}))
</script>

<style scoped>
/* Solo estilos específicos que no se pueden lograr con Tailwind */

/* Light mode colors */
svg[data-variant='default'] rect,
svg[data-variant='monochrome'] rect {
  fill: currentColor;
  /* Usa el color del texto padre */
}

/* Dark mode support mejorado */
@media (prefers-color-scheme: dark) {

  svg[data-variant='default'] rect,
  svg[data-variant='monochrome'] rect {
    fill: currentColor !important;
    /* Usa el color del texto padre */
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  svg {
    filter: contrast(1.5);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  svg {
    transition: none !important;
    transform: none !important;
  }
}

/* Focus visible support for all browsers */
svg:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

/* High DPI displays optimization */
@media (-webkit-min-device-pixel-ratio: 2),
(min-resolution: 192dpi) {
  svg {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}
</style>
