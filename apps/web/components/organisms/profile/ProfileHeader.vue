<template>
  <BaseCard class="mb-8">
    <div class="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
      <!-- Profile Picture Section -->
      <div class="relative">
        <div
          class="w-24 h-24 sm:w-32 sm:h-32 bg-primary-600 rounded-full flex items-center justify-center overflow-hidden">
          <img v-if="displayAvatar" :src="displayAvatar" :alt="userDisplayName" class="w-full h-full object-cover" />
          <span v-else class="text-white font-bold text-3xl sm:text-4xl">{{
            userInitials
            }}</span>
        </div>

        <!-- Change Photo Button -->
        <BaseButton v-if="!avatarChanged" @click="$emit('trigger-file-input')" variant="close" size="sm"
          class="absolute bottom-0 right-0 !p-2 rounded-full shadow-lg" :icon="Camera" icon-only
          title="Change profile picture" />

        <!-- Save/Cancel Buttons when avatar changed -->
        <div v-if="avatarChanged" class="absolute bottom-0 right-0 flex space-x-2">
          <BaseButton @click="$emit('save-profile')" :loading="saving" variant="success" size="sm"
            class="!px-3 !py-2 text-xs">
            {{ saving ? 'Saving...' : 'Save' }}
          </BaseButton>
          <BaseButton @click="$emit('cancel-avatar-change')" variant="secondary" size="sm" class="!px-3 !py-2 text-xs">
            Cancel
          </BaseButton>
        </div>
      </div>

      <!-- User Info -->
      <div class="text-center sm:text-left flex-1">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ userDisplayName || 'Loading...' }}
        </h2>
        <p class="text-gray-600 dark:text-gray-300">
          {{ userEmail || 'user@email.com' }}
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Member since {{ formatJoinDate() }}
        </p>

        <!-- Session Info -->
        <div class="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="flex items-center justify-center sm:justify-start space-x-4 text-sm">
            <div class="flex items-center space-x-2">
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
              <span class="text-gray-600 dark:text-gray-300">Active session</span>
            </div>
            <span class="text-gray-500 dark:text-gray-400">•</span>
            <span class="text-gray-600 dark:text-gray-300">Last access: {{ formatLastAccess() }}</span>
          </div>
        </div>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import BaseButton from '@ritmo/ui/components/atoms/interactive/BaseButton.vue'
import BaseCard from '@ritmo/ui/components/atoms/layout/BaseCard.vue'
import { Camera } from 'lucide-vue-next'

interface Props {
  userDisplayName: string
  userEmail: string
  userInitials: string
  displayAvatar: string
  avatarChanged: boolean
  saving: boolean
  formatJoinDate: () => string
  formatLastAccess: () => string
}

defineProps<Props>()

interface Emits {
  (e: 'trigger-file-input'): void
  (e: 'save-profile'): void
  (e: 'cancel-avatar-change'): void
}

defineEmits<Emits>()
</script>
