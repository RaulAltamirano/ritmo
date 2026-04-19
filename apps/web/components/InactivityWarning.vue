<template>
  <Transition name="warning-slide" appear>
    <div
      v-if="showWarning"
      class="fixed top-4 right-4 z-[9999] max-w-[420px] min-w-[380px] bg-white rounded-xl shadow-2xl border border-yellow-200 overflow-hidden backdrop-blur-sm"
      role="alert"
      aria-live="polite"
      :aria-label="`Tu sesión expirará en ${formatTime(timeRemaining)}`"
    >
      <!-- Contenido principal -->
      <div class="flex items-start gap-4 p-4">
        <!-- Icono de advertencia -->
        <div
          class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300"
          :class="iconClass"
        >
          <Icon name="clock" class="w-6 h-6" />
        </div>

        <!-- Texto de advertencia -->
        <div class="flex-1 min-w-0">
          <h3 class="text-sm font-semibold text-gray-900 leading-tight mb-1">
            Tu sesión expirará pronto
          </h3>
          <p class="text-sm text-gray-600 leading-relaxed m-0">
            Por seguridad, tu sesión expirará en
            <span class="font-semibold px-1 py-0.5 rounded text-sm" :class="timeClass">
              {{ formatTime(timeRemaining) }}
            </span>
          </p>
        </div>

        <!-- Acciones -->
        <div class="flex flex-col gap-1">
          <button
            @click="extendSession"
            :disabled="isExtending"
            class="px-2 py-1 bg-blue-600 text-white border-none rounded-md text-sm font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-1 min-h-8 hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            :aria-label="extendButtonAriaLabel"
          >
            <span v-if="!isExtending" class="flex items-center gap-1">
              <Icon name="refresh-cw" class="w-4 h-4" />
              Extender sesión
            </span>
            <span v-else class="flex items-center gap-1">
              <Icon name="loader" class="w-4 h-4 animate-spin" />
              Extendiendo...
            </span>
          </button>

          <button
            @click="dismissWarning"
            class="p-1 bg-transparent border-none text-gray-400 cursor-pointer rounded-sm transition-all duration-200 flex items-center justify-center w-8 h-8 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Cerrar advertencia"
          >
            <Icon name="x" class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Barra de progreso -->
      <div
        class="h-1 bg-gray-100 relative"
        role="progressbar"
        :aria-valuenow="progressPercentage"
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div
          class="h-full transition-all duration-300 rounded-br-sm"
          :style="{ width: progressPercentage + '%' }"
          :class="progressClass"
        ></div>
      </div>

      <!-- Indicador de tiempo restante -->
      <div
        class="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm border"
        :class="timeIndicatorClass"
      >
        <Icon name="timer" class="w-3.5 h-3.5" />
        <span class="tabular-nums">{{ formatTime(timeRemaining) }}</span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
  interface Props {
    showWarning: boolean
    timeRemaining: number
  }

  const props = defineProps<Props>()

  const emit = defineEmits<{
    extend: []
    dismiss: []
  }>()

  const isExtending = ref(false)

  // Computed properties
  const progressPercentage = computed(() => {
    const total = 5 * 60 * 1000 // 5 minutos (warning threshold)
    return Math.max(0, ((total - props.timeRemaining) / total) * 100)
  })

  const progressClass = computed(() => {
    if (progressPercentage.value < 50)
      return 'bg-gradient-to-r from-green-500 to-green-400'
    if (progressPercentage.value < 80)
      return 'bg-gradient-to-r from-yellow-500 to-yellow-400'
    return 'bg-gradient-to-r from-red-500 to-red-400 animate-pulse'
  })

  const timeClass = computed(() => {
    if (props.timeRemaining > 3 * 60 * 1000) return 'bg-green-100 text-green-700' // > 3 minutos
    if (props.timeRemaining > 1 * 60 * 1000) return 'bg-yellow-100 text-yellow-700' // > 1 minuto
    return 'bg-red-100 text-red-700 animate-pulse'
  })

  const iconClass = computed(() => {
    if (props.timeRemaining > 3 * 60 * 1000) return 'bg-green-100'
    if (props.timeRemaining > 1 * 60 * 1000) return 'bg-yellow-100'
    return 'bg-red-100 animate-pulse'
  })

  const timeIndicatorClass = computed(() => {
    if (props.timeRemaining > 3 * 60 * 1000)
      return 'bg-green-100 text-green-700 border-green-200'
    if (props.timeRemaining > 1 * 60 * 1000)
      return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    return 'bg-red-100 text-red-700 border-red-200 animate-pulse'
  })

  const extendButtonAriaLabel = computed(() => {
    if (isExtending.value) {
      return 'Extendiendo sesión, por favor espera'
    }
    return `Extender sesión por ${formatTime(props.timeRemaining)}`
  })

  // Formatear tiempo de manera legible
  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    }
    return `${seconds}s`
  }

  // Extender sesión
  const extendSession = async () => {
    if (isExtending.value) return

    try {
      isExtending.value = true
      emit('extend')

      // Simular delay para feedback visual
      await new Promise(resolve => setTimeout(resolve, 1000))

      emit('dismiss')
    } catch (error) {
      console.error('Error extending session:', error)
    } finally {
      isExtending.value = false
    }
  }

  // Cerrar advertencia
  const dismissWarning = () => {
    emit('dismiss')
  }
</script>

<style scoped>
  /* Animaciones personalizadas que no están en Tailwind */
  .warning-slide-enter-active,
  .warning-slide-leave-active {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .warning-slide-enter-from {
    opacity: 0;
    transform: translateX(100%) scale(0.95);
  }

  .warning-slide-leave-to {
    opacity: 0;
    transform: translateX(100%) scale(0.95);
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .fixed {
      top: 0.5rem;
      right: 0.5rem;
      left: 0.5rem;
      max-width: none;
      min-width: auto;
    }

    .flex {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .flex-col {
      flex-direction: row;
      justify-content: center;
      width: 100%;
    }

    .min-h-8 {
      flex: 1;
      max-width: 200px;
    }

    .absolute {
      position: static;
      margin-top: 0.5rem;
      justify-content: center;
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .border {
      border-width: 2px;
    }

    .bg-gradient-to-r {
      border: 1px solid currentColor;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .animate-pulse {
      animation: none;
    }

    .animate-spin {
      animation: none;
    }

    .warning-slide-enter-active,
    .warning-slide-leave-active {
      transition: opacity 0.2s ease;
    }

    .warning-slide-enter-from,
    .warning-slide-leave-to {
      transform: none;
    }
  }
</style>
