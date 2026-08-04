<template>
  <div class="relative">
    <button
      type="button"
      class="relative min-h-11 min-w-11 cursor-pointer rounded-full p-2 text-secondary-500 transition-colors duration-200 hover:bg-secondary-100 hover:text-secondary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/70 focus-visible:ring-offset-2 dark:text-secondary-400 dark:hover:bg-white/10 dark:hover:text-secondary-100"
      aria-label="Notifications"
      :aria-expanded="open ? 'true' : 'false'"
      @click="emit('toggle')"
    >
      <Bell :size="18" />
      <span
        v-if="unreadCount > 0"
        class="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </button>

    <div
      v-if="open"
      class="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-outline/50 bg-surface py-1.5 shadow-[0_12px_40px_-16px_rgb(0_0_0/0.35)] dark:border-white/10 dark:bg-secondary-900"
    >
      <div
        class="flex items-center justify-between border-b border-gray-100 px-3 py-2 dark:border-gray-700"
      >
        <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
          Notifications
        </h3>
        <button
          type="button"
          class="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          @click="emit('close')"
        >
          <span class="sr-only">Close notifications</span>
          ×
        </button>
      </div>

      <div class="max-h-64 overflow-y-auto">
        <div v-if="notifications.length === 0" class="px-3 py-4 text-center">
          <p class="text-sm text-gray-500 dark:text-gray-400">No notifications</p>
        </div>

        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="cursor-pointer px-3 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
          :class="notification.unread ? 'bg-blue-50 dark:bg-blue-900/20' : ''"
          @click="emit('mark-read', notification.id)"
        >
          <div class="flex items-start gap-3">
            <div
              class="mt-2 h-2 w-2 flex-shrink-0 rounded-full"
              :class="
                notification.unread ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              "
            />
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ notification.title }}
              </p>
              <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {{ notification.message }}
              </p>
              <p class="mt-1 text-xs text-gray-500">{{ notification.time }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Bell } from 'lucide-vue-next'
  import { computed } from 'vue'

  export interface NavbarNotification {
    id: number
    title: string
    message: string
    time: string
    unread: boolean
    type?: string
  }

  const props = defineProps<{
    open: boolean
    notifications: NavbarNotification[]
  }>()

  const emit = defineEmits<{
    toggle: []
    close: []
    'mark-read': [id: number]
  }>()

  const unreadCount = computed(() => props.notifications.filter(n => n.unread).length)
</script>
