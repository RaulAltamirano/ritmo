import { ref } from 'vue'

interface Notification {
  id: string
  title: string
  message: string
  type: 'success' | 'info' | 'warning' | 'error'
  duration?: number
}

export const useNotifications = () => {
  const notifications = ref<Notification[]>([])

  const showNotification = (
    title: string, 
    message: string, 
    type: 'success' | 'info' | 'warning' | 'error' = 'info',
    duration: number = 5000
  ) => {
    const id = Date.now().toString()
    const notification: Notification = {
      id,
      title,
      message,
      type,
      duration
    }

    notifications.value.push(notification)

    // Auto-remove notification
    setTimeout(() => {
      removeNotification(id)
    }, duration)

    return id
  }

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clearAllNotifications = () => {
    notifications.value = []
  }

  // Helper methods for common notification types
  const showSuccess = (title: string, message: string, duration?: number) => {
    return showNotification(title, message, 'success', duration)
  }

  const showInfo = (title: string, message: string, duration?: number) => {
    return showNotification(title, message, 'info', duration)
  }

  const showWarning = (title: string, message: string, duration?: number) => {
    return showNotification(title, message, 'warning', duration)
  }

  const showError = (title: string, message: string, duration?: number) => {
    return showNotification(title, message, 'error', duration)
  }

  return {
    notifications: readonly(notifications),
    showNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showInfo,
    showWarning,
    showError
  }
} 