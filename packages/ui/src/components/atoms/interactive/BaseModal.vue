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

  // Computed para clases del modal
  const modalClasses = computed(() => {
    const baseClasses = [
      'relative z-[1] w-full bg-surface rounded-2xl',
      'border border-black/10 dark:border-white/15',
      'ring-1 ring-black/5 dark:ring-white/10',
      'shadow-[0_8px_24px_-6px_rgba(0,0,0,0.25),0_32px_80px_-12px_rgba(0,0,0,0.55)]',
      'dark:shadow-[0_8px_28px_-6px_rgba(0,0,0,0.55),0_36px_90px_-10px_rgba(0,0,0,0.85)]',
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

    return [
      ...baseClasses,
      sizeClasses[props.size] || sizeClasses.md,
      positionClasses[props.position] || positionClasses.center,
    ]
      .filter(Boolean)
      .join(' ')
  })

  // Shrink-wrap: clics laterales siguen yendo al backdrop
  const panelShellClasses = 'relative modal-panel-shell'

  // Backdrop instantáneo (sin fade de opacity): animar opacity+blur a la vez
  // hace que el blur “rellene” y el tinte oscurezca en dos tiempos.
  const backdropClasses = computed(() => {
    const tones = {
      blur: 'bg-black/45 backdrop-blur-md dark:bg-black/65',
      dark: 'bg-black/60 dark:bg-black/80',
      light: 'bg-white/60 dark:bg-gray-900/60',
      none: 'bg-transparent',
    }
    return [
      'absolute inset-0',
      'modal-backdrop',
      tones[props.backdrop] || tones.blur,
    ].join(' ')
  })

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
    <Transition name="modal" appear :duration="{ enter: 360, leave: 240 }">
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
        <!--
          Backdrop: paint full strength on mount. NEVER opacity-animate this node
          (or any node with backdrop-filter) — browsers composite blur abruptly and
          it reads as “fill then darken”. Leave: backdrop holds until Transition
          leave duration ends, then cuts with unmount.
        -->
        <div :class="backdropClasses" :aria-hidden="true" />

        <!-- Solo el panel anima (glow incluido en el shell) -->
        <div :class="panelShellClasses" @click.stop>
          <div class="modal-ambient-glow" aria-hidden="true" />
          <div
            ref="modalRef"
            class="relative flex w-full flex-col"
            :class="[modalClasses]"
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
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
  /*
   * Spec: docs/superpowers/specs/2026-07-31-basemodal-panel-transition-design.md
   * Only .modal-panel-shell animates. Backdrop is instant (no opacity here).
   */
  .modal-enter-active .modal-panel-shell {
    transition-property: opacity, transform;
    transition-duration: 360ms;
    transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
  }

  .modal-leave-active .modal-panel-shell {
    transition-property: opacity, transform;
    transition-duration: 240ms;
    transition-timing-function: cubic-bezier(0.4, 0, 1, 1);
  }

  .modal-enter-from .modal-panel-shell,
  .modal-leave-to .modal-panel-shell {
    opacity: 0;
    transform: translateY(0.75rem);
  }

  .modal-enter-to .modal-panel-shell,
  .modal-leave-from .modal-panel-shell {
    opacity: 1;
    transform: translateY(0);
  }

  /* Ambient glow detrás del panel — elevación suave sin borde duro */
  .modal-ambient-glow {
    pointer-events: none;
    position: absolute;
    inset: -3rem;
    z-index: 0;
    border-radius: 2.5rem;
    background: radial-gradient(
      ellipse 70% 60% at 50% 42%,
      rgba(255, 255, 255, 0.35) 0%,
      rgba(255, 255, 255, 0.1) 38%,
      transparent 70%
    );
    filter: blur(32px);
    opacity: 1;
  }

  :global(.dark) .modal-ambient-glow {
    background: radial-gradient(
      ellipse 70% 60% at 50% 42%,
      rgba(148, 163, 184, 0.28) 0%,
      rgba(255, 255, 255, 0.08) 40%,
      transparent 70%
    );
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .modal-ambient-glow {
      filter: none;
      opacity: 0.35;
    }

    .modal-enter-active .modal-panel-shell,
    .modal-leave-active .modal-panel-shell {
      transition: none;
    }
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
