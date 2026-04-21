// Global toast state management - Ritmo UI 2025
// Provides a singleton instance of toast state that can be shared across components

import type { Component } from 'vue'
import { computed, onUnmounted, ref, type ComputedRef, type Ref } from 'vue'

export interface ToastAction {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
}

export interface Toast {
  id: string
  variant: 'info' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
  title?: string
  message?: string
  show?: boolean
  dismissible?: boolean
  autoDismiss?: boolean
  dismissDelay?: number
  animate?: boolean
  role?: string
  ariaLive?: 'polite' | 'assertive' | 'off'
  closeButtonAriaLabel?: string
  showIcon?: boolean
  showProgress?: boolean
  actions?: ToastAction[]
  progress?: number
  icon?: Component
}

export interface ToastOptions {
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
}

// Global state - singleton pattern
let globalToastState: {
  toasts: Ref<Toast[]>
  activeTimers: Ref<Map<string, NodeJS.Timeout>>
  activeProgressTimers: Ref<Map<string, NodeJS.Timeout>>
  options: Ref<ToastOptions>
} | null = null

// Initialize global state
const initializeGlobalState = (options: ToastOptions = {}) => {
  if (!globalToastState) {
    globalToastState = {
      toasts: ref<Toast[]>([]),
      activeTimers: ref<Map<string, NodeJS.Timeout>>(new Map()),
      activeProgressTimers: ref<Map<string, NodeJS.Timeout>>(new Map()),
      options: ref({
        maxToasts: 5,
        position: 'top-right',
        autoDismiss: true,
        dismissDelay: 5000,
        ...options,
      }),
    }
  }
  return globalToastState
}

export function useGlobalToast(options: ToastOptions = {}): {
  toasts: Ref<Toast[]>
  showToast: (toast: Omit<Toast, 'id'>) => string
  dismissToast: (id: string) => void
  dismissAll: () => void
  pauseAutoHide: (id: string) => void
  resumeAutoHide: (id: string) => void
  toastPositionClasses: ComputedRef<string>
  generateToastId: () => string
  updateOptions: (newOptions: Partial<ToastOptions>) => void
} {
  const state = initializeGlobalState(options)

  // Update options if provided
  if (Object.keys(options).length > 0) {
    state.options.value = { ...state.options.value, ...options }
  }

  const { toasts, activeTimers, activeProgressTimers, options: currentOptions } = state

  // Generar ID único para toast
  const generateToastId = (): string => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Mostrar toast
  const showToast = (toastData: Omit<Toast, 'id' | 'progress'>): string => {
    const toast: Toast = {
      ...toastData,
      id: generateToastId(),
      progress: 100,
      show: true,
      dismissible: toastData.dismissible ?? true,
      autoDismiss: toastData.autoDismiss ?? currentOptions.value.autoDismiss,
      dismissDelay: toastData.dismissDelay ?? currentOptions.value.dismissDelay,
      showIcon: toastData.showIcon ?? true,
      showProgress: toastData.showProgress ?? true,
    }

    // Agregar toast al inicio del array
    toasts.value.unshift(toast)

    // Limitar número máximo de toasts
    if (toasts.value.length > currentOptions.value.maxToasts!) {
      const removedToast = toasts.value.pop()
      if (removedToast) {
        dismissToast(removedToast.id)
      }
    }

    // Auto-dismiss si está habilitado
    if (toast.autoDismiss) {
      startProgressTimer(toast)
    }

    return toast.id
  }

  // Cerrar toast específico
  const dismissToast = (id: string): void => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      // Limpiar timers
      clearToastTimers(id)
      toasts.value.splice(index, 1)
    }
  }

  // Cerrar todos los toasts
  const dismissAll = (): void => {
    // Limpiar todos los timers
    activeTimers.value.forEach(timer => clearTimeout(timer))
    activeProgressTimers.value.forEach(timer => clearInterval(timer))
    activeTimers.value.clear()
    activeProgressTimers.value.clear()

    toasts.value = []
  }

  // Iniciar timer de progreso
  const startProgressTimer = (toast: Toast): void => {
    if (!toast.autoDismiss) return

    const startTime = Date.now()
    const duration = toast.dismissDelay || currentOptions.value.dismissDelay

    const updateProgress = () => {
      if (!toast.autoDismiss) return

      const elapsed = Date.now() - startTime
      const progress = Math.max(0, 100 - (elapsed / duration) * 100)

      if (progress > 0) {
        toast.progress = progress
        requestAnimationFrame(updateProgress)
      } else {
        dismissToast(toast.id)
      }
    }

    requestAnimationFrame(updateProgress)
  }

  // Limpiar timers de un toast específico
  const clearToastTimers = (toastId: string): void => {
    const timer = activeTimers.value.get(toastId)
    const progressTimer = activeProgressTimers.value.get(toastId)

    if (timer) {
      clearTimeout(timer)
      activeTimers.value.delete(toastId)
    }

    if (progressTimer) {
      clearInterval(progressTimer)
      activeProgressTimers.value.delete(toastId)
    }
  }

  // Pausar auto-dismiss
  const pauseAutoHide = (toastId: string): void => {
    const timer = activeTimers.value.get(toastId)
    if (timer) {
      clearTimeout(timer)
      activeTimers.value.delete(toastId)
    }
  }

  // Reanudar auto-dismiss
  const resumeAutoHide = (toastId: string): void => {
    const toast = toasts.value.find(t => t.id === toastId)
    if (toast && toast.autoDismiss) {
      startProgressTimer(toast)
    }
  }

  // Computed para posición de toasts
  const toastPositionClasses = computed(() => {
    const positionMap = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
      'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
    }
    return positionMap[currentOptions.value.position!]
  })

  // Update options
  const updateOptions = (newOptions: Partial<ToastOptions>) => {
    state.options.value = { ...state.options.value, ...newOptions }
  }

  // Cleanup al desmontar (solo si es el último componente usando el estado)
  onUnmounted(() => {
    // Note: We don't call dismissAll() here because other components might still be using the global state
    // The global state will be cleaned up when the app unmounts
  })

  return {
    // Estado
    toasts: computed(() => toasts.value),

    // Métodos principales
    showToast,
    dismissToast,
    dismissAll,

    // Métodos de control
    pauseAutoHide,
    resumeAutoHide,

    // Utilidades
    toastPositionClasses,
    generateToastId,
    updateOptions,
  }
}

// Export the global state for direct access if needed
export const getGlobalToastState = () => globalToastState

