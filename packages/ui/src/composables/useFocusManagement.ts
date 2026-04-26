// Composable para Manejo de Focus - Ritmo UI 2025
// Implementa gestión de focus para accesibilidad

import { ref, readonly } from 'vue'

export interface FocusManagementOptions {
  /** Si debe crear un focus trap */
  trapFocus?: boolean
  /** Si debe restaurar el focus original */
  returnFocus?: boolean
  /** Si debe prevenir scroll */
  preventScroll?: boolean
}

export function useFocusManagement(options: FocusManagementOptions = {}) {
  const { trapFocus = false, returnFocus = true, preventScroll = false } = options

  const originalFocus = ref<HTMLElement | null>(null)
  const focusTrapActive = ref(false)
  const focusableElements = ref<HTMLElement[]>([])

  // Guardar focus original
  const saveOriginalFocus = () => {
    originalFocus.value = document.activeElement as HTMLElement
  }

  // Restaurar focus original
  const restoreOriginalFocus = () => {
    if (returnFocus && originalFocus.value) {
      originalFocus.value.focus({ preventScroll })
      originalFocus.value = null
    }
  }

  // Obtener elementos focusables
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

    const elements = Array.from(container.querySelectorAll(selector))

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

  // Crear focus trap
  const createFocusTrap = (container: HTMLElement) => {
    if (!trapFocus) return

    saveOriginalFocus()
    focusableElements.value = getFocusableElements(container)

    if (focusableElements.value.length === 0) {
      console.warn('useFocusManagement: No focusable elements found for focus trap')
      return
    }

    focusTrapActive.value = true

    // Enfocar primer elemento
    focusableElements.value[0]?.focus({ preventScroll })
  }

  // Remover focus trap
  const removeFocusTrap = () => {
    if (!trapFocus) return

    focusTrapActive.value = false
    focusableElements.value = []
    restoreOriginalFocus()
  }

  // Mover focus al siguiente elemento
  const focusNext = () => {
    if (!focusTrapActive.value || focusableElements.value.length === 0) return

    const currentIndex = focusableElements.value.indexOf(
      document.activeElement as HTMLElement,
    )
    const nextIndex =
      currentIndex >= focusableElements.value.length - 1 ? 0 : currentIndex + 1

    focusableElements.value[nextIndex]?.focus({ preventScroll })
  }

  // Mover focus al elemento anterior
  const focusPrevious = () => {
    if (!focusTrapActive.value || focusableElements.value.length === 0) return

    const currentIndex = focusableElements.value.indexOf(
      document.activeElement as HTMLElement,
    )
    const previousIndex =
      currentIndex <= 0 ? focusableElements.value.length - 1 : currentIndex - 1

    focusableElements.value[previousIndex]?.focus({ preventScroll })
  }

  // Enfocar primer elemento
  const focusFirst = () => {
    if (!focusTrapActive.value || focusableElements.value.length === 0) return

    focusableElements.value[0]?.focus({ preventScroll })
  }

  // Enfocar último elemento
  const focusLast = () => {
    if (!focusTrapActive.value || focusableElements.value.length === 0) return

    const lastIndex = focusableElements.value.length - 1
    focusableElements.value[lastIndex]?.focus({ preventScroll })
  }

  // Verificar si un elemento está en el focus trap
  const isInFocusTrap = (element: HTMLElement): boolean => {
    return focusTrapActive.value && focusableElements.value.includes(element)
  }

  // Manejador de teclado para focus trap
  const handleFocusTrapKeydown = (event: KeyboardEvent) => {
    if (!focusTrapActive.value) return

    switch (event.key) {
      case 'Tab':
        event.preventDefault()
        if (event.shiftKey) {
          focusPrevious()
        } else {
          focusNext()
        }
        break

      case 'Escape':
        if (trapFocus) {
          event.preventDefault()
          removeFocusTrap()
        }
        break
    }
  }

  // Limpiar estado
  const cleanup = () => {
    removeFocusTrap()
    originalFocus.value = null
  }

  return {
    // Estado
    focusTrapActive: readonly(focusTrapActive),
    focusableElements: readonly(focusableElements),

    // Métodos principales
    createFocusTrap,
    removeFocusTrap,

    // Navegación de focus
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,

    // Utilidades
    saveOriginalFocus,
    restoreOriginalFocus,
    isInFocusTrap,
    handleFocusTrapKeydown,
    cleanup,
  }
}
