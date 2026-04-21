<template>
  <BaseNavbar :show-mobile-menu="showMobileMenu" aria-label="Main navigation">
    <!-- Logo -->
    <template #logo>
      <NuxtLink :to="ROUTES.DASHBOARD" aria-label="Go to Dashboard">
        <RitmoLogo :size="26" variant="monochrome" :interactive="true" aria-label="Ritmo Logo" />
      </NuxtLink>
    </template>

    <!-- Brand -->
    <template #brand>
      <NuxtLink :to="ROUTES.DASHBOARD" aria-label="Go to Dashboard">
        <span class="text-sm font-semibold tracking-tight text-content">Ritmo</span>
      </NuxtLink>
    </template>

    <!-- Primary nav -->
    <template #nav-items>
      <BaseNavItem
        v-for="item in primaryNavItems"
        :key="item.path"
        :path="item.path"
        :label="item.label"
        :icon="item.icon"
        :is-active="currentPath === item.path"
      />
    </template>

    <!-- Actions -->
    <template #actions>
      <!-- Notifications -->
      <div class="relative">
        <button
          @click="toggleNotifications"
          class="nav-icon-btn relative"
          aria-label="Notifications"
          :aria-expanded="showNotifications"
        >
          <Bell :size="17" />
          <span
            v-if="unreadCount > 0"
            class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-600 text-white text-[10px] rounded-full flex items-center justify-center font-medium leading-none"
            aria-label="`${unreadCount} unread notifications`"
          >
            {{ unreadCount > 9 ? '9+' : unreadCount }}
          </span>
        </button>

        <!-- Notifications dropdown -->
        <Transition name="dropdown">
          <div
            v-if="showNotifications"
            class="dropdown-panel w-80"
            role="dialog"
            aria-label="Notifications"
          >
            <div class="flex items-center justify-between px-4 py-3 border-b border-outline">
              <span class="text-xs font-semibold uppercase tracking-wider text-content-muted">Notifications</span>
              <button
                @click="closeNotifications"
                class="nav-icon-btn !w-6 !h-6"
                aria-label="Close notifications"
              >
                <X :size="14" />
              </button>
            </div>

            <div class="max-h-72 overflow-y-auto">
              <div v-if="notifications.length === 0" class="px-4 py-8 text-center">
                <p class="text-sm text-content-muted">No notifications</p>
              </div>

              <button
                v-for="notification in notifications"
                :key="notification.id"
                class="w-full text-left px-4 py-3 hover:bg-surface-raised transition-colors duration-150 border-b border-outline last:border-0 flex items-start gap-3"
                @click="markAsRead(notification.id)"
              >
                <span
                  class="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                  :class="notification.unread ? 'bg-primary-500' : 'bg-outline'"
                />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-content">{{ notification.title }}</p>
                  <p class="text-xs text-content-secondary mt-0.5 leading-relaxed">{{ notification.message }}</p>
                  <p class="text-xs text-content-muted mt-1">{{ notification.time }}</p>
                </div>
              </button>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Profile -->
      <div class="relative">
        <button
          @click="toggleProfileMenu"
          class="flex items-center justify-center w-8 h-8 rounded-full ring-2 ring-transparent hover:ring-outline-strong transition-all duration-150 focus-visible:outline-none focus-visible:ring-primary-500"
          aria-label="Profile menu"
          :aria-expanded="showProfileMenu"
        >
          <img
            v-if="isUserDataLoaded && isHydrated"
            :src="displayAvatar"
            :alt="userDisplayName"
            class="w-full h-full rounded-full object-cover"
            @error="handleAvatarError"
          />
          <div v-else class="w-full h-full rounded-full bg-outline animate-pulse" />
        </button>

        <!-- Profile dropdown -->
        <Transition name="dropdown">
          <div v-if="showProfileMenu" class="dropdown-panel w-56" role="dialog" aria-label="Profile menu">
            <!-- User info -->
            <div class="px-4 py-3 border-b border-outline">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    v-if="isUserDataLoaded && isHydrated"
                    :src="displayAvatar"
                    :alt="userDisplayName"
                    class="w-full h-full object-cover"
                    @error="handleAvatarError"
                  />
                  <div v-else class="w-full h-full bg-outline animate-pulse rounded-full" />
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-medium text-content truncate">
                    <span v-if="isUserDataLoaded && isHydrated">{{ userDisplayName }}</span>
                    <span v-else class="inline-block w-20 h-3.5 bg-outline animate-pulse rounded" />
                  </p>
                  <p class="text-xs text-content-muted truncate mt-0.5">
                    <span v-if="isUserDataLoaded && isHydrated">{{ userEmail }}</span>
                    <span v-else class="inline-block w-28 h-3 bg-outline animate-pulse rounded" />
                  </p>
                </div>
              </div>
            </div>

            <!-- Toggles -->
            <div class="py-1.5 border-b border-outline">
              <!-- Dark mode -->
              <div class="flex items-center justify-between px-4 py-2">
                <div class="flex items-center gap-2">
                  <Moon :size="13" class="text-content-muted" />
                  <span class="text-sm text-content-secondary">Dark mode</span>
                </div>
                <button
                  @click="toggleDarkMode"
                  class="toggle-switch"
                  :class="currentIsDark ? 'bg-primary-600' : 'bg-outline'"
                  :aria-label="currentIsDark ? 'Switch to light mode' : 'Switch to dark mode'"
                  role="switch"
                  :aria-checked="currentIsDark"
                >
                  <span class="toggle-thumb" :class="currentIsDark ? 'translate-x-5' : 'translate-x-0.5'" />
                </button>
              </div>

              <!-- Floating timer -->
              <div class="flex items-center justify-between px-4 py-2">
                <div class="flex items-center gap-2">
                  <Clock :size="13" class="text-content-muted" />
                  <span class="text-sm text-content-secondary">Floating timer</span>
                </div>
                <button
                  @click="toggleFloatingTimer"
                  class="toggle-switch"
                  :class="showFloatingTimer ? 'bg-primary-600' : 'bg-outline'"
                  :aria-label="showFloatingTimer ? 'Hide floating timer' : 'Show floating timer'"
                  role="switch"
                  :aria-checked="showFloatingTimer"
                >
                  <span class="toggle-thumb" :class="showFloatingTimer ? 'translate-x-5' : 'translate-x-0.5'" />
                </button>
              </div>
            </div>

            <!-- Nav links -->
            <div class="py-1.5 border-b border-outline">
              <NuxtLink
                v-for="link in profileLinks"
                :key="link.to"
                :to="link.to"
                class="profile-menu-item"
                @click="closeProfileMenu"
              >
                <component :is="link.icon" :size="14" class="text-content-muted" />
                <span>{{ link.label }}</span>
              </NuxtLink>
            </div>

            <!-- Destructive actions -->
            <div class="py-1.5">
              <button @click="handleEndDay" class="profile-menu-item text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 w-full">
                <Flag :size="14" />
                <span>End day</span>
              </button>
              <button @click="handleLogout" class="profile-menu-item text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full">
                <LogOut :size="14" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Mobile menu toggle -->
      <button
        @click="toggleMobileMenu"
        class="nav-icon-btn md:hidden"
        aria-label="Open navigation menu"
        :aria-expanded="showMobileMenu"
      >
        <Menu :size="17" />
      </button>
    </template>

    <!-- Mobile menu -->
    <template #mobile-menu>
      <div class="space-y-0.5">
        <NuxtLink
          v-for="item in allNavItems"
          :key="item.path"
          :to="item.path"
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
            currentPath === item.path
              ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 font-medium'
              : 'text-content-secondary hover:text-content hover:bg-surface-raised',
          ]"
          :aria-current="currentPath === item.path ? 'page' : undefined"
          @click="closeMobileMenu"
        >
          <component :is="item.icon" :size="16" />
          <span>{{ item.label }}</span>
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
  Clock,
  Compass,
  Flag,
  LogOut,
  Menu,
  Moon,
  Settings,
  User,
  X,
} from 'lucide-vue-next'
import { navigateTo, useRoute } from 'nuxt/app'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

interface NavItem {
  path: string
  label: string
  icon: any
}

const primaryNavItems: NavItem[] = [
  { path: ROUTES.TODAY,    label: 'Today',    icon: Calendar },
  { path: ROUTES.SCHEDULE, label: 'Schedule', icon: Clock    },
  { path: ROUTES.PROJECTS, label: 'Plans',    icon: Compass  },
]

const profileLinks = [
  { to: ROUTES.JOURNAL,   label: 'Journal',   icon: BookOpen  },
  { to: ROUTES.ANALYTICS, label: 'Analytics', icon: BarChart3 },
  { to: ROUTES.PROFILE,   label: 'Profile',   icon: User      },
  { to: ROUTES.SETTINGS,  label: 'Settings',  icon: Settings  },
]

const allNavItems = computed(() => primaryNavItems)

const emit = defineEmits<{
  'toggle-dark-mode': []
}>()

const route = useRoute()
const timerStore = useTimerStore()
const { logout } = useAuth()
const { userDisplayName, userEmail, displayAvatar, isUserDataLoaded } = useUserData()

const showMobileMenu   = ref(false)
const showProfileMenu  = ref(false)
const showNotifications = ref(false)
const isHydrated       = ref(false)

const notifications = ref([
  { id: 1, title: 'Task Reminder',         message: 'Complete your daily review',                        time: '2 min ago',  unread: true  },
  { id: 2, title: 'Focus Session Complete', message: 'Great job! You completed a 25-minute focus session', time: '15 min ago', unread: false },
])

const unreadCount    = computed(() => notifications.value.filter(n => n.unread).length)
const currentPath    = computed(() => route?.path || '/')
const showFloatingTimer = computed(() => timerStore?.showFloatingTimer || false)

const theme = useTheme({
  storageKey: 'theme',
  respectSystemPreference: true,
  enableTransitions: true,
  respectReducedMotion: true,
  enableApiSync: false,
  autoSyncOnChange: false,
})

const currentIsDark     = theme.isDark
const currentToggleTheme = theme.toggleTheme

const toggleDarkMode = () => {
  currentToggleTheme()
  emit('toggle-dark-mode')
}

const closeAll = () => {
  showMobileMenu.value    = false
  showProfileMenu.value   = false
  showNotifications.value = false
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
  if (showMobileMenu.value) { showProfileMenu.value = false; showNotifications.value = false }
}

const closeMobileMenu = () => { showMobileMenu.value = false }

const toggleProfileMenu = () => {
  showProfileMenu.value = !showProfileMenu.value
  if (showProfileMenu.value) { showMobileMenu.value = false; showNotifications.value = false }
}

const closeProfileMenu = () => { showProfileMenu.value = false }

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  if (showNotifications.value) { showMobileMenu.value = false; showProfileMenu.value = false }
}

const closeNotifications = () => { showNotifications.value = false }

const markAsRead = (id: number) => {
  const n = notifications.value.find(n => n.id === id)
  if (n) n.unread = false
}

const toggleFloatingTimer = () => {
  timerStore?.toggleFloatingTimer?.()
}

const handleLogout = async () => {
  try {
    await logout()
    closeProfileMenu()
  } catch {}
  await navigateTo('/auth/login', { replace: true })
}

const handleEndDay = () => {
  timerStore?.endDay?.()
  closeProfileMenu()
}

const handleAvatarError = (event: Event) => {
  const img = event.target as HTMLImageElement
  if (img) img.style.display = 'none'
}

onMounted(() => {
  isHydrated.value = true
  timerStore?.loadPreferences?.()
  timerStore?.loadDaySummary?.()

  watch(() => route?.path, closeAll)

  const onClickOutside = (e: Event) => {
    if (!(e.target as Element).closest('nav')) closeAll()
  }
  document.addEventListener('click', onClickOutside)
  onUnmounted(() => document.removeEventListener('click', onClickOutside))
})
</script>

<style scoped>
/* Icon button — shared minimal interactive state */
.nav-icon-btn {
  @apply flex items-center justify-center w-8 h-8 rounded-lg
         text-content-secondary hover:text-content hover:bg-surface-raised
         transition-colors duration-150
         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1
         cursor-pointer;
}

/* Dropdown panel */
.dropdown-panel {
  @apply absolute top-full right-0 mt-1.5
         bg-surface border border-outline rounded-xl
         shadow-sm overflow-hidden z-50;
}

/* Profile menu item */
.profile-menu-item {
  @apply flex items-center gap-2.5 px-4 py-2 text-sm text-content-secondary
         hover:text-content hover:bg-surface-raised
         transition-colors duration-150 cursor-pointer;
}

/* Toggle switch */
.toggle-switch {
  @apply relative inline-flex h-5 w-10 flex-shrink-0 items-center rounded-full
         transition-colors duration-150
         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1
         cursor-pointer;
}

.toggle-thumb {
  @apply inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm
         transition-transform duration-150;
}

/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 150ms ease, transform 150ms ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}
</style>
