<script setup lang="ts">
  import { useId } from '../../../composables/useId'
  import {
    useEventListener,
    usePreferredReducedMotion,
    useWindowSize,
  } from '@vueuse/core'
  import { X } from 'lucide-vue-next'
  import {
    computed,
    nextTick,
    onMounted,
    onUnmounted,
    ref,
    toValue,
    useSlots,
    watch,
  } from 'vue'
  import { useFocusTrap as useCustomFocusTrap } from '../../../composables/useFocusTrap'

  interface BaseModalProps {
    isOpen: boolean
    title?: string
    showCloseButton?: boolean
    closeButtonLabel?: string
    closeButtonStyle?: 'minimal' | 'subtle' | 'floating'
    closeOnBackdropClick?: boolean
    closeOnEscape?: boolean
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
    position?: 'center' | 'top' | 'bottom' | 'left' | 'right'
    backdrop?: 'blur' | 'dark' | 'light' | 'none'
    animation?: 'fade' | 'slide' | 'scale' | 'none'
    preventScroll?: boolean
    returnFocusOnClose?: boolean
    ariaLabel?: string
    ariaDescribedby?: string
  }

  const props = withDefaults(defineProps<BaseModalProps>(), {
    isOpen: false,
    showCloseButton: true,
    closeButtonLabel: 'Cerrar',
    closeButtonStyle: 'minimal',
    closeOnBackdropClick: true,
    closeOnEscape: true,
    size: 'md',
    position: 'center',
    backdrop: 'blur',
    animation: 'fade',
    preventScroll: true,
    returnFocusOnClose: true,
  })

  const emit = defineEmits<{
    'update:isOpen': [value: boolean]
    close: []
    open: []
  }>()

  // Referencias del DOM
  const containerRef = ref<HTMLDivElement>()
  const modalRef = ref<HTMLDivElement>()

  // VueUse composables para mejor comportamiento
  const prefersReducedMotion = usePreferredReducedMotion()
  const { width: windowWidth, height: windowHeight } = useWindowSize()

  // Focus trap personalizado
  const {
    activate: activateFocusTrap,
    deactivate: deactivateFocusTrap,
    containerRef: focusTrapContainerRef,
  } = useCustomFocusTrap({
    // Escape y clic fuera los gestiona BaseModal (evita stopPropagation del trap que dejaba isOpen en true).
    escapeDeactivates: false,
    clickOutsideDeactivates: false,
    returnFocusOnDeactivate: props.returnFocusOnClose,
    preventScroll: false,
  })

  // Asignar el modalRef al focusTrapContainerRef
  watch(modalRef, newRef => {
    if (newRef) {
      focusTrapContainerRef.value = newRef
    }
  })

  const slots = useSlots()

  // IDs únicos para accesibilidad usando el sistema determinístico
  const titleId = useId('modal-title', {
    title: props.title,
    size: props.size,
  })

  /** Región de título (prop o slot header) para aria-labelledby */
  const hasTitleRegion = computed(() => Boolean(props.title || slots.header))

  const dialogLabelledby = computed(() =>
    hasTitleRegion.value ? toValue(titleId) : undefined,
  )

  const dialogDescribedby = computed(() => props.ariaDescribedby?.trim() ?? undefined)

  /** Si no hay título visible, el diálogo debe tener aria-label explícito */
  const dialogAriaLabel = computed(() => {
    if (hasTitleRegion.value) return undefined
    return props.ariaLabel?.trim() || undefined
  })

  // Estado interno
  const isVisible = ref(false)
  const isAnimating = ref(false)

  // Motion compartido para panel y scrim (~400ms, easing calmado)
  const MOTION = 'duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)]'

  // Computed para clases del modal
  const modalClasses = computed(() => {
    const baseClasses = [
      'relative bg-surface rounded-xl shadow-2xl',
      `transform transition-all ${MOTION}`,
      'max-h-[90vh] overflow-hidden',
    ]

    // Clases de tamaño
    const sizeClasses = {
      xs: 'max-w-sm',
      sm: 'max-w-md',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
      full: 'max-w-full',
    }

    // Clases de posición
    const positionClasses = {
      center: 'mx-auto my-auto',
      top: 'mx-auto mt-4 mb-auto sm:mt-8',
      bottom: 'mx-auto mt-auto mb-4 sm:mb-8',
      left: 'mx-4 mr-auto my-auto sm:ml-8',
      right: 'ml-auto mx-4 my-auto sm:mr-8',
    }

    // Clases dinámicas basadas en estado VueUse
    const dynamicClasses = [
      // Visibilidad
      isVisible.value ? 'opacity-100 scale-100' : 'opacity-0 scale-95',

      // Animaciones respetando preferencias
      prefersReducedMotion.value
        ? 'transition-none'
        : `transition-all ${MOTION}`,
    ]

    return [
      ...baseClasses,
      sizeClasses[props.size] || sizeClasses.md,
      positionClasses[props.position] || positionClasses.center,
      ...dynamicClasses,
    ]
      .filter(Boolean)
      .join(' ')
  })

  // Tono del scrim según el modo de backdrop
  const scrimToneClasses = computed(() => {
    const tones = {
      blur: 'bg-black/20 dark:bg-black/40',
      dark: 'bg-black/50 dark:bg-black/70',
      light: 'bg-white/50 dark:bg-gray-900/50',
      none: 'bg-transparent',
    }
    return tones[props.backdrop] || tones.blur
  })

  // Scrim: única capa cuya opacidad se anima
  const scrimClasses = computed(() => {
    const motion = prefersReducedMotion.value
      ? 'transition-none'
      : `transition-opacity ${MOTION}`
    const opacity = isVisible.value ? 'opacity-100' : 'opacity-0'
    return [
      'absolute inset-0',
      'modal-backdrop-scrim',
      scrimToneClasses.value,
      motion,
      opacity,
    ]
      .filter(Boolean)
      .join(' ')
  })

  // Capa de desenfoque: presente solo en modo blur, sin animación de opacidad
  const blurLayerClasses = computed(() =>
    ['absolute inset-0', 'modal-backdrop-blur', 'backdrop-blur-sm'].join(' '),
  )

  // Clases del header
  const headerClasses = computed(() => ['border-b border-outline'].join(' '))

  // Clases del título
  const titleClasses = computed(() =>
    ['text-lg font-semibold text-gray-900 dark:text-gray-100'].join(' '),
  )

  // Clases del footer
  const footerClasses = computed(() => ['border-t border-outline'].join(' '))

  // Clases del botón de cerrar
  const closeButtonClasses = computed(() => {
    const baseClasses = [
      'p-2 rounded-lg transition-colors duration-200',
      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
      'hover:bg-surface-overlay',
    ]

    const styleClasses = {
      minimal:
        'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300',
      subtle:
        'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
      floating:
        'bg-surface shadow-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
    }

    return [
      ...baseClasses,
      styleClasses[props.closeButtonStyle] || styleClasses.minimal,
    ]
      .filter(Boolean)
      .join(' ')
  })

  // Computed para aria-live
  const ariaLiveValue = computed(() => {
    if (props.title) return 'polite'
    return 'assertive'
  })

  // Event handlers optimizados con VueUse
  const handleEnter = () => {
    isAnimating.value = true
    if (prefersReducedMotion.value) {
      isVisible.value = true
      isAnimating.value = false
    } else {
      setTimeout(() => {
        isVisible.value = true
        isAnimating.value = false
      }, 10)
    }
  }

  const handleLeave = () => {
    isAnimating.value = true
    isVisible.value = false
    setTimeout(() => {
      isAnimating.value = false
    }, 400)
  }

  const handleBackdropClick = (event: MouseEvent) => {
    if (!props.closeOnBackdropClick) return
    const target = event.target as Node | null
    if (!target || !modalRef.value) return
    if (modalRef.value.contains(target)) return
    handleClose()
  }

  const handleClose = () => {
    emit('update:isOpen', false)
    emit('close')
  }

  const handleOpen = () => {
    emit('open')
  }

  /** Evita acceso a `document` durante SSR (watch immediate corre antes del cliente). */
  function setBodyScrollLocked(locked: boolean) {
    if (typeof document === 'undefined') return
    if (!props.preventScroll) return
    document.body.style.overflow = locked ? 'hidden' : ''
  }

  // Event listeners globales optimizados con VueUse
  useEventListener('keydown', event => {
    if (props.isOpen && props.closeOnEscape && event.key === 'Escape') {
      event.preventDefault()
      handleClose()
    }
  })

  // Watch para cambios en isOpen (incluye estado inicial abierto)
  watch(
    () => props.isOpen,
    async newValue => {
      if (newValue) {
        // Abrir modal
        await nextTick()
        if (modalRef.value) {
          activateFocusTrap(modalRef.value)
        }
        handleOpen()

        setBodyScrollLocked(true)
      } else {
        // Cerrar modal
        deactivateFocusTrap()

        setBodyScrollLocked(false)
      }
    },
    { immediate: true },
  )

  // Watch para preferencias de movimiento
  watch(prefersReducedMotion, reduced => {
    // Ajustar animaciones si es necesario
  })

  // Watch para cambios en el tamaño de la ventana
  watch([windowWidth, windowHeight], () => {
    // Ajustar posición o tamaño si es necesario
  })

  // Lifecycle
  onMounted(() => {
    if (props.isOpen && modalRef.value) {
      activateFocusTrap(modalRef.value)
    }
    if (props.isOpen) {
      setBodyScrollLocked(true)
    }
  })

  onUnmounted(() => {
    deactivateFocusTrap()
    setBodyScrollLocked(false)
  })

  // Exponer métodos para uso externo
  defineExpose({
    open: () => {
      emit('update:isOpen', true)
    },
    close: handleClose,
    focus: () => {
      containerRef.value?.focus()
    },
  })
</script>

<template>
  <Teleport to="body">
    <Transition name="modal" appear @enter="handleEnter" @leave="handleLeave">
      <div
        v-if="isOpen"
        ref="containerRef"
        class="modal fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 outline-none"
        role="dialog"
        tabindex="-1"
        :aria-modal="true"
        :aria-labelledby="dialogLabelledby"
        :aria-describedby="dialogDescribedby"
        :aria-label="dialogAriaLabel"
        :aria-live="ariaLiveValue"
        :aria-atomic="true"
        @click="handleBackdropClick"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0" :aria-hidden="true">
          <div v-if="props.backdrop === 'blur'" :class="blurLayerClasses" />
          <div :class="scrimClasses" />
        </div>

        <!-- Modal Container -->
        <div
          ref="modalRef"
          class="relative flex w-full flex-col"
          :class="[modalClasses]"
          @click.stop
        >
          <!-- Header -->
          <header
            v-if="$slots.header || title"
            class="flex shrink-0 items-center justify-between gap-3 p-4 sm:p-6"
            :class="[headerClasses]"
          >
            <slot name="header" :title-id="titleId">
              <h2 :id="titleId" :class="titleClasses">
                {{ title }}
              </h2>
            </slot>

            <button
              v-if="showCloseButton"
              type="button"
              :aria-label="closeButtonLabel"
              :class="closeButtonClasses"
              @click="handleClose"
            >
              <X
                class="h-5 w-5 text-gray-400 transition-colors duration-200 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                aria-hidden="true"
              />
            </button>
          </header>

          <!-- Content -->
          <div class="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
            <slot />
          </div>

          <!-- Footer -->
          <footer
            v-if="$slots.footer"
            class="flex shrink-0 flex-wrap items-center justify-end gap-3 p-4 sm:p-6"
            :class="[footerClasses]"
          >
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
  /*
   * Root overlay: opacity only — never scale the backdrop.
   * Scaling the full-screen layer (blur + scrim) creates a light rectangular
   * fringe around page content. Panel scale lives on modalClasses instead.
   */
  .modal-enter-active,
  .modal-leave-active {
    transition-property: opacity;
    transition-duration: 400ms;
    transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
  }

  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;
  }

  .modal-enter-to,
  .modal-leave-from {
    opacity: 1;
  }

  /* Scrim: fundido suave de opacidad (la capa de blur nunca se anima) */
  .modal-enter-active .modal-backdrop-scrim,
  .modal-leave-active .modal-backdrop-scrim {
    transition-property: opacity;
    transition-duration: 400ms;
    transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
  }

  /* Focus styles — keep outline off the full-viewport dialog shell */
  .modal:focus,
  .modal:focus-visible,
  .modal:focus-within {
    outline: none;
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .modal {
      @apply border-2;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .modal,
    .modal-backdrop-scrim {
      @apply transition-none;
    }
  }

  /* High DPI displays optimization */
  @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
    .modal {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
  }

  /* Print styles */
  @media print {
    .modal {
      position: static !important;
      transform: none !important;
      box-shadow: none !important;
    }
  }
</style>
