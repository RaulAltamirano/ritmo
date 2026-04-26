<script setup lang="ts">
  import { computed } from 'vue'
  import RitmoLogo from '../../atoms/display/RitmoLogo.vue'

  interface RitmoBrandProps {
    size?: 'sm' | 'md' | 'lg' | 'xl'
    variant?: 'default' | 'primary' | 'monochrome' | 'white'
    showText?: boolean
    showTagline?: boolean
    brandName?: string
    tagline?: string
  }

  const props = withDefaults(defineProps<RitmoBrandProps>(), {
    size: 'md',
    variant: 'default',
    showText: true,
    showTagline: false,
    brandName: 'Ritmo',
    tagline: 'Smart Time Management',
  })

  // Tamaño del logo basado en el tamaño del componente
  const logoSize = computed(() => {
    const sizeMap = {
      sm: 24,
      md: 32,
      lg: 40,
      xl: 48,
    }
    return sizeMap[props.size]
  })

  // Variante del logo
  const logoVariant = computed(() => props.variant)

  // Clases del título
  const titleClasses = computed(() => {
    const sizeMap = {
      sm: 'text-lg',
      md: 'text-xl',
      lg: 'text-2xl',
      xl: 'text-3xl',
    }

    const colorMap = {
      default: 'text-gray-800 dark:text-white',
      primary: 'text-blue-600 dark:text-blue-400',
      monochrome: 'text-gray-800 dark:text-white',
      white: 'text-white',
    }

    return `${sizeMap[props.size]} ${colorMap[props.variant]}`
  })

  // Clases del tagline
  const taglineClasses = computed(() => {
    const colorMap = {
      default: 'text-gray-600 dark:text-gray-300',
      primary: 'text-blue-500 dark:text-blue-300',
      monochrome: 'text-gray-600 dark:text-gray-300',
      white: 'text-gray-200',
    }

    return colorMap[props.variant]
  })
</script>

<template>
  <div class="flex items-center space-x-3">
    <!-- Logo -->
    <RitmoLogo
      :size="logoSize"
      :variant="logoVariant"
      :aria-label="`${brandName} Logo`"
    />

    <!-- Texto de la marca -->
    <div v-if="showText" class="flex flex-col">
      <h1 class="font-bold font-display tracking-tight" :class="[titleClasses]">
        {{ brandName }}
      </h1>
      <p v-if="showTagline" class="text-sm font-medium" :class="[taglineClasses]">
        {{ tagline }}
      </p>
    </div>
  </div>
</template>

<style scoped>
  /* Transiciones suaves */
  div {
    transition: all 0.2s ease-in-out;
  }

  /* Forzar colores específicos para cada variante */
  .text-blue-600 {
    color: #2563eb !important;
  }

  .dark .text-blue-400 {
    color: #60a5fa !important;
  }

  .text-blue-500 {
    color: #3b82f6 !important;
  }

  .dark .text-blue-300 {
    color: #93c5fd !important;
  }

  .text-gray-800 {
    color: #1f2937 !important;
  }

  .dark .text-white {
    color: #ffffff !important;
  }

  .text-gray-600 {
    color: #4b5563 !important;
  }

  .dark .text-gray-300 {
    color: #d1d5db !important;
  }

  .text-white {
    color: #ffffff !important;
  }

  .text-gray-200 {
    color: #e5e7eb !important;
  }

  /* Hover effects para el componente completo */
  div:hover {
    transform: translateY(-1px);
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    div {
      transition: none;
    }

    div:hover {
      transform: none;
    }
  }
</style>
