// Composable para Focus Trap - Ritmo UI 2025
// Implementa accesibilidad WCAG 2.2 para modales y overlays

import { nextTick, onMounted, onUnmounted, readonly, ref } from 'vue'

export interface FocusTrapOptions {
  /** Si el escape desactiva el focus trap */
  escapeDeactivates?: boolean
  /** Si el click fuera desactiva el focus trap */
  clickOutsideDeactivates?: boolean
  /** Si debe restaurar el focus original al desactivar */
  returnFocusOnDeactivate?: boolean
  /** Elemento inicial para focus */
  initialFocus?: string | HTMLElement
  /** Si debe prevenir scroll */
  preventScroll?: boolean
}

export function useFocusTrap(options: FocusTrapOptions = {}) {
  const {
    escapeDeactivates = true,
    clickOutsideDeactivates = true,
    returnFocusOnDeactivate = true,
    initialFocus,
    preventScroll = false,
  } = options

  const containerRef = ref<HTMLElement>()
  const isActive = ref(false)
  const originalFocus = ref<HTMLElement | null>(null)
  const focusableElements = ref<HTMLElement[]>([])
  const firstFocusableElement = ref<HTMLElement | null>(null)
  const lastFocusableElement = ref<HTMLElement | null>(null)

  // Obtener elementos focusables dentro del contenedor
  const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
    const selector = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ')

    const elements = Array.from(container.querySelectorAll<HTMLElement>(selector))

    // Filtrar elementos visibles
    return elements.filter(element => {
      const style = window.getComputedStyle(element)
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0'
      )
    })
  }

  // Activar focus trap
  const activate = async (container?: HTMLElement) => {
    if (isActive.value) return

    const targetContainer = container ?? containerRef.value
    if (!targetContainer) {
      console.warn('useFocusTrap: No container provided for focus trap')
      return
    }

    // Verificar que el contenedor esté en el DOM
    if (!document.contains(targetContainer)) {
      console.warn('useFocusTrap: Container is not in the DOM')
      return
    }

    // Guardar focus original
    originalFocus.value = document.activeElement as HTMLElement

    // Obtener elementos focusables
    focusableElements.value = getFocusableElements(targetContainer)

    if (focusableElements.value.length === 0) {
      console.warn('useFocusTrap: No focusable elements found in container')
      return
    }

    firstFocusableElement.value = focusableElements.value[0]
    lastFocusableElement.value =
      focusableElements.value[focusableElements.value.length - 1]

    // Establecer focus inicial
    await nextTick()
    if (initialFocus) {
      const initialElement =
        typeof initialFocus === 'string'
          ? (targetContainer.querySelector(initialFocus) as HTMLElement)
          : initialFocus

      if (initialElement && focusableElements.value.includes(initialElement)) {
        initialElement.focus()
      } else {
        firstFocusableElement.value?.focus()
      }
    } else {
      firstFocusableElement.value?.focus()
    }

    // Prevenir scroll si está habilitado
    if (preventScroll) {
      document.body.style.overflow = 'hidden'
    }

    isActive.value = true
  }

  // Desactivar focus trap
  const deactivate = () => {
    if (!isActive.value) return

    // Restaurar focus original
    if (returnFocusOnDeactivate && originalFocus.value) {
      originalFocus.value.focus()
    }

    // Restaurar scroll
    if (preventScroll) {
      document.body.style.overflow = ''
    }

    // Limpiar estado
    isActive.value = false
    originalFocus.value = null
    focusableElements.value = []
    firstFocusableElement.value = null
    lastFocusableElement.value = null
  }

  // Manejador de teclado para focus trap
  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isActive.value) return

    if (event.key === 'Escape' && escapeDeactivates) {
      event.preventDefault()
      event.stopPropagation()
      deactivate()
      return
    }

    if (event.key === 'Tab') {
      event.preventDefault()

      const currentElement = document.activeElement as HTMLElement
      const currentIndex = focusableElements.value.indexOf(currentElement)

      if (event.shiftKey) {
        // Shift + Tab: ir al elemento anterior
        if (currentIndex <= 0) {
          lastFocusableElement.value?.focus()
        } else {
          focusableElements.value[currentIndex - 1]?.focus()
        }
      } else {
        // Tab: ir al elemento siguiente
        if (currentIndex >= focusableElements.value.length - 1) {
          firstFocusableElement.value?.focus()
        } else {
          focusableElements.value[currentIndex + 1]?.focus()
        }
      }
    }
  }

  // Manejador de click fuera
  const handleClickOutside = (event: Event) => {
    if (!isActive.value || !clickOutsideDeactivates) return

    const target = event.target as HTMLElement
    if (containerRef.value && !containerRef.value.contains(target)) {
      deactivate()
    }
  }

  // Lifecycle
  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown, true)
    document.addEventListener('click', handleClickOutside, true)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown, true)
    document.removeEventListener('click', handleClickOutside, true)
    deactivate()
  })

  return {
    // Estado
    isActive: readonly(isActive),
    containerRef,

    // Métodos principales
    activate,
    deactivate,

    // Utilidades
    focusableElements: readonly(focusableElements),
    firstFocusableElement: readonly(firstFocusableElement),
    lastFocusableElement: readonly(lastFocusableElement),
  }
}
