<template>
  <Transition name="modal" appear @enter="handleEnter" @leave="handleLeave">
    <div v-if="isOpen" ref="containerRef" class="fixed inset-0 z-[9999] flex items-center justify-center" role="dialog"
      :aria-modal="true" :aria-labelledby="titleId" :aria-describedby="descriptionId" :aria-live="ariaLiveValue"
      :aria-atomic="true" @click="handleBackdropClick">
      <!-- Backdrop -->
      <div :class="[
        backdropClasses,
        'absolute inset-0 transition-opacity',
        { 'opacity-100': isVisible, 'opacity-0': !isVisible },
      ]" :aria-hidden="true" />

      <!-- Modal Container -->
      <div ref="modalRef" :class="[modalClasses, 'relative']" @click.stop>
        <!-- Header -->
        <header v-if="$slots.header || title" :class="[headerClasses, 'flex items-center justify-between p-6']">
          <slot name="header">
            <h2 :id="titleId" :class="titleClasses">
              {{ title }}
            </h2>
          </slot>

          <button v-if="showCloseButton" type="button" :aria-label="closeButtonLabel" :class="closeButtonClasses"
            @click="handleClose">
            <X :class="[
              `w-5 h-5 ${getTextSemantic('tertiary').value} dark:${getTextSemantic('tertiary').value} hover:${getTextSemantic('secondary').value} dark:hover:${getTextSemantic('secondary').value} transition-colors duration-200`,
            ]" />
            <span class="sr-only">×</span>
          </button>
        </header>

        <!-- Content -->
        <div class="p-6">
          <slot />
        </div>

        <!-- Footer -->
        <footer v-if="$slots.footer" :class="[footerClasses, 'flex items-center justify-end gap-3 p-6']">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useColors, useId, useTypography } from '@ritmo/ui'
import {
  useElementSize,
  useEventListener,
  usePreferredReducedMotion,
  useWindowSize,
} from '@vueuse/core'
import { X } from 'lucide-vue-next'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useFocusTrap as useCustomFocusTrap } from '../../../composables/useFocusTrap'
import { useI18n } from '../../../i18n'

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
const { width: modalWidth, height: modalHeight } = useElementSize(modalRef)

// Focus trap personalizado
const {
  activate: activateFocusTrap,
  deactivate: deactivateFocusTrap,
  isActive: isFocusTrapActive,
  containerRef: focusTrapContainerRef,
} = useCustomFocusTrap({
  escapeDeactivates: props.closeOnEscape,
  clickOutsideDeactivates: props.closeOnBackdropClick,
  returnFocusOnDeactivate: props.returnFocusOnClose,
  preventScroll: props.preventScroll,
})

// Asignar el modalRef al focusTrapContainerRef
watch(modalRef, newRef => {
  if (newRef) {
    focusTrapContainerRef.value = newRef
  }
})

// Usar colores del sistema de diseño
const { getSurface, getTextSemantic, getBorderSemantic } = useColors()

// Usar tipografía unificada
const typography = useTypography()

// IDs únicos para accesibilidad usando el sistema determinístico
const titleId = useId('modal-title', {
  title: props.title,
  size: props.size,
})
const descriptionId = useId('modal-description', {
  title: props.title,
  size: props.size,
})

// i18n support
const { t } = useI18n()

// Estado interno
const isVisible = ref(false)
const isAnimating = ref(false)

// Computed para clases del modal
const modalClasses = computed(() => {
  const baseClasses = [
    'relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl',
    'transform transition-all duration-300 ease-out',
    'max-h-[90vh] overflow-hidden',
  ]

  // Clases de tamaño
  const sizeClasses = {
    xs: 'max-w-sm',
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  }

  // Clases de posición
  const positionClasses = {
    center: 'mx-auto my-auto',
    top: 'mx-auto mt-8 mb-auto',
    bottom: 'mx-auto mt-auto mb-8',
    left: 'ml-8 mr-auto my-auto',
    right: 'ml-auto mr-8 my-auto',
  }

  // Clases dinámicas basadas en estado VueUse
  const dynamicClasses = [
    // Visibilidad
    isVisible.value ? 'opacity-100 scale-100' : 'opacity-0 scale-95',

    // Animaciones respetando preferencias
    prefersReducedMotion.value
      ? 'transition-none'
      : 'transition-all duration-300 ease-out',

    // Responsive
    windowWidth.value < 640 ? 'mx-4' : '',
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

// Clases del backdrop
const backdropClasses = computed(() => {
  const baseClasses = ['absolute inset-0', 'transition-opacity duration-300']

  const backdropStyles = {
    blur: 'backdrop-blur-sm bg-black/20 dark:bg-black/40',
    dark: 'bg-black/50 dark:bg-black/70',
    light: 'bg-white/50 dark:bg-gray-900/50',
    none: 'bg-transparent',
  }

  const dynamicClasses = [
    isVisible.value ? 'opacity-100' : 'opacity-0',
    prefersReducedMotion.value
      ? 'transition-none'
      : 'transition-opacity duration-300',
  ]

  return [
    ...baseClasses,
    backdropStyles[props.backdrop] || backdropStyles.blur,
    ...dynamicClasses,
  ]
    .filter(Boolean)
    .join(' ')
})

// Clases del header
const headerClasses = computed(() =>
  ['border-b border-gray-200 dark:border-gray-700'].join(' '),
)

// Clases del título
const titleClasses = computed(() =>
  ['text-lg font-semibold text-gray-900 dark:text-gray-100'].join(' '),
)

// Clases del footer
const footerClasses = computed(() =>
  ['border-t border-gray-200 dark:border-gray-700'].join(' '),
)

// Clases del botón de cerrar
const closeButtonClasses = computed(() => {
  const baseClasses = [
    'p-2 rounded-lg transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    'hover:bg-gray-100 dark:hover:bg-gray-700',
  ]

  const styleClasses = {
    minimal:
      'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300',
    subtle:
      'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
    floating:
      'bg-white dark:bg-gray-800 shadow-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
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
  if (!prefersReducedMotion.value) {
    setTimeout(() => {
      isVisible.value = true
      isAnimating.value = false
    }, 10)
  } else {
    isVisible.value = true
    isAnimating.value = false
  }
}

const handleLeave = () => {
  isAnimating.value = true
  isVisible.value = false
  setTimeout(() => {
    isAnimating.value = false
  }, 300)
}

const handleBackdropClick = (event: Event) => {
  if (props.closeOnBackdropClick && event.target === event.currentTarget) {
    handleClose()
  }
}

const handleClose = () => {
  emit('update:isOpen', false)
  emit('close')
}

const handleOpen = () => {
  emit('open')
}

// Event listeners globales optimizados con VueUse
useEventListener('keydown', event => {
  if (props.isOpen && props.closeOnEscape && event.key === 'Escape') {
    event.preventDefault()
    handleClose()
  }
})

// Watch para cambios en isOpen
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

      // Prevenir scroll del body
      if (props.preventScroll) {
        document.body.style.overflow = 'hidden'
      }
    } else {
      // Cerrar modal
      deactivateFocusTrap()

      // Restaurar scroll del body
      if (props.preventScroll) {
        document.body.style.overflow = ''
      }
    }
  },
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
})

onUnmounted(() => {
  deactivateFocusTrap()
  if (props.preventScroll) {
    document.body.style.overflow = ''
  }
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

<style scoped>
/* Transiciones del modal */
.modal-enter-active,
.modal-leave-active {
  @apply transition-all duration-300 ease-out;
}

.modal-enter-from {
  @apply opacity-0 scale-95;
}

.modal-leave-to {
  @apply opacity-0 scale-95;
}

.modal-enter-to,
.modal-leave-from {
  @apply opacity-100 scale-100;
}

/* Backdrop transitions */
.modal-enter-active .backdrop,
.modal-leave-active .backdrop {
  @apply transition-opacity duration-300 ease-out;
}

.modal-enter-from .backdrop,
.modal-leave-to .backdrop {
  @apply opacity-0;
}

.modal-enter-to .backdrop,
.modal-leave-from .backdrop {
  @apply opacity-100;
}

/* Focus styles */
.modal:focus-within {
  @apply outline-none;
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
  .backdrop {
    @apply transition-none;
  }
}

/* Focus visible support for all browsers */
.modal:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

/* High DPI displays optimization */
@media (-webkit-min-device-pixel-ratio: 2),
(min-resolution: 192dpi) {
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
