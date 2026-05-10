<template>
  <div class="min-h-screen bg-canvas">
    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <!-- Page Header -->
      <PageHeader
        title="Session Management"
        subtitle="Manage your active sessions across all devices and browsers"
        class="mb-4 sm:mb-6"
        :breadcrumbs="breadcrumbs"
      >
        <template #actions>
          <BaseButton
            @click="goToProfile"
            variant="secondary"
            :icon="ArrowLeft"
            icon-position="left"
          >
            Back to Profile
          </BaseButton>
        </template>
      </PageHeader>

      <!-- Current Device Info Section -->
      <BaseCard variant="minimalist" class="mb-4 sm:mb-6">
        <template #header>
          <div class="flex items-center space-x-3 sm:space-x-4">
            <div
              class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-xl flex items-center justify-center flex-shrink-0"
            >
              <ClientIcon
                name="monitor"
                class="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400"
              />
            </div>
            <div class="min-w-0 flex-1">
              <h3
                class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white"
              >
                Your Current Device
              </h3>
              <p class="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">
                Information about your current session
              </p>
            </div>
          </div>
        </template>

        <!-- Device Info Grid -->
        <div
          class="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
        >
          <div
            class="bg-surface-raised/50 rounded-lg p-4 sm:p-5 hover:bg-surface-raised transition-colors duration-200"
          >
            <div class="flex items-center space-x-2 mb-3">
              <ClientIcon
                name="smartphone"
                class="w-4 h-4 text-gray-500 dark:text-gray-400"
              />
              <span
                class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide"
                >Device</span
              >
            </div>
            <p
              class="text-sm sm:text-base font-medium text-gray-900 dark:text-white leading-relaxed"
            >
              {{ currentDeviceFingerprint.deviceName }}
            </p>
          </div>

          <div
            class="bg-surface-raised/50 rounded-lg p-4 sm:p-5 hover:bg-surface-raised transition-colors duration-200"
          >
            <div class="flex items-center space-x-2 mb-3">
              <ClientIcon
                name="globe"
                class="w-4 h-4 text-gray-500 dark:text-gray-400"
              />
              <span
                class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide"
                >Browser</span
              >
            </div>
            <p
              class="text-sm sm:text-base font-medium text-gray-900 dark:text-white leading-relaxed"
            >
              {{ currentDeviceFingerprint.browser }}
            </p>
          </div>

          <div
            class="bg-surface-raised/50 rounded-lg p-4 sm:p-5 hover:bg-surface-raised transition-colors duration-200"
          >
            <div class="flex items-center space-x-2 mb-3">
              <ClientIcon name="cpu" class="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span
                class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide"
                >System</span
              >
            </div>
            <p
              class="text-sm sm:text-base font-medium text-gray-900 dark:text-white leading-relaxed"
            >
              {{ currentDeviceFingerprint.os }}
            </p>
          </div>

          <div
            class="bg-surface-raised/50 rounded-lg p-4 sm:p-5 hover:bg-surface-raised transition-colors duration-200"
          >
            <div class="flex items-center space-x-2 mb-3">
              <ClientIcon
                name="monitor"
                class="w-4 h-4 text-gray-500 dark:text-gray-400"
              />
              <span
                class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide"
                >Resolution</span
              >
            </div>
            <p
              class="text-sm sm:text-base font-medium text-gray-900 dark:text-white leading-relaxed"
            >
              {{ currentDeviceFingerprint.screenResolution }}
            </p>
          </div>
        </div>

        <!-- Additional Info -->
        <div class="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-outline">
          <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6"
          >
            <div class="flex items-center space-x-2 sm:space-x-3">
              <ClientIcon
                name="hash"
                class="w-4 h-4 text-gray-400 dark:text-gray-500"
              />
              <span class="text-sm sm:text-base text-gray-600 dark:text-gray-300"
                >Device ID:</span
              >
              <code
                class="bg-surface-overlay px-2 py-1 rounded text-xs sm:text-sm font-mono text-gray-800 dark:text-gray-200"
              >
                {{ currentDeviceFingerprint.deviceId.slice(0, 8) }}...
              </code>
            </div>
            <div class="flex items-center space-x-2 sm:space-x-3">
              <ClientIcon
                name="clock"
                class="w-4 h-4 text-gray-400 dark:text-gray-500"
              />
              <span class="text-sm sm:text-base text-gray-600 dark:text-gray-300">{{
                currentDeviceFingerprint.timezone
              }}</span>
            </div>
          </div>
        </div>

        <!-- Help Text -->
        <div
          class="mt-3 sm:mt-4 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
        >
          <div class="flex items-start space-x-3">
            <ClientIcon
              name="info"
              class="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0"
            />
            <p
              class="text-sm sm:text-base text-blue-700 dark:text-blue-300 leading-relaxed"
            >
              <strong>Tip:</strong> This information helps you identify which of the
              sessions listed below is your current device.
            </p>
          </div>
        </div>
      </BaseCard>

      <!-- Sessions List -->
      <BaseCard variant="minimalist">
        <template #header>
          <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div class="flex items-center space-x-3 sm:space-x-4">
              <div
                class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl flex items-center justify-center flex-shrink-0"
              >
                <ClientIcon
                  name="users"
                  class="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400"
                />
              </div>
              <div class="min-w-0 flex-1">
                <h3
                  class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white"
                >
                  Active Sessions
                </h3>
                <p class="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">
                  Manage your sessions across all devices
                </p>
              </div>
            </div>
            <div class="flex-shrink-0">
              <BaseButton
                @click="refreshSessions"
                :loading="loadingSessions"
                loading-variant="dots"
                variant="secondary"
                :icon="RefreshCw"
                icon-position="left"
                size="sm"
              >
                {{ loadingSessions ? 'Updating...' : 'Update' }}
              </BaseButton>
            </div>
          </div>
        </template>

        <!-- Loading State -->
        <div v-if="loadingSessions" class="mt-6 sm:mt-8">
          <SessionSkeleton :count="3" />
        </div>

        <!-- Empty State -->
        <div v-else-if="userSessions.length === 0" class="py-12 sm:py-16 text-center">
          <EmptyState
            title="No active sessions found"
            description="Your sessions will appear here when you log in from different devices"
            :icon="Monitor"
          />
        </div>

        <!-- Sessions Grid -->
        <div v-else class="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
          <div
            v-for="session in userSessions"
            :key="session.id"
            class="group relative bg-surface border border-outline rounded-xl p-4 sm:p-6 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200"
          >
            <div class="flex items-start justify-between gap-4">
              <!-- Device Info -->
              <div class="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                <div
                  class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center flex-shrink-0"
                >
                  <ClientIcon
                    name="monitor"
                    class="w-6 h-6 sm:w-7 sm:h-7 text-gray-600 dark:text-gray-300"
                  />
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex items-center space-x-2 sm:space-x-3 mb-2">
                    <h4
                      class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate"
                    >
                      {{ getDeviceName(session) }}
                    </h4>
                    <div
                      class="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                      :class="getStatusColor(session)"
                    ></div>
                  </div>

                  <p
                    class="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-3 sm:mb-4 leading-relaxed"
                  >
                    {{ getBrowserInfo(session) }}
                  </p>

                  <!-- Session Details Grid -->
                  <div
                    class="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm"
                  >
                    <div class="flex items-center space-x-1 sm:space-x-2">
                      <ClientIcon
                        name="map-pin"
                        class="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 dark:text-gray-500 flex-shrink-0"
                      />
                      <span class="text-gray-600 dark:text-gray-300 truncate">{{
                        getLocationInfo(session)
                      }}</span>
                    </div>
                    <div class="flex items-center space-x-1 sm:space-x-2">
                      <ClientIcon
                        name="clock"
                        class="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 dark:text-gray-500 flex-shrink-0"
                      />
                      <span class="text-gray-600 dark:text-gray-300">{{
                        formatLastAccess(session)
                      }}</span>
                    </div>
                    <div class="flex items-center space-x-1 sm:space-x-2">
                      <ClientIcon
                        name="activity"
                        class="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 dark:text-gray-500 flex-shrink-0"
                      />
                      <BaseBadge
                        :variant="getStatusBadgeVariant(session)"
                        :content="getStatusText(session)"
                        size="xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center flex-shrink-0">
                <BaseButton
                  v-if="!isCurrentSession(session)"
                  @click="openTerminateModal(session)"
                  variant="error"
                  size="sm"
                  :icon="X"
                  icon-only
                  title="Terminate session"
                />
                <BaseBadge v-else variant="success" content="Current" size="sm" />
              </div>
            </div>
          </div>
        </div>

        <!-- Sessions Summary -->
        <template #footer>
          <div
            v-if="userSessions.length > 0"
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 sm:pt-8 border-t border-outline"
          >
            <div class="flex items-center space-x-2 sm:space-x-3">
              <ClientIcon
                name="info"
                class="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500"
              />
              <span class="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                {{ userSessions.length }} active session{{
                  userSessions.length !== 1 ? 's' : ''
                }}
              </span>
            </div>
            <div
              class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4"
            >
              <!-- Test Toast Button -->
              <BaseButton
                @click="testToast"
                variant="info"
                size="sm"
                :icon="Bell"
                icon-position="left"
              >
                Test Toast
              </BaseButton>
              <BaseButton
                @click="openTerminateAllModal"
                variant="error"
                size="sm"
                :icon="LogOut"
                icon-position="left"
              >
                Terminate all others
              </BaseButton>
            </div>
          </div>
        </template>
      </BaseCard>
    </main>

    <!-- Modals -->
    <TerminateSessionModal
      :is-open="showTerminateModal"
      :session="selectedSession"
      :loading="loadingTerminate"
      @update:is-open="showTerminateModal = $event"
      @close="closeTerminateModal"
      @confirm="terminateSession"
    />

    <TerminateAllSessionsModal
      :is-open="showTerminateAllModal"
      :session-count="userSessions.filter(s => !isCurrentSession(s)).length"
      :loading="loadingTerminate"
      @update:is-open="showTerminateAllModal = $event"
      @close="closeTerminateAllModal"
      @confirm="terminateAllOtherSessions"
    />
  </div>
</template>

<script setup lang="ts">
  import { ArrowLeft, Bell, LogOut, Monitor, RefreshCw, X } from 'lucide-vue-next'
  import { onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'

  // UI Components
  import ClientIcon from '@ritmo/ui/components/atoms/display/ClientIcon.vue'
  import BaseBadge from '@ritmo/ui/components/atoms/feedback/BaseBadge.vue'
  import BaseButton from '@ritmo/ui/components/atoms/interactive/BaseButton.vue'
  import BaseCard from '@ritmo/ui/components/atoms/layout/BaseCard.vue'
  import EmptyState from '@ritmo/ui/components/molecules/feedback/EmptyState.vue'
  import SessionSkeleton from '@ritmo/ui/components/molecules/feedback/SessionSkeleton.vue'
  import PageHeader from '@ritmo/ui/components/molecules/layout/PageHeader.vue'

  // Modal Components
  import TerminateAllSessionsModal from '@/components/TerminateAllSessionsModal.vue'
  import TerminateSessionModal from '@/components/TerminateSessionModal.vue'

  // Composables
  import { useAuth } from '@/composables/auth'
  import { useBreadcrumbs } from '@/composables/shared/useBreadcrumbs'
  import type { UserSession } from '@/types/session'
  import {
    getCurrentDeviceFingerprint,
    type DeviceFingerprint,
  } from '@/utils/deviceFingerprint.js'
  import { useGlobalToast } from '@ritmo/ui'

  // Use the default layout
  definePageMeta({
    layout: 'default',
  })

  // Page meta
  useHead({
    title: 'Session Management - Ritmo',
    meta: [
      {
        name: 'description',
        content: 'Manage your active sessions across all devices and browsers',
      },
    ],
  })

  const router = useRouter()
  const {
    user,
    getActiveSessions,
    logoutAllDevices,
    terminateSession: terminateSessionAPI,
  } = useAuth()

  // Breadcrumbs
  const { breadcrumbs } = useBreadcrumbs()

  // Toast notifications
  const { showToast } = useGlobalToast()

  // Loading states
  const loadingSessions = ref(false)
  const loadingTerminate = ref(false)

  // Session management
  const userSessions = ref<UserSession[]>([])

  // Modal states
  const showTerminateModal = ref(false)
  const showTerminateAllModal = ref(false)
  const selectedSession = ref<UserSession | null>(null)

  // Current device fingerprint
  const currentDeviceFingerprint = ref<DeviceFingerprint>({
    deviceId: '',
    deviceName: '',
    deviceType: 'desktop',
    browser: '',
    browserVersion: '',
    os: '',
    osVersion: '',
    screenResolution: '',
    colorDepth: 0,
    pixelRatio: 1,
    timezone: '',
    language: '',
    userAgent: '',
    hardwareConcurrency: 0,
    deviceMemory: undefined,
    isBot: false,
    isVM: false,
    entropyScore: 0,
    timestamp: 0,
    version: '',
  })

  // Navigation functions
  const goToProfile = async () => {
    await router.push('/profile')
  }

  // Initialize device info function (called once on mount)
  const initializeDeviceInfo = async () => {
    const result = await getCurrentDeviceFingerprint()
    currentDeviceFingerprint.value = {
      deviceId: result.deviceId,
      deviceName: result.deviceInfo.deviceName,
      deviceType: result.deviceInfo.deviceType,
      browser: result.deviceInfo.browser,
      browserVersion: result.deviceInfo.browserVersion,
      os: result.deviceInfo.os,
      osVersion: result.deviceInfo.osVersion,
      screenResolution: result.deviceInfo.screenResolution,
      colorDepth: result.deviceInfo.colorDepth,
      pixelRatio: result.deviceInfo.pixelRatio,
      timezone: result.deviceInfo.timezone,
      language: result.deviceInfo.language,
      userAgent: result.deviceInfo.userAgent,
      hardwareConcurrency: result.deviceInfo.hardwareConcurrency,
      deviceMemory: result.deviceInfo.deviceMemory,
      isBot: result.deviceInfo.isBot,
      isVM: result.deviceInfo.isVM,
      entropyScore: result.deviceInfo.entropyScore,
      timestamp: result.deviceInfo.timestamp,
      version: result.deviceInfo.version,
    }
  }

  // Note: sessionDuration computed removed as it's not used in the new design

  // Initialize page and fetch sessions
  onMounted(async () => {
    try {
      // Initialize device fingerprint
      await initializeDeviceInfo()

      // Check if user is already available
      if (!user.value) {
        // Wait a bit for the store to update
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // If still no user after initAuth, redirect to login
      if (!user.value) {
        await router.push('/auth/login')
        return
      }

      // Fetch user sessions
      await fetchUserSessions()
    } catch (error) {
      console.error('Error initializing sessions page:', error)
      await router.push('/auth/login')
    }
  })

  const fetchUserSessions = async () => {
    loadingSessions.value = true
    try {
      const result = await getActiveSessions()
      if (result.success && result.sessions) {
        userSessions.value = result.sessions
      } else {
        userSessions.value = []
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
      userSessions.value = []
    } finally {
      loadingSessions.value = false
    }
  }

  const refreshSessions = async () => {
    await fetchUserSessions()
  }

  // Session helper functions
  const getDeviceName = (session: UserSession): string => {
    if (session.deviceName) return session.deviceName
    if (session.deviceType) return session.deviceType
    return 'Unknown Device'
  }

  const getBrowserInfo = (session: UserSession): string => {
    if (session.browser && session.os) {
      return `${session.browser} on ${session.os}`
    }
    if (session.browser) return session.browser
    if (session.os) return session.os
    return 'Unknown Browser'
  }

  const getLocationInfo = (session: UserSession): string => {
    if (session.ipAddress) {
      return session.ipAddress
    }
    return 'Unknown Location'
  }

  const formatLastAccess = (session: UserSession): string => {
    if (session.lastActivity) {
      const date = new Date(session.lastActivity)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / (1000 * 60))

      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
      return date.toLocaleDateString()
    }
    return 'Unknown'
  }

  const getStatusColor = (session: UserSession): string => {
    if (isCurrentSession(session)) return 'bg-green-500'
    if (session.expiresAt && new Date(session.expiresAt) < new Date())
      return 'bg-red-500'
    return 'bg-blue-500'
  }

  const getStatusBadgeVariant = (
    session: UserSession,
  ): 'success' | 'error' | 'info' => {
    if (isCurrentSession(session)) return 'success'
    if (session.expiresAt && new Date(session.expiresAt) < new Date()) return 'error'
    return 'info'
  }

  const getStatusText = (session: UserSession): string => {
    if (isCurrentSession(session)) return 'Active'
    if (session.expiresAt && new Date(session.expiresAt) < new Date()) return 'Expired'
    return 'Active'
  }

  const isCurrentSession = (session: UserSession): boolean => {
    // Compare with the current device fingerprint
    if (session.deviceType && session.browser && session.os) {
      const deviceMatch =
        session.deviceType === currentDeviceFingerprint.value.deviceType &&
        session.browser === currentDeviceFingerprint.value.browser &&
        session.os === currentDeviceFingerprint.value.os

      if (deviceMatch) return true
    }

    // Fallback: check if it's the most recent session
    if (userSessions.value.length > 0) {
      const mostRecentSession = userSessions.value[0] // Sessions are ordered by lastActivity desc
      return session.id === mostRecentSession.id
    }

    return false
  }

  const openTerminateModal = (session: UserSession) => {
    selectedSession.value = session
    showTerminateModal.value = true
  }

  const closeTerminateModal = () => {
    showTerminateModal.value = false
    selectedSession.value = null
  }

  const terminateSession = async (sessionId: string) => {
    loadingTerminate.value = true
    try {
      const result = await terminateSessionAPI(sessionId)
      if (result.success) {
        // Remove from local list
        userSessions.value = userSessions.value.filter(s => s.id !== sessionId)
        // Close modal
        closeTerminateModal()
        // Show success toast
        showToast({
          variant: 'success',
          title: 'Session Terminated',
          message: 'The session has been successfully terminated.',
          size: 'md',
          showIcon: true,
          autoDismiss: true,
          dismissDelay: 4000,
        })
      } else {
        showToast({
          variant: 'error',
          title: 'Termination Failed',
          message: result.error ?? 'Failed to terminate session. Please try again.',
          size: 'md',
          showIcon: true,
          autoDismiss: true,
          dismissDelay: 6000,
        })
      }
    } catch (error) {
      console.error('Error terminating session:', error)
      showToast({
        variant: 'error',
        title: 'Error',
        message: 'An unexpected error occurred while terminating the session.',
        size: 'md',
        showIcon: true,
        autoDismiss: true,
        dismissDelay: 6000,
      })
    } finally {
      loadingTerminate.value = false
    }
  }

  const openTerminateAllModal = () => {
    showTerminateAllModal.value = true
  }

  const closeTerminateAllModal = () => {
    showTerminateAllModal.value = false
  }

  const terminateAllOtherSessions = async () => {
    loadingTerminate.value = true
    try {
      const result = await logoutAllDevices()
      if (result.success) {
        // Close modal
        closeTerminateAllModal()
        // Show success toast
        showToast({
          variant: 'success',
          title: 'Sessions Terminated',
          message: 'All other sessions have been successfully terminated.',
          size: 'md',
          showIcon: true,
          autoDismiss: true,
          dismissDelay: 4000,
        })
        // Refresh sessions list
        await fetchUserSessions()
      } else {
        showToast({
          variant: 'error',
          title: 'Termination Failed',
          message:
            result.error ?? 'Failed to terminate other sessions. Please try again.',
          size: 'md',
          showIcon: true,
          autoDismiss: true,
          dismissDelay: 6000,
        })
      }
    } catch (error) {
      console.error('Error terminating all sessions:', error)
      showToast({
        variant: 'error',
        title: 'Error',
        message: 'An unexpected error occurred while terminating sessions.',
        size: 'md',
        showIcon: true,
        autoDismiss: true,
        dismissDelay: 6000,
      })
    } finally {
      loadingTerminate.value = false
    }
  }

  // Test toast function
  const testToast = () => {
    showToast({
      variant: 'success',
      title: 'Toast Test',
      message:
        'This is a test toast notification to verify the system is working correctly.',
      size: 'md',
      showIcon: true,
      autoDismiss: true,
      dismissDelay: 4000,
    })
  }
</script>
