// Composable para manejo de toasts - Ritmo UI 2025
// Reemplaza la implementación rota en BaseToast.vue

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

export function useToast(options: ToastOptions = {}): {
  toasts: Ref<Toast[]>
  showToast: (toast: Omit<Toast, 'id'>) => string
  dismissToast: (id: string) => void
  dismissAll: () => void
  pauseAutoHide: (id: string) => void
  resumeAutoHide: (id: string) => void
  toastPositionClasses: ComputedRef<string>
  generateToastId: () => string
} {
  const {
    maxToasts = 5,
    position = 'top-right',
    autoDismiss = true,
    dismissDelay = 5000,
  } = options

  const toasts = ref<Toast[]>([])
  const activeTimers = ref<Map<string, NodeJS.Timeout>>(new Map())
  const activeProgressTimers = ref<Map<string, NodeJS.Timeout>>(new Map())

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
      autoDismiss: toastData.autoDismiss ?? autoDismiss,
      dismissDelay: toastData.dismissDelay ?? dismissDelay,
      showIcon: toastData.showIcon ?? true,
      showProgress: toastData.showProgress ?? true,
    }

    // Agregar toast al inicio del array
    toasts.value.unshift(toast)

    // Limitar número máximo de toasts
    if (toasts.value.length > maxToasts) {
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
    const duration = toast.dismissDelay ?? dismissDelay

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
    if (toast?.autoDismiss) {
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
    return positionMap[position]
  })

  // Cleanup al desmontar
  onUnmounted(() => {
    dismissAll()
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
  }
}
