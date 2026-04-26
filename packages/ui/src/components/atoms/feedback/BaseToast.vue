<script setup lang="ts">
  import { useColors } from '../../../composables/useColors'
  import { useTypography } from '../../../composables/useTypography'
  import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-vue-next'
  import { computed, onUnmounted, ref } from 'vue'
  import { useGlobalToast } from '../../../composables/useGlobalToast'
  import BaseButton from '../interactive/BaseButton.vue'

  // Props del componente
  interface BaseToastProps {
    // Configuración global
    maxToasts?: number
    position?:
      | 'top-right'
      | 'top-left'
      | 'bottom-right'
      | 'bottom-left'
      | 'top-center'
      | 'bottom-center'
    autoDismiss?: boolean
    dismissDelay?: number
    closeButtonStyle?: 'minimal' | 'subtle' | 'floating'
    transitionName?: string
    ariaLabel?: string
  }

  const props = withDefaults(defineProps<BaseToastProps>(), {
    maxToasts: 5,
    position: 'top-right',
    autoDismiss: true,
    dismissDelay: 5000,
    closeButtonStyle: 'minimal',
    transitionName: 'toast',
    ariaLabel: 'Notificaciones',
  })

  // Emits
  const emit = defineEmits<{
    toastShown: [toastId: string]
    toastDismissed: [toastId: string]
    allDismissed: []
  }>()

  // Usar el composable global de toasts
  const {
    toasts,
    showToast: showToastComposable,
    dismissToast: dismissToastComposable,
    dismissAll: dismissAllComposable,
    pauseAutoHide,
    resumeAutoHide,
    toastPositionClasses,
    updateOptions,
  } = useGlobalToast({
    maxToasts: props.maxToasts,
    position: props.position,
    autoDismiss: props.autoDismiss,
    dismissDelay: props.dismissDelay,
  })

  // Usar colores unificados
  const { getSurface, getBorderSemantic, getTextSemantic, getColor } = useColors()

  // Usar tipografía unificada
  const typography = useTypography()

  // Estado local
  const isVisible = ref(false)

  // Sistema de progreso reactivo
  const progressStates = ref(new Map<string, number>())

  // Función para obtener progreso reactivo
  const getReactiveProgress = (toastId: string) => {
    return computed(() => progressStates.value.get(toastId) ?? 100)
  }

  // Métodos de transición
  const handleEnter = (el: Element) => {
    isVisible.value = true
    emit('toastShown', (el as HTMLElement).id)

    // Inicializar progreso reactivo
    const toastId = (el as HTMLElement).id
    const toast = toasts.value.find(t => t.id === toastId)
    if (toast && toast.showProgress && toast.autoDismiss) {
      startSmoothProgress(toastId, toast.dismissDelay || props.dismissDelay)
    }
  }

  const handleLeave = (el: Element) => {
    emit('toastDismissed', (el as HTMLElement).id)

    // Limpiar progreso
    const toastId = (el as HTMLElement).id
    progressStates.value.delete(toastId)
  }

  // Sistema de progreso suave y fluido
  const startSmoothProgress = (toastId: string, duration: number) => {
    const startTime = Date.now()
    const endTime = startTime + duration
    let animationId: number | null = null

    const updateProgress = () => {
      const now = Date.now()
      const elapsed = now - startTime
      const progress = Math.max(0, 100 - (elapsed / duration) * 100)

      if (progress > 0 && now < endTime) {
        progressStates.value.set(toastId, progress)
        animationId = requestAnimationFrame(updateProgress)
      } else {
        progressStates.value.set(toastId, 0)
        if (animationId) {
          cancelAnimationFrame(animationId)
        }
      }
    }

    // Inicializar en 100%
    progressStates.value.set(toastId, 100)
    animationId = requestAnimationFrame(updateProgress)

    // Retornar función de cleanup
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }

  // Clases del contenedor de toasts
  const toastContainerClasses = computed(() => {
    const baseClasses = 'flex flex-col'

    switch (props.position) {
      case 'top-right':
        return `${baseClasses} top-4 right-4`
      case 'top-left':
        return `${baseClasses} top-4 left-4`
      case 'bottom-right':
        return `${baseClasses} bottom-4 right-4`
      case 'bottom-left':
        return `${baseClasses} bottom-4 left-4`
      case 'top-center':
        return `${baseClasses} top-4 left-1/2 transform -translate-x-1/2`
      case 'bottom-center':
        return `${baseClasses} bottom-4 left-1/2 transform -translate-x-1/2`
      default:
        return `${baseClasses} top-4 right-4`
    }
  })

  // Clases del toast usando estilo similar a BaseCard.vue (sin línea izquierda)
  const getToastClasses = (variant: string) => {
    // Usar clases directas de Tailwind que sabemos que funcionan
    const baseClasses =
      'bg-surface border border-outline shadow-lg hover:shadow-xl rounded-xl p-4 transition-all duration-300'

    const variantMap = {
      info: `${baseClasses} text-blue-900 dark:text-blue-100`,
      success: `${baseClasses} text-green-900 dark:text-green-100`,
      warning: `${baseClasses} text-yellow-900 dark:text-yellow-100`,
      error: `${baseClasses} text-red-900 dark:text-red-100`,
    }
    return variantMap[variant as keyof typeof variantMap] || variantMap.info
  }

  // Clases de tamaño usando tokens del sistema
  const getToastSizeClasses = (size: string) => {
    const sizeMap = {
      sm: 'max-w-xs',
      md: 'max-w-sm',
      lg: 'max-w-md',
    }
    return sizeMap[size as keyof typeof sizeMap] || sizeMap.md
  }

  // Clases de iconos usando tokens del sistema
  const getIconClasses = (variant: string) => {
    const iconMap = {
      info: 'text-blue-600 dark:text-blue-400',
      success: 'text-green-600 dark:text-green-400',
      warning: 'text-yellow-600 dark:text-yellow-400',
      error: 'text-red-600 dark:text-red-400',
    }
    return iconMap[variant as keyof typeof iconMap] || iconMap.info
  }

  // Clases de botones de acción usando tokens del sistema
  const getActionButtonClasses = (variant: string) => {
    // Esta función se eliminó porque BaseButton maneja las variantes internamente
    return ''
  }

  // Clases de barra de progreso usando tokens del sistema
  const getProgressBarClasses = (variant: string) => {
    const progressMap = {
      info: 'bg-blue-500 dark:bg-blue-400',
      success: 'bg-green-500 dark:bg-green-400',
      warning: 'bg-yellow-500 dark:bg-yellow-400',
      error: 'bg-red-500 dark:bg-red-400',
    }
    return progressMap[variant as keyof typeof progressMap] || progressMap.info
  }

  // Clases del botón de cerrar usando tokens del sistema
  const closeButtonClasses = computed(() => {
    const baseClasses =
      'flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full transition-all duration-200 focus:outline-none'

    switch (props.closeButtonStyle) {
      case 'minimal':
        return `${baseClasses} hover:bg-black/5 dark:hover:bg-white/5 hover:scale-110 focus:ring-2 focus:ring-current focus:ring-offset-2 focus:ring-offset-transparent`

      case 'subtle':
        return `${baseClasses} hover:bg-surface-overlay hover:scale-105 focus:ring-2 focus:ring-gray-400/30 focus:ring-offset-1`

      case 'floating':
        return `${baseClasses} hover:bg-white/90 dark:hover:bg-gray-800/90 hover:shadow-lg hover:scale-110 focus:ring-2 focus:ring-gray-400/40 focus:ring-offset-2`

      default:
        return `${baseClasses} hover:bg-black/5 dark:hover:bg-white/5 hover:scale-110 focus:ring-2 focus:ring-current focus:ring-offset-2 focus:ring-offset-transparent`
    }
  })

  // Iconos de variante
  const getVariantIcon = (variant: string) => {
    const icons = {
      info: Info,
      success: CheckCircle,
      warning: AlertTriangle,
      error: AlertCircle,
    }
    return icons[variant as keyof typeof icons] || Info
  }

  // Aria-live según prioridad
  const getAriaLive = (priority: string) => {
    if (priority === 'high') return 'assertive'
    if (priority === 'medium') return 'polite'
    return 'off'
  }

  // Métodos públicos
  const showToast = (toastData: {
    variant: 'info' | 'success' | 'warning' | 'error'
    title?: string
    message?: string
    size?: 'sm' | 'md' | 'lg'
    dismissible?: boolean
    autoDismiss?: boolean
    dismissDelay?: number
    showIcon?: boolean
    showProgress?: boolean
    actions?: Array<{
      label: string
      onClick: () => void
      variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
    }>
    priority?: 'low' | 'medium' | 'high'
    closeButtonAriaLabel?: string
  }) => {
    return showToastComposable(toastData)
  }

  const dismissToast = (toastId: string) => {
    dismissToastComposable(toastId)
    emit('toastDismissed', toastId)
  }

  const dismissAll = () => {
    dismissAllComposable()
    emit('allDismissed')
  }

  // Exponer métodos
  defineExpose({
    showToast,
    dismissToast,
    dismissAll,
  })

  // Cleanup al desmontar
  onUnmounted(() => {
    dismissAll()
  })
</script>

<template>
  <!-- Contenedor de toasts con posicionamiento -->
  <div :class="toastContainerClasses" class="fixed z-[9999] pointer-events-none">
    <!-- Toast individual -->
    <Transition
      v-for="toast in toasts"
      :key="toast.id"
      :name="transitionName"
      appear
      @enter="handleEnter"
      @leave="handleLeave"
    >
      <div
        v-if="toast.show"
        :id="toast.id"
        class="pointer-events-auto mb-3 transition-all duration-300 ease-out max-w-sm relative"
        :class="[
          getToastClasses(toast.variant),
          getToastSizeClasses(toast.size ?? 'md'),
        ]"
        role="alert"
        :aria-live="getAriaLive('medium')"
        :aria-atomic="true"
        :aria-label="toast.closeButtonAriaLabel ?? 'Notificación'"
        @mouseenter="pauseAutoHide(toast.id)"
        @mouseleave="resumeAutoHide(toast.id)"
        @focus="pauseAutoHide(toast.id)"
        @blur="resumeAutoHide(toast.id)"
      >
        <!-- Contenido del toast -->
        <div class="flex items-start gap-3">
          <!-- Icono del toast -->
          <div v-if="toast.showIcon" class="flex-shrink-0">
            <component
              :is="getVariantIcon(toast.variant)"
              class="w-5 h-5"
              :class="[getIconClasses(toast.variant)]"
              aria-hidden="true"
            />
          </div>

          <!-- Contenido principal -->
          <div class="flex-1 min-w-0">
            <div
              v-if="toast.title"
              class="mb-1"
              :class="[
                typography.getToastTypography('title').value,
                getTextSemantic('primary').value,
              ]"
            >
              {{ toast.title }}
            </div>
            <div
              v-if="toast.message"
              class="opacity-90"
              :class="[
                typography.getToastTypography('body').value,
                getTextSemantic('secondary').value,
              ]"
            >
              {{ toast.message }}
            </div>

            <!-- Acciones del toast usando BaseButton -->
            <div
              v-if="toast.actions && toast.actions.length > 0"
              class="flex gap-2 mt-3"
            >
              <BaseButton
                v-for="action in toast.actions"
                :key="action.label"
                :variant="
                  (action.variant === 'info' ? 'primary' : action.variant) ||
                  'secondary'
                "
                size="sm"
                :aria-label="action.label"
                @click="action.onClick"
              >
                {{ action.label }}
              </BaseButton>
            </div>
          </div>

          <!-- Botón de cerrar minimalista -->
          <button
            v-if="toast.dismissible"
            type="button"
            :aria-label="toast.closeButtonAriaLabel ?? 'Cerrar notificación'"
            :class="closeButtonClasses"
            @click="dismissToast(toast.id)"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Barra de progreso minimalista y moderna -->
        <div
          v-if="toast.showProgress"
          class="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-b-lg overflow-hidden"
          role="progressbar"
          :aria-valuenow="getReactiveProgress(toast.id).value"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-label="`Progreso: ${getReactiveProgress(toast.id).value}%`"
        >
          <!-- Barra de progreso fluida -->
          <div
            class="h-full transition-all duration-300 ease-out rounded-r-full"
            :class="getProgressBarClasses(toast.variant)"
            :style="{
              width: `${getReactiveProgress(toast.id).value}%`,
            }"
          ></div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
  /* Transiciones de entrada/salida */
  .toast-enter-active,
  .toast-leave-active {
    @apply transition-all duration-300 ease-out;
  }

  .toast-enter-from {
    @apply opacity-0 transform translate-x-full scale-95;
  }

  .toast-leave-to {
    @apply opacity-0 transform translate-x-full scale-95;
  }

  .toast-enter-to,
  .toast-leave-from {
    @apply opacity-100 transform translate-x-0 scale-100;
  }

  /* Transiciones específicas por posición */
  .toast-enter-from.top-right,
  .toast-leave-to.top-right {
    @apply translate-x-full;
  }

  .toast-enter-from.top-left,
  .toast-leave-to.top-left {
    @apply -translate-x-full;
  }

  .toast-enter-from.bottom-right,
  .toast-leave-to.bottom-right {
    @apply translate-x-full;
  }

  .toast-enter-from.bottom-left,
  .toast-leave-to.bottom-left {
    @apply -translate-x-full;
  }

  .toast-enter-from.top-center,
  .toast-leave-to.top-center {
    @apply -translate-y-full;
  }

  .toast-enter-from.bottom-center,
  .toast-leave-to.bottom-center {
    @apply translate-y-full;
  }

  /* Soporte para motion reducido */
  @media (prefers-reduced-motion: reduce) {
    .toast-enter-active,
    .toast-leave-active {
      @apply transition-none;
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .toast {
      @apply border-2;
    }
  }

  /* Focus visible support for all browsers */
  .toast:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }

  /* Estilos de la barra de progreso */
  .toast .absolute.bottom-0 {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    z-index: 1;
  }

  /* Transiciones suaves para la barra de progreso */
  .toast .absolute.bottom-0 > div {
    will-change: width;
    backface-visibility: hidden;
    perspective: 1000px;
  }

  /* High DPI displays optimization */
  @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
    .toast {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
  }

  /* Print styles */
  @media print {
    .toast {
      position: static !important;
      transform: none !important;
      box-shadow: none !important;
    }
  }
</style>
