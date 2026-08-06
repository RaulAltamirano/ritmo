<template>
  <BaseNavbar aria-label="Account">
    <template #logo>
      <NuxtLink
        :to="ROUTES.TODAY"
        class="text-gray-900 transition-opacity duration-200 hover:opacity-80 dark:text-white"
        aria-label="Go to Today"
      >
        <RitmoLogo
          :size="28"
          variant="monochrome"
          interactive
          aria-label="Ritmo Logo"
        />
      </NuxtLink>
    </template>

    <template #brand>
      <NuxtLink
        :to="ROUTES.TODAY"
        class="transition-opacity duration-200 hover:opacity-80"
        aria-label="Go to Today"
      >
        <h1
          class="text-[15px] font-semibold tracking-tight text-secondary-900 dark:text-secondary-50"
        >
          Ritmo
        </h1>
      </NuxtLink>
    </template>

    <template #actions>
      <NavbarNotifications
        :open="showNotifications"
        :notifications="notifications"
        @toggle="toggleNotifications"
        @close="closeNotifications"
        @mark-read="markAsRead"
      />

      <NavbarProfileMenu
        :open="showProfileMenu"
        :ready="isUserDataLoaded && isHydrated"
        :avatar="displayAvatar"
        :display-name="userDisplayName"
        :navbar-name="userNavbarName"
        :email="userEmail"
        :is-dark="currentIsDark"
        :floating-timer="showFloatingTimer"
        :profile-path="ROUTES.PROFILE"
        :settings-path="ROUTES.SETTINGS"
        @toggle="toggleProfileMenu"
        @close="closeProfileMenu"
        @toggle-theme="toggleDarkMode"
        @toggle-timer="toggleFloatingTimer"
        @end-day="handleEndDay"
        @logout="handleLogout"
        @avatar-error="handleAvatarError"
      />
    </template>
  </BaseNavbar>
</template>

<script setup lang="ts">
  import NavbarNotifications from '@/components/molecules/NavbarNotifications.vue'
  import NavbarProfileMenu from '@/components/molecules/NavbarProfileMenu.vue'
  import { useAuth } from '@/composables/auth'
  import { useUserData } from '@/composables/shared'
  import { useSessionGateStore } from '@/stores/sessionGate'
  import { useTimerStore } from '@/stores/timer'
  import { ROUTES } from '@/utils/routes'
  import RitmoLogo from '@ritmo/ui/components/atoms/display/RitmoLogo.vue'
  import BaseNavbar from '@ritmo/ui/components/organisms/navigation/BaseNavbar.vue'
  import { navigateTo, useNuxtApp, useRoute } from 'nuxt/app'
  import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

  const route = useRoute()
  const nuxtApp = useNuxtApp()
  const theme = nuxtApp.$theme
  const timerStore = useTimerStore()
  const sessionGate = useSessionGateStore()
  const { logout } = useAuth()
  const {
    userDisplayName,
    userEmail,
    displayAvatar,
    isUserDataLoaded,
    userNavbarName,
  } = useUserData()

  const showProfileMenu = ref(false)
  const showNotifications = ref(false)
  const isHydrated = ref(false)

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

  const showFloatingTimer = computed(() => timerStore?.showFloatingTimer ?? false)
  const currentIsDark = computed(() => theme?.isDark?.value ?? false)

  const toggleDarkMode = () => theme?.toggleTheme?.()
  const closeProfileMenu = () => {
    showProfileMenu.value = false
  }
  const closeNotifications = () => {
    showNotifications.value = false
  }

  const toggleProfileMenu = () => {
    showProfileMenu.value = !showProfileMenu.value
    if (showProfileMenu.value) showNotifications.value = false
  }

  const toggleNotifications = () => {
    showNotifications.value = !showNotifications.value
    if (showNotifications.value) showProfileMenu.value = false
  }

  const markAsRead = (notificationId: number) => {
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification) notification.unread = false
  }

  const toggleFloatingTimer = () => timerStore?.toggleFloatingTimer?.()

  const handleLogout = async () => {
    try {
      await logout()
      closeProfileMenu()
      await navigateTo('/auth/login', { replace: true })
    } catch {
      await navigateTo('/auth/login', { replace: true })
    }
  }

  const handleEndDay = () => {
    sessionGate.openEndDaySummary()
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

    watch(
      () => route?.path,
      () => {
        closeProfileMenu()
        closeNotifications()
      },
    )

    const handleClickOutside = (event: Event) => {
      const target = event.target as Element
      if (!target.closest('.ritmo-app-nav')) {
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
