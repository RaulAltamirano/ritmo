<template>
  <div class="security-section">
    <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
      Security & Account Management
    </h4>
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      <!-- Password Management -->
      <BaseCard class="p-6">
        <div class="flex flex-col space-y-4">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div
                class="w-10 h-10 bg-surface-overlay rounded-full flex items-center justify-center flex-shrink-0"
              >
                <Lock class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <h5
                class="font-medium text-gray-900 dark:text-white text-sm sm:text-base"
              >
                Password
              </h5>
            </div>
            <BaseBadge variant="success" content="Secure" left-icon="check" size="sm" />
          </div>

          <!-- Action -->
          <BaseButton
            @click="$emit('change-password')"
            variant="primary"
            size="sm"
            class="w-full"
          >
            Change Password
          </BaseButton>
        </div>
      </BaseCard>

      <!-- Two-Factor Authentication -->
      <BaseCard class="p-6">
        <div class="flex flex-col space-y-4">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div
                class="w-10 h-10 bg-surface-overlay rounded-full flex items-center justify-center flex-shrink-0"
              >
                <Shield class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <h5
                class="font-medium text-gray-900 dark:text-white text-sm sm:text-base"
              >
                Two-Factor
              </h5>
            </div>
            <BaseBadge
              variant="warning"
              content="Disabled"
              left-icon="alert"
              size="sm"
            />
          </div>

          <!-- Action -->
          <BaseButton
            @click="$emit('enable-two-factor')"
            variant="primary"
            size="sm"
            class="w-full"
          >
            Enable 2FA
          </BaseButton>
        </div>
      </BaseCard>

      <!-- Session Management -->
      <BaseCard class="p-6">
        <div class="flex flex-col space-y-4">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div
                class="w-10 h-10 bg-surface-overlay rounded-full flex items-center justify-center flex-shrink-0"
              >
                <Monitor class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <h5
                class="font-medium text-gray-900 dark:text-white text-sm sm:text-base"
              >
                Sessions
              </h5>
            </div>
            <ClientOnly>
              <BaseBadge
                v-if="sessionsLoaded && !loadingSessions"
                variant="info"
                :content="`${sessionCount} Active`"
                left-icon="info"
                size="sm"
              />
              <BaseBadge
                v-else-if="!sessionsLoaded"
                variant="info"
                content="View Sessions"
                left-icon="info"
                size="sm"
              />
              <span
                v-else
                class="animate-pulse bg-gray-300 dark:bg-gray-600 rounded w-16 h-5"
              ></span>
            </ClientOnly>
          </div>

          <!-- Action -->
          <BaseButton
            @click="handleGoToSessions"
            variant="primary"
            size="sm"
            class="w-full"
          >
            Manage Sessions
          </BaseButton>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useAuthStore } from '@/stores/auth'
  import ClientOnly from '@ritmo/ui/components/atoms/display/ClientOnly.vue'
  import BaseBadge from '@ritmo/ui/components/atoms/feedback/BaseBadge.vue'
  import BaseButton from '@ritmo/ui/components/atoms/interactive/BaseButton.vue'
  import BaseCard from '@ritmo/ui/components/atoms/layout/BaseCard.vue'
  import { Lock, Monitor, Shield } from 'lucide-vue-next'
  import { ref } from 'vue'

  // Session management
  const sessionCount = ref(0)
  const loadingSessions = ref(false)
  const sessionsLoaded = ref(false)

  // Load sessions count only when user clicks on sessions
  const loadSessionsCount = async () => {
    if (sessionsLoaded.value) return // Don't load twice

    loadingSessions.value = true
    try {
      const authStore = useAuthStore()
      const result = await authStore.getActiveSessions()
      if (result.success && result.sessions) {
        sessionCount.value = result.sessions.length
      } else {
        sessionCount.value = 1 // Default to 1 for current session
      }
      sessionsLoaded.value = true
    } catch (error) {
      console.error('Error loading sessions count:', error)
      sessionCount.value = 1 // Default to 1 for current session
      sessionsLoaded.value = true
    } finally {
      loadingSessions.value = false
    }
  }

  // Load sessions when user clicks "Manage Sessions"
  const handleGoToSessions = async () => {
    await loadSessionsCount()
    emit('go-to-sessions')
  }

  interface Emits {
    (e: 'change-password'): void
    (e: 'enable-two-factor'): void
    (e: 'go-to-sessions'): void
  }

  const emit = defineEmits<Emits>()
</script>
