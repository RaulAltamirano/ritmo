<script setup lang="ts">
  import { Clock, Lightbulb } from 'lucide-vue-next'
  import type { Component } from 'vue'
  import { computed } from 'vue'

  interface PhaseInfoIconProps {
    icon: string
    size?: number
    title?: string
    darkMode?: boolean
    maxWidth?: string
  }

  const props = withDefaults(defineProps<PhaseInfoIconProps>(), {
    size: 18,
    title: '',
    darkMode: false,
    maxWidth: '',
  })

  // Mapeo de iconos
  const iconMap: Record<string, Component> = {
    Clock,
    Lightbulb,
  }

  // Componente del icono
  const iconComponent = computed(() => {
    return iconMap[props.icon] || Clock
  })
</script>

<template>
  <div class="relative group/icon" :title="title">
    <button
      type="button"
      class="w-10 h-10 sm:w-11 sm:h-11 rounded-full transition-all duration-300 hover:scale-110 text-white dark:text-white bg-transparent hover:bg-transparent focus:bg-transparent border-none outline-none focus:outline-none focus:ring-0"
    >
      <component
        :is="iconComponent"
        :size="size"
        class="transition-transform duration-300 group-hover/icon:rotate-12"
      />
    </button>

    <!-- Tooltip mejorado -->
    <div
      class="absolute px-4 py-3 text-sm rounded-xl shadow-2xl backdrop-blur-md opacity-0 group-hover/icon:opacity-100 transition-all duration-500 ease-out pointer-events-none z-20 transform translate-y-2 scale-95 group-hover/icon:translate-y-0 group-hover/icon:scale-100 sm:top-full sm:right-0 sm:mt-4 sm:bottom-auto sm:mb-0 bottom-full right-0 mb-4 top-auto mt-0"
      :class="[
        // En mobile: aparece arriba, en desktop: aparece abajo
        maxWidth,
        darkMode
          ? 'bg-black/95 text-white border border-white/20 shadow-black/50'
          : 'bg-white/98 text-gray-900 border border-gray-200/50 shadow-gray-400/20',
      ]"
    >
      <!-- Contenido del tooltip con mejor estructura -->
      <div class="flex flex-col gap-1">
        <slot name="content" />
      </div>

      <!-- Flecha mejorada -->
      <div
        class="absolute w-0 h-0 border-l-4 border-r-4 border-transparent sm:bottom-full sm:right-4 sm:border-b-4 sm:border-t-0 top-full right-4 border-t-4 border-b-0"
        :class="[
          // En mobile: flecha abajo, en desktop: flecha arriba
          darkMode
            ? 'border-t-black/95 sm:border-b-black/95'
            : 'border-t-white/98 sm:border-b-white/98',
        ]"
      ></div>
    </div>
  </div>
</template>

<style scoped>
  /* Transiciones suaves para iconos */
  .group\/icon:hover .transition-transform {
    transform: rotate(12deg) scale(1.1);
  }

  /* Optimización de tooltips */
  .group\/icon:hover .transform {
    transform: translateY(0) scale(1.02);
  }

  /* Mejoras en tooltips */
  .group\/icon:hover .scale-95 {
    transform: translateY(0) scale(1);
  }

  /* Animación de entrada suave */
  .group\/icon:hover .opacity-0 {
    animation: tooltipFadeIn 0.3s ease-out forwards;
  }

  @keyframes tooltipFadeIn {
    from {
      opacity: 0;
      transform: translateY(8px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* Mejoras en backdrop-blur */
  .backdrop-blur-md {
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }
</style>
