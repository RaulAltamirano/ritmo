<template>
  <BaseNavbar :show-mobile-menu="showMobileMenu" aria-label="Main navigation">
    <!-- Logo and brand -->
    <template #logo>
      <NuxtLink :to="ROUTES.DASHBOARD"
        class="text-gray-900 dark:text-white hover:opacity-80 transition-opacity duration-200"
        aria-label="Go to Dashboard">
        <RitmoLogo :size="28" variant="monochrome" :interactive="true" aria-label="Ritmo Logo" />
      </NuxtLink>
    </template>

    <template #brand>
      <NuxtLink :to="ROUTES.DASHBOARD" class="hover:opacity-80 transition-opacity duration-200"
        aria-label="Go to Dashboard">
        <h1 class="text-lg font-bold text-gray-900 dark:text-white">Ritmo</h1>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          Organize your time, live your rhythm
        </p>
      </NuxtLink>
    </template>

    <!-- Main navigation - simplified for mobile-first -->
    <template #nav-items>
      <!-- Primary navigation items -->
      <BaseNavItem v-for="item in primaryNavItems" :key="item.path" :path="item.path" :label="item.label"
        :icon="item.icon" :is-active="currentPath === item.path" />

      <!-- Secondary navigation items -->
      <BaseNavItem v-for="item in secondaryNavItems" :key="item.path" :path="item.path" :label="item.label"
        :icon="item.icon" :is-active="currentPath === item.path" />
    </template>

    <!-- Right side actions -->
    <template #actions>
      <!-- Notifications -->
      <div class="relative">
        <button @click="toggleNotifications"
          class="relative p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          aria-label="Notifications" :aria-expanded="showNotifications ? 'true' : 'false'">
          <Bell :size="18" />
          <!-- Notification badge -->
          <span v-if="unreadCount > 0"
            class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {{ unreadCount > 9 ? '9+' : unreadCount }}
          </span>
        </button>

        <!-- Notifications dropdown -->
        <div v-if="showNotifications"
          class="absolute top-full right-0 mt-1 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
          <div class="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
              <button @click="closeNotifications" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <span class="sr-only">Close notifications</span>
                ×
              </button>
            </div>
          </div>

          <div class="max-h-64 overflow-y-auto">
            <div v-if="notifications.length === 0" class="px-3 py-4 text-center">
              <p class="text-sm text-gray-500 dark:text-gray-400">No notifications</p>
            </div>

            <div v-for="notification in notifications" :key="notification.id" :class="[
              'px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors',
              notification.unread ? 'bg-blue-50 dark:bg-blue-900/20' : '',
            ]" @click="markAsRead(notification.id)">
              <div class="flex items-start space-x-3">
                <div :class="[
                  'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                  notification.unread
                    ? 'bg-blue-500'
                    : 'bg-gray-300 dark:bg-gray-600',
                ]"></div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ notification.title }}
                  </p>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {{ notification.message }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {{ notification.time }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- User profile -->
      <div class="relative">
        <button @click="toggleProfileMenu"
          class="flex items-center space-x-2 p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          aria-label="Profile menu" :aria-expanded="showProfileMenu ? 'true' : 'false'">
          <!-- User Avatar -->
          <div class="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
            <img v-if="isUserDataLoaded && isHydrated" :src="displayAvatar" :alt="userDisplayName"
              class="w-full h-full object-cover avatar-image" @error="handleAvatarError" />
            <div v-else class="w-full h-full bg-gray-300 dark:bg-gray-600 animate-pulse rounded-full"></div>
          </div>
          <span class="hidden sm:block text-sm font-medium">
            <span v-if="isUserDataLoaded && isHydrated">{{ userNavbarName }}</span>
            <span v-else class="bg-gray-300 dark:bg-gray-600 animate-pulse rounded w-16 h-4"></span>
          </span>
          <ChevronDown :size="12" class="transition-transform duration-200"
            :class="{ 'rotate-180': showProfileMenu }" />
        </button>

        <!-- Profile dropdown -->
        <div v-if="showProfileMenu"
          class="absolute top-full right-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
          <div class="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
            <div class="flex items-center space-x-3">
              <!-- User Avatar in dropdown -->
              <div class="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
                <img v-if="isUserDataLoaded && isHydrated" :src="displayAvatar" :alt="userDisplayName"
                  class="w-full h-full object-cover avatar-image" @error="handleAvatarError" />
                <div v-else class="w-full h-full bg-gray-300 dark:bg-gray-600 animate-pulse rounded-full"></div>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  <span v-if="isUserDataLoaded && isHydrated">{{
                    userDisplayName
                  }}</span>
                  <span v-else class="bg-gray-300 dark:bg-gray-600 animate-pulse rounded w-20 h-4"></span>
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  <span v-if="isUserDataLoaded && isHydrated">{{ userEmail }}</span>
                  <span v-else class="bg-gray-300 dark:bg-gray-600 animate-pulse rounded w-24 h-3"></span>
                </p>
              </div>
            </div>
          </div>

          <!-- Dark mode toggle -->
          <div class="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Moon :size="14" class="text-gray-500 dark:text-gray-400" />
                <span class="text-sm text-gray-700 dark:text-gray-300">Tema</span>
              </div>
              <button @click="toggleDarkMode"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                :class="currentIsDark ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'"
                :aria-label="currentIsDark ? 'Switch to light mode' : 'Switch to dark mode'">
                <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  :class="currentIsDark ? 'translate-x-6' : 'translate-x-1'" />
              </button>
            </div>
          </div>

          <!-- Timer settings -->
          <div class="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Clock :size="14" class="text-gray-500 dark:text-gray-400" />
                <span class="text-sm text-gray-700 dark:text-gray-300">Floating Timer</span>
              </div>
              <button @click="toggleFloatingTimer"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                :class="showFloatingTimer ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                  " :aria-label="showFloatingTimer ? 'Hide floating timer' : 'Show floating timer'
                    ">
                <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  :class="showFloatingTimer ? 'translate-x-6' : 'translate-x-1'" />
              </button>
            </div>
          </div>

          <NuxtLink :to="ROUTES.PROFILE"
            class="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            @click="closeProfileMenu">
            <User :size="16" />
            <span>My Profile</span>
          </NuxtLink>

          <NuxtLink :to="ROUTES.SETTINGS"
            class="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            @click="closeProfileMenu">
            <Settings :size="16" />
            <span>Settings</span>
          </NuxtLink>

          <div class="border-t border-gray-100 dark:border-gray-700 my-1"></div>

          <!-- End day button -->
          <button @click="handleEndDay"
            class="w-full flex items-center space-x-3 px-3 py-2 text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors duration-200">
            <Flag :size="16" />
            <span>End Day</span>
          </button>

          <button @click="handleLogout"
            class="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200">
            <LogOut :size="16" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      <button @click="toggleMobileMenu"
        class="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        aria-label="Open navigation menu">
        <Menu :size="18" />
      </button>
    </template>

    <!-- Mobile menu content - simplified and clean -->
    <template #mobile-menu>
      <!-- All navigation items in one clean list -->
      <div class="space-y-1">
        <NuxtLink v-for="item in allNavItems" :key="item.path" :to="item.path" :class="[
          'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          currentPath === item.path
            ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
            : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800',
        ]" :aria-label="item.label" :aria-current="currentPath === item.path ? 'page' : undefined"
          @click="closeMobileMenu">
          <component :is="item.icon" :size="18" />
          <span class="font-medium">{{ item.label }}</span>
        </NuxtLink>
      </div>
    </template>
  </BaseNavbar>
</template>

<script setup lang="ts">
import { useAuth } from '@/composables/auth'
import { useTheme, useUserData } from '@/composables/shared'
import { useTimerStore } from '@/stores/timer'
import { ROUTES } from '@/utils/routes'
import RitmoLogo from '@ritmo/ui/components/atoms/display/RitmoLogo.vue'
import BaseNavItem from '@ritmo/ui/components/organisms/navigation/BaseNavItem.vue'
import BaseNavbar from '@ritmo/ui/components/organisms/navigation/BaseNavbar.vue'
import {
  BarChart3,
  Bell,
  BookOpen,
  Calendar,
  ChevronDown,
  Clock,
  Flag,
  FolderOpen,
  LogOut,
  Menu,
  Moon,
  Settings,
  User,
} from 'lucide-vue-next'
import { navigateTo, useRoute } from 'nuxt/app'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

interface NavItem {
  path: string
  label: string
  icon: any
  description?: string
}

// Primary navigation - most important items
const primaryNavItems: NavItem[] = [
  {
    path: ROUTES.TODAY,
    label: 'Today',
    icon: Calendar,
  },
  {
    path: ROUTES.SCHEDULE,
    label: 'Schedule',
    icon: Calendar,
  },
]

// Secondary navigation - additional important items
const secondaryNavItems: NavItem[] = [
  {
    path: ROUTES.PROJECTS,
    label: 'Projects',
    icon: FolderOpen,
  },
  {
    path: ROUTES.JOURNAL,
    label: 'Journal',
    icon: BookOpen,
  },
  {
    path: ROUTES.ANALYTICS,
    label: 'Analytics',
    icon: BarChart3,
  },
]

// Combined navigation for mobile menu
const allNavItems = computed(() => [
  ...primaryNavItems,
  ...secondaryNavItems,
])

const emit = defineEmits<{
  'toggle-dark-mode': []
}>()

const route = useRoute()
const timerStore = useTimerStore()
const { logout } = useAuth()
const {
  userDisplayName,
  userEmail,
  displayAvatar,
  isUserDataLoaded,
  userNavbarName,
} = useUserData()

const showMobileMenu = ref(false)
const showProfileMenu = ref(false)
const showNotifications = ref(false)
const isHydrated = ref(false)

// Mock notification data - replace with real data
const notifications = ref([
  {
    id: 1,
    title: 'Task Reminder',
    message: 'Complete your daily review',
    time: '2 min ago',
    unread: true,
    type: 'info',
  },
  {
    id: 2,
    title: 'Focus Session Complete',
    message: 'Great job! You completed a 25-minute focus session',
    time: '15 min ago',
    unread: false,
    type: 'success',
  },
])

const unreadCount = computed(() => notifications.value.filter(n => n.unread).length)

// Computed properties
const currentPath = computed(() => route?.path || '/')
const showFloatingTimer = computed(() => timerStore?.showFloatingTimer || false)

// Usar useTheme directamente para evitar problemas con el plugin
const theme = useTheme({
  storageKey: 'theme',
  respectSystemPreference: true,
  enableTransitions: true,
  respectReducedMotion: true,
  enableApiSync: false,
  autoSyncOnChange: false,
})

const currentIsDark = theme.isDark
const currentToggleTheme = theme.toggleTheme

const toggleDarkMode = () => {
  currentToggleTheme()
  emit('toggle-dark-mode')
}


// Methods
const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
  if (showMobileMenu.value) {
    showProfileMenu.value = false
    showNotifications.value = false
  }
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
}

const toggleProfileMenu = () => {
  showProfileMenu.value = !showProfileMenu.value
  if (showProfileMenu.value) {
    showMobileMenu.value = false
    showNotifications.value = false
  }
}

const closeProfileMenu = () => {
  showProfileMenu.value = false
}

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  if (showNotifications.value) {
    showMobileMenu.value = false
    showProfileMenu.value = false
  }
}

const closeNotifications = () => {
  showNotifications.value = false
}

const markAsRead = (notificationId: number) => {
  const notification = notifications.value.find(n => n.id === notificationId)
  if (notification) {
    notification.unread = false
  }
}

const toggleFloatingTimer = () => {
  if (timerStore && typeof timerStore.toggleFloatingTimer === 'function') {
    timerStore.toggleFloatingTimer()
  }
}

const handleLogout = async () => {
  try {
    await logout()
    closeProfileMenu()
    await navigateTo('/auth/login', { replace: true })
  } catch (error) {
    await navigateTo('/auth/login', { replace: true }) // Even if logout fails, redirect to login for security
  }
}

const handleEndDay = () => {
  if (timerStore && typeof timerStore.endDay === 'function') {
    timerStore.endDay()
  }
  closeProfileMenu()
}

const handleAvatarError = (event: Event) => {
  // Hide the image and show initials instead
  const img = event.target as HTMLImageElement
  if (img) {
    img.style.display = 'none'
  }
}

// Lifecycle
onMounted(async () => {
  // Mark as hydrated after component is mounted
  isHydrated.value = true

  // Load timer preferences - verificar que timerStore esté disponible
  if (timerStore && typeof timerStore.loadPreferences === 'function') {
    timerStore.loadPreferences()
  }
  if (timerStore && typeof timerStore.loadDaySummary === 'function') {
    timerStore.loadDaySummary()
  }


  // Close menus when route changes
  watch(
    () => route?.path,
    () => {
      closeMobileMenu()
      closeProfileMenu()
      closeNotifications()
    },
  )
})

// Close menus when clicking outside
onMounted(() => {
  const handleClickOutside = (event: Event) => {
    const target = event.target as Element
    if (!target.closest('nav')) {
      closeMobileMenu()
      closeProfileMenu()
      closeNotifications()
    }
  }

  document.addEventListener('click', handleClickOutside)

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})
</script>

<style scoped>
/* Smooth animations */
.transition-all {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Enhanced backdrop blur effect */
.backdrop-blur-md {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* Subtle gradients */
.bg-gradient-to-br {
  background: linear-gradient(135deg, var(--tw-gradient-stops));
}

/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Avatar styles */
.avatar-fallback {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 500;
  text-transform: uppercase;
}

/* Avatar image error handling */
.avatar-image {
  transition: opacity 0.2s ease;
}

.avatar-image[style*='display: none'] {
  opacity: 0;
}
</style>
