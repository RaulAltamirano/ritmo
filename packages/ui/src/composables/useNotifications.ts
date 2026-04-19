import { computed, ref, onUnmounted } from 'vue'

export interface NotificationOptions {
  id?: string
  type: 'info' | 'success' | 'warning' | 'error'
  title?: string
  message: string
  duration?: number
  priority?: 'low' | 'normal' | 'high'
  actions?: Array<{
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'ghost'
  }>
  persistent?: boolean
  dismissible?: boolean
}

export interface Notification extends NotificationOptions {
  id: string
  createdAt: number
  isVisible: boolean
  progress: number
  isPaused: boolean
  animationFrameId?: number
}

export const useNotifications = () => {
  const notifications = ref<Notification[]>([])
  const nextId = ref(1)
  const animationFrames = ref<Map<string, number>>(new Map())

  // Cleanup function para cancelar todos los requestAnimationFrame
  const cleanupAnimationFrames = () => {
    animationFrames.value.forEach(frameId => {
      cancelAnimationFrame(frameId)
    })
    animationFrames.value.clear()
  }

  // Cleanup al desmontar
  onUnmounted(() => {
    cleanupAnimationFrames()
  })

  // Screen reader announcement utility
  const announceToScreenReader = (
    text: string,
    priority: 'polite' | 'assertive' = 'polite',
  ) => {
    // Create live region for announcements
    let liveRegion = document.getElementById('a11y-live-region')

    if (!liveRegion) {
      liveRegion = document.createElement('div')
      liveRegion.id = 'a11y-live-region'
      liveRegion.setAttribute('aria-live', priority)
      liveRegion.setAttribute('aria-atomic', 'true')
      liveRegion.style.position = 'absolute'
      liveRegion.style.left = '-10000px'
      liveRegion.style.width = '1px'
      liveRegion.style.height = '1px'
      liveRegion.style.overflow = 'hidden'
      document.body.appendChild(liveRegion)
    }

    // Update live region
    liveRegion.textContent = text

    // Clear after announcement
    setTimeout(() => {
      if (liveRegion) {
        liveRegion.textContent = ''
      }
    }, 1000)
  }

  // Crear notificación
  const show = (options: NotificationOptions): string => {
    const id = options.id || `notification-${nextId.value++}`

    const notification: Notification = {
      ...options,
      id,
      createdAt: Date.now(),
      isVisible: true,
      progress: 100,
      isPaused: false,
      duration: options.duration ?? 5000,
      persistent: options.persistent ?? false,
      dismissible: options.dismissible ?? true,
    }

    // Agregar al inicio si es de alta prioridad
    if (notification.priority === 'high') {
      notifications.value.unshift(notification)
    } else {
      notifications.value.push(notification)
    }

    // Limitar número de notificaciones
    if (notifications.value.length > 5) {
      notifications.value = notifications.value.slice(0, 5)
    }

    // Anunciar a lectores de pantalla
    const announcement = notification.title
      ? `${notification.title}: ${notification.message}`
      : notification.message

    announceToScreenReader(
      announcement,
      notification.type === 'error' ? 'assertive' : 'polite',
    )

    // Iniciar progreso si no es persistente
    if (!notification.persistent && notification.duration !== Infinity) {
      startProgress(notification)
    }

    return id
  }

  // Dismiss notificación
  const dismiss = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      const notification = notifications.value[index]
      notification.isVisible = false

      // Cancelar animación si existe
      const frameId = animationFrames.value.get(id)
      if (frameId) {
        cancelAnimationFrame(frameId)
        animationFrames.value.delete(id)
      }

      // Anunciar cierre
      announceToScreenReader(`Notificación cerrada: ${notification.message}`)

      // Remover después de animación
      setTimeout(() => {
        const removeIndex = notifications.value.findIndex(n => n.id === id)
        if (removeIndex > -1) {
          notifications.value.splice(removeIndex, 1)
        }
      }, 300)
    }
  }

  // Dismiss todas
  const dismissAll = () => {
    // Cancelar todas las animaciones
    cleanupAnimationFrames()

    notifications.value.forEach(notification => {
      notification.isVisible = false
    })

    setTimeout(() => {
      notifications.value = []
    }, 300)
  }

  // Pausar progreso de una notificación
  const pauseProgress = (id: string) => {
    const notification = notifications.value.find(n => n.id === id)
    if (notification && !notification.persistent) {
      notification.isPaused = true

      // Cancelar animación actual
      const frameId = animationFrames.value.get(id)
      if (frameId) {
        cancelAnimationFrame(frameId)
        animationFrames.value.delete(id)
      }
    }
  }

  // Reanudar progreso de una notificación
  const resumeProgress = (id: string) => {
    const notification = notifications.value.find(n => n.id === id)
    if (
      notification &&
      !notification.persistent &&
      notification.duration !== Infinity
    ) {
      notification.isPaused = false
      startProgress(notification)
    }
  }

  // Progreso de notificaciones
  const startProgress = (notification: Notification) => {
    if (
      notification.duration === Infinity ||
      !notification.duration ||
      notification.isPaused
    )
      return

    const startTime = Date.now()
    const endTime = startTime + notification.duration

    const updateProgress = () => {
      // Verificar si la notificación sigue existiendo
      const currentNotification = notifications.value.find(
        n => n.id === notification.id,
      )
      if (!currentNotification || currentNotification.isPaused) {
        return
      }

      const now = Date.now()
      const remaining = endTime - now

      if (remaining <= 0) {
        dismiss(notification.id)
        return
      }

      notification.progress = Math.max(
        0,
        (remaining / (notification.duration || 5000)) * 100,
      )

      // Guardar el frame ID para poder cancelarlo
      const frameId = requestAnimationFrame(updateProgress)
      animationFrames.value.set(notification.id, frameId)
    }

    const frameId = requestAnimationFrame(updateProgress)
    animationFrames.value.set(notification.id, frameId)
  }

  // Métodos de conveniencia
  const info = (message: string, options?: Partial<NotificationOptions>) =>
    show({ ...options, type: 'info', message })

  const success = (message: string, options?: Partial<NotificationOptions>) =>
    show({ ...options, type: 'success', message })

  const warning = (message: string, options?: Partial<NotificationOptions>) =>
    show({ ...options, type: 'warning', message })

  const error = (message: string, options?: Partial<NotificationOptions>) =>
    show({ ...options, type: 'error', message })

  return {
    notifications: computed(() => notifications.value),
    show,
    dismiss,
    dismissAll,
    pauseProgress,
    resumeProgress,
    info,
    success,
    warning,
    error,
  }
}
