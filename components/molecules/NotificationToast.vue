<template>
  <Teleport to="body">
    <div 
      class="fixed top-4 right-4 z-50 space-y-2"
      role="status"
      aria-live="polite"
    >
      <TransitionGroup
        name="notification"
        tag="div"
        class="space-y-2"
      >
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="flex items-start p-4 rounded-lg shadow-lg border max-w-sm backdrop-blur-sm"
          :class="getNotificationClasses(notification.type)"
          role="alert"
          :aria-label="`${notification.type} notification: ${notification.title}`"
        >
          <!-- Icono -->
          <div class="flex-shrink-0 mr-3">
            <component 
              :is="getNotificationIcon(notification.type)" 
              :size="20"
              class="mt-0.5"
            />
          </div>
          
          <!-- Contenido -->
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-medium mb-1">
              {{ notification.title }}
            </h4>
            <p class="text-sm opacity-90">
              {{ notification.message }}
            </p>
          </div>
          
          <!-- Botón cerrar -->
          <button
            @click="removeNotification(notification.id)"
            class="flex-shrink-0 ml-3 p-1 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
            :class="getCloseButtonClasses(notification.type)"
            aria-label="Cerrar notificación"
          >
            <X :size="16" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { CheckCircle, Info, AlertTriangle, XCircle, X } from 'lucide-vue-next'
import { useNotifications } from '../../composables/useNotifications'

const { notifications, removeNotification } = useNotifications()

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'success':
      return CheckCircle
    case 'info':
      return Info
    case 'warning':
      return AlertTriangle
    case 'error':
      return XCircle
    default:
      return Info
  }
}

const getNotificationClasses = (type: string) => {
  const baseClasses = 'bg-white/95 dark:bg-gray-800/95 border'
  
  switch (type) {
    case 'success':
      return `${baseClasses} border-green-200 dark:border-green-700 text-green-800 dark:text-green-200`
    case 'info':
      return `${baseClasses} border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200`
    case 'warning':
      return `${baseClasses} border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200`
    case 'error':
      return `${baseClasses} border-red-200 dark:border-red-700 text-red-800 dark:text-red-200`
    default:
      return `${baseClasses} border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200`
  }
}

const getCloseButtonClasses = (type: string) => {
  const baseClasses = 'focus:ring-offset-white dark:focus:ring-offset-gray-800'
  
  switch (type) {
    case 'success':
      return `${baseClasses} text-green-500 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 focus:ring-green-500`
    case 'info':
      return `${baseClasses} text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:ring-blue-500`
    case 'warning':
      return `${baseClasses} text-yellow-500 hover:text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 focus:ring-yellow-500`
    case 'error':
      return `${baseClasses} text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 focus:ring-red-500`
    default:
      return `${baseClasses} text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-gray-500`
  }
}
</script>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s ease;
}
</style> 