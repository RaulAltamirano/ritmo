<template>
  <div class="app-container">
    <!-- Global Loading Screen -->
    <LoadingScreen
      v-if="isLoading && loadingType === 'full'"
      :loading-text="loadingMessage"
      :show-progress="loadingProgress !== null"
      :progress="loadingProgress"
      variant="full"
    />

    <!-- Overlay Loading -->
    <LoadingScreen
      v-if="isLoading && loadingType === 'overlay'"
      :loading-text="loadingMessage"
      :show-progress="loadingProgress !== null"
      :progress="loadingProgress"
      variant="overlay"
    />

    <!-- Main App Content -->
    <div 
      v-show="!isLoading || loadingType === 'inline'"
      class="app-content"
      :class="{ 'opacity-0': isInitializing }"
    >
      <!-- Navigation -->
      <MainNavbar @toggle-dark-mode="toggleDarkMode" />
      
      <!-- Page Content -->
      <main class="main-content">
        <slot />
      </main>
    </div>

    <!-- Inline Loading -->
    <LoadingScreen
      v-if="isLoading && loadingType === 'inline'"
      :loading-text="loadingMessage"
      :show-progress="loadingProgress !== null"
      :progress="loadingProgress"
      variant="inline"
    />

    <!-- Timer flotante -->
    <FloatingTimer />

    <!-- Notificaciones -->
    <NotificationToast />

    <!-- Modal del resumen del día -->
    <DaySummaryModal 
      ref="daySummaryModalRef"
      @close="hideDaySummaryModal"
      @start-new-day="handleStartNewDay"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import MainNavbar from '../components/organisms/MainNavbar.vue'
import FloatingTimer from '../components/molecules/FloatingTimer.vue'
import DaySummaryModal from '../components/molecules/DaySummaryModal.vue'
import NotificationToast from '../components/molecules/NotificationToast.vue'
import LoadingScreen from '../components/atoms/LoadingScreen.vue'
import { useTimerStore } from '../stores/timer'
import { useDaySummaryModal } from '../composables/useDaySummaryModal'
import { useNotifications } from '../composables/useNotifications'
import { useLoading } from '../composables/useLoading'
import { useAuth } from '../composables/useAuth'

// Composables
const { isLoading, loadingMessage, loadingProgress, loadingType, showLoading, hideLoading } = useLoading()
const { initAuth, isAuthenticated } = useAuth()

// Meta tags por defecto
useHead({
  titleTemplate: '%s - Ritmo',
  meta: [
    { name: 'description', content: 'Tu agenda inteligente para maximizar la productividad' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { charset: 'utf-8' }
  ],
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/logo-ritmo.svg' }
  ]
})

// Stores y composables
const timerStore = useTimerStore()
const { showModal, hideModal, setModalRef } = useDaySummaryModal()
const { showNotification } = useNotifications()

// Referencias
const daySummaryModalRef = ref()

// Local state
const isInitializing = ref(true)
const isDark = ref(false)

// Initialize app
const initializeApp = async () => {
  try {
    showLoading({
      message: 'Initializing your workspace...',
      type: 'full',
      progress: 0
    })

    // Step 1: Check authentication
    updateLoadingProgress(20, 'Checking authentication...')
    await initAuth()

    // Step 2: Load user preferences
    updateLoadingProgress(40, 'Loading preferences...')
    await loadUserPreferences()

    // Step 3: Initialize theme
    updateLoadingProgress(60, 'Setting up theme...')
    initializeTheme()

    // Step 4: Load initial data
    updateLoadingProgress(80, 'Loading your data...')
    await loadInitialData()

    // Step 5: Complete initialization
    updateLoadingProgress(100, 'Ready!')
    await new Promise(resolve => setTimeout(resolve, 500)) // Brief pause to show completion

    hideLoading()
    isInitializing.value = false
  } catch (error) {
    console.error('App initialization failed:', error)
    hideLoading()
    isInitializing.value = false
  }
}

// Update loading progress with message
const updateLoadingProgress = (progress: number, message: string) => {
  // Simulate realistic loading times
  setTimeout(() => {
    showLoading({
      message,
      type: 'full',
      progress
    })
  }, 200)
}

// Load user preferences
const loadUserPreferences = async () => {
  // Simulate loading user preferences
  await new Promise(resolve => setTimeout(resolve, 300))
}

// Initialize theme
const initializeTheme = () => {
  // Check for saved theme preference or default to system
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDark.value = savedTheme === 'dark'
    document.documentElement.classList.toggle('dark', isDark.value)
  } else {
    // Check system preference
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDark.value = systemPrefersDark
    document.documentElement.classList.toggle('dark', systemPrefersDark)
  }
}

// Load initial data
const loadInitialData = async () => {
  // Simulate loading initial app data
  await new Promise(resolve => setTimeout(resolve, 400))
}

// Toggle dark mode
const toggleDarkMode = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

// Watch for route changes and show loading for protected routes
const route = useRoute()
watch(() => route.path, async (newPath, oldPath) => {
  if (oldPath && newPath !== oldPath) {
    // Show brief loading for route changes
    const isProtectedRoute = !['/login', '/register', '/'].includes(newPath)
    
    if (isProtectedRoute && isAuthenticated.value) {
      showLoading({
        message: 'Loading page...',
        type: 'overlay',
        key: 'route-change'
      })
      
      // Hide loading after a short delay
      setTimeout(() => {
        hideLoading('route-change')
      }, 300)
    }
  }
})

// Funciones del modal
const hideDaySummaryModal = () => {
  hideModal()
}

const handleStartNewDay = () => {
  timerStore.startDay()
}

// Lifecycle
onMounted(() => {
  initializeApp()
})

// Cleanup al desmontar
onUnmounted(() => {
  timerStore.cleanup()
  
  // Remover event listeners
  window.removeEventListener('show-notification', (() => {}) as EventListener)
  window.removeEventListener('show-day-summary', (() => {}) as EventListener)
})

// Exponer el estado del modo oscuro
provide('isDark', readonly(isDark))
provide('setIsDark', (value: boolean) => {
  isDark.value = value
  document.documentElement.classList.toggle('dark', value)
})
</script>

<style scoped>
.app-container {
  @apply min-h-screen bg-gray-50 dark:bg-gray-900;
}

.app-content {
  @apply transition-opacity duration-300 ease-in-out;
}

.main-content {
  @apply pt-16 min-h-screen;
}

/* Smooth transitions */
.opacity-0 {
  opacity: 0;
}

/* Prevent content flash during initialization */
.app-content:not(.opacity-0) {
  opacity: 1;
}
</style> 