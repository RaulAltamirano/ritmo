<template>
  <div class="min-h-screen bg-canvas">
    <!-- Main Content -->
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Header -->
      <PageHeader
        title="Profile"
        subtitle="Manage your account settings and personal information"
        class="mb-8"
        :breadcrumbs="breadcrumbs"
      />

      <!-- Profile Header -->
      <ProfileHeader
        :user-display-name="userDisplayName"
        :user-email="userEmail"
        :user-initials="userInitials"
        :display-avatar="displayAvatar"
        :avatar-changed="avatarChanged"
        :saving="saving"
        :format-join-date="formatJoinDate"
        :format-last-access="formatLastAccess"
        @trigger-file-input="triggerFileInput"
        @save-profile="saveProfile"
        @cancel-avatar-change="cancelAvatarChange"
      />

      <!-- Hidden file input -->
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleProfilePictureChange"
      />

      <!-- Settings Section -->
      <BaseCard>
        <div class="space-y-6">
          <!-- Username Editing Section -->
          <div>
            <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Edit Display Name
            </h4>
            <div class="bg-surface border border-outline rounded-lg p-4">
              <div class="flex items-center space-x-4">
                <div class="flex-1">
                  <BaseInput
                    v-model="editableUsername"
                    label="Display Name"
                    placeholder="Enter your display name"
                    @input="onUsernameChange"
                    helper-text="This is the name that will be displayed to other users"
                  />
                </div>
                <div v-if="usernameChanged" class="flex items-center space-x-2">
                  <BaseButton
                    @click="saveUsername"
                    :loading="savingUsername"
                    variant="primary"
                  >
                    {{ savingUsername ? 'Saving...' : 'Save' }}
                  </BaseButton>
                  <BaseButton @click="cancelUsernameEdit" variant="secondary">
                    Cancel
                  </BaseButton>
                </div>
              </div>
            </div>
          </div>

          <!-- User Information Display Section -->
          <div>
            <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Account Information
            </h4>
            <div class="bg-surface border border-outline rounded-lg p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Personal Information -->
                <div>
                  <h5
                    class="text-md font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-outline"
                  >
                    Personal Information
                  </h5>
                  <div class="space-y-3">
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-500 dark:text-gray-400"
                        >Full Name</label
                      >
                      <p class="text-sm text-gray-900 dark:text-white">
                        <ClientOnly>
                          {{ userDisplayName ?? 'Not provided' }}
                          <template #fallback>
                            <span
                              class="animate-pulse bg-gray-300 dark:bg-gray-600 rounded w-24 h-4"
                            ></span>
                          </template>
                        </ClientOnly>
                      </p>
                    </div>
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-500 dark:text-gray-400"
                        >Username</label
                      >
                      <p class="text-sm text-gray-900 dark:text-white">
                        <ClientOnly>
                          {{ userUsername ?? 'Not provided' }}
                          <template #fallback>
                            <span
                              class="animate-pulse bg-gray-300 dark:bg-gray-600 rounded w-20 h-4"
                            ></span>
                          </template>
                        </ClientOnly>
                      </p>
                    </div>
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-500 dark:text-gray-400"
                        >Email</label
                      >
                      <p class="text-sm text-gray-900 dark:text-white">
                        <ClientOnly>
                          {{ userEmail ?? 'Not provided' }}
                          <template #fallback>
                            <span
                              class="animate-pulse bg-gray-300 dark:bg-gray-600 rounded w-32 h-4"
                            ></span>
                          </template>
                        </ClientOnly>
                      </p>
                    </div>
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-500 dark:text-gray-400"
                        >Member Since</label
                      >
                      <p class="text-sm text-gray-900 dark:text-white">
                        <ClientOnly>
                          {{ formatJoinDate() }}
                          <template #fallback>
                            <span
                              class="animate-pulse bg-gray-300 dark:bg-gray-600 rounded w-20 h-4"
                            ></span>
                          </template>
                        </ClientOnly>
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Account Details -->
                <div>
                  <h5
                    class="text-md font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-outline"
                  >
                    Account Details
                  </h5>
                  <div class="space-y-3">
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-500 dark:text-gray-400"
                        >Account Status</label
                      >
                      <ClientOnly>
                        <BaseBadge
                          :variant="isUserActive ? 'success' : 'error'"
                          :content="isUserActive ? 'Active' : 'Inactive'"
                          :left-icon="isUserActive ? 'check' : 'alert'"
                          size="sm"
                        />
                        <template #fallback>
                          <span
                            class="animate-pulse bg-gray-300 dark:bg-gray-600 rounded w-16 h-6"
                          ></span>
                        </template>
                      </ClientOnly>
                    </div>
                    <div v-if="userTimezone">
                      <label
                        class="block text-sm font-medium text-gray-500 dark:text-gray-400"
                        >Timezone</label
                      >
                      <p class="text-sm text-gray-900 dark:text-white">
                        <ClientOnly>
                          {{ userTimezone }}
                          <template #fallback>
                            <span
                              class="animate-pulse bg-gray-300 dark:bg-gray-600 rounded w-24 h-4"
                            ></span>
                          </template>
                        </ClientOnly>
                      </p>
                    </div>
                    <div v-if="userTheme">
                      <label
                        class="block text-sm font-medium text-gray-500 dark:text-gray-400"
                        >Theme</label
                      >
                      <ClientOnly>
                        <BaseBadge
                          variant="subtle"
                          :content="userTheme"
                          size="sm"
                        />
                        <template #fallback>
                          <span
                            class="animate-pulse bg-gray-300 dark:bg-gray-600 rounded w-16 h-6"
                          ></span>
                        </template>
                      </ClientOnly>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Security & Account Management -->
          <SecuritySection
            @change-password="changePassword"
            @enable-two-factor="enableTwoFactor"
            @go-to-sessions="goToSessions"
          />

          <!-- All Your Friends Section -->
          <FriendsList :friends="friendsList" />

          <!-- Trophies Section -->
          <TrophiesList :trophies="trophiesList" />
        </div>
      </BaseCard>
    </main>
  </div>
</template>

<script setup lang="ts">
  import { navigateTo } from 'nuxt/app'
  import { onMounted, ref, watch } from 'vue'

  // UI Components
  import ClientOnly from '@ritmo/ui/components/atoms/display/ClientOnly.vue'
  import BaseBadge from '@ritmo/ui/components/atoms/feedback/BaseBadge.vue'
  import BaseInput from '@ritmo/ui/components/atoms/forms/BaseInput.vue'
  import BaseButton from '@ritmo/ui/components/atoms/interactive/BaseButton.vue'
  import BaseCard from '@ritmo/ui/components/atoms/layout/BaseCard.vue'
  import PageHeader from '@ritmo/ui/components/molecules/layout/PageHeader.vue'

  // Profile Components
  import FriendsList from '@/components/organisms/profile/FriendsList.vue'
  import ProfileHeader from '@/components/organisms/profile/ProfileHeader.vue'
  import SecuritySection from '@/components/organisms/profile/SecuritySection.vue'
  import TrophiesList from '@/components/organisms/profile/TrophiesList.vue'

  // Composables
  import { useAuth } from '@/composables/auth'
  import { useUserData } from '@/composables/shared'
  import { useBreadcrumbs } from '@/composables/shared/useBreadcrumbs'
  import { useNotify } from '@/composables/shared/useNotify'
  import { useAuthStore } from '@/stores/auth'
  import { sanitizeImageFile, sanitizeText } from '@/utils/sanitization.js'

  // Use the default layout
  definePageMeta({
    layout: 'default',
  })

  // Page meta
  useHead({
    title: 'Profile',
    meta: [
      {
        name: 'description',
        content: 'Manage your Ritmo account settings and personal information',
      },
    ],
  })

  // Navigation functions
  const goToLogin = async () => {
    await navigateTo('/auth/login')
  }

  const goToSessions = async () => {
    await navigateTo('/profile/sessions')
  }

  const { updateProfile } = useAuth()
  const authStore = useAuthStore()
  const { notifySuccess, notifyError, notifyInfo } = useNotify()

  // Breadcrumbs
  const { breadcrumbs } = useBreadcrumbs()
  const {
    userDisplayName,
    userInitials,
    userEmail,
    userUsername,
    userTimezone,
    userTheme,
    isUserActive,
    displayAvatar,
    formatJoinDate,
    formatLastAccess,
    isUserDataLoaded,
  } = useUserData()

  // Loading states
  const saving = ref(false)
  const isPageLoading = ref(true)
  const fileInput = ref<HTMLInputElement>()
  const localAvatar = ref('')

  // Note: Session management moved to SecuritySection component for lazy loading

  // Friends management
  const friendsList = ref([
    {
      id: 1,
      name: 'Alex Johnson',
      initials: 'AJ',
      status: 'Online',
      online: true,
    },
    {
      id: 2,
      name: 'Sarah Wilson',
      initials: 'SW',
      status: 'Last seen 2h ago',
      online: false,
    },
    {
      id: 3,
      name: 'Mike Chen',
      initials: 'MC',
      status: 'Online',
      online: true,
    },
    {
      id: 4,
      name: 'Emma Davis',
      initials: 'ED',
      status: 'Last seen 1d ago',
      online: false,
    },
    {
      id: 5,
      name: 'David Brown',
      initials: 'DB',
      status: 'Online',
      online: true,
    },
    {
      id: 6,
      name: 'Lisa Garcia',
      initials: 'LG',
      status: 'Last seen 3h ago',
      online: false,
    },
    {
      id: 7,
      name: 'John Smith',
      initials: 'JS',
      status: 'Online',
      online: true,
    },
    {
      id: 8,
      name: 'Maria Rodriguez',
      initials: 'MR',
      status: 'Last seen 5h ago',
      online: false,
    },
    {
      id: 9,
      name: 'Tom Anderson',
      initials: 'TA',
      status: 'Online',
      online: true,
    },
    {
      id: 10,
      name: 'Anna Taylor',
      initials: 'AT',
      status: 'Last seen 1h ago',
      online: false,
    },
  ])

  // Trophies and achievements
  const trophiesList = ref([
    {
      id: 1,
      name: 'First Steps',
      description: 'Complete your first task',
      earned: true,
    },
    {
      id: 2,
      name: 'Task Master',
      description: 'Complete 10 tasks',
      earned: true,
    },
    {
      id: 3,
      name: 'Speed Demon',
      description: 'Complete a task in under 5 minutes',
      earned: false,
    },
    {
      id: 4,
      name: 'Team Player',
      description: 'Work with 5 different friends',
      earned: true,
    },
    {
      id: 5,
      name: 'Night Owl',
      description: 'Complete tasks after midnight',
      earned: false,
    },
    {
      id: 6,
      name: 'Early Bird',
      description: 'Complete tasks before 6 AM',
      earned: false,
    },
    {
      id: 7,
      name: 'Streak Master',
      description: 'Complete tasks for 7 days straight',
      earned: true,
    },
    {
      id: 8,
      name: 'Perfectionist',
      description: 'Complete 50 tasks without errors',
      earned: false,
    },
    {
      id: 9,
      name: 'Social Butterfly',
      description: 'Make 20 friends',
      earned: true,
    },
    {
      id: 10,
      name: 'Explorer',
      description: 'Try 10 different task types',
      earned: false,
    },
    {
      id: 11,
      name: 'Achiever',
      description: 'Earn 25 trophies',
      earned: false,
    },
    {
      id: 12,
      name: 'Legend',
      description: 'Complete 1000 tasks',
      earned: false,
    },
  ])

  // Username editing state
  const editableUsername = ref('')
  const usernameChanged = ref(false)
  const savingUsername = ref(false)
  const avatarChanged = ref(false)

  // Initialize profile data
  onMounted(async () => {
    try {
      isPageLoading.value = true

      // Wait for user data to be available
      if (!isUserDataLoaded.value) {
        // Wait for auth to initialize
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      // If still no user data after waiting, redirect to login
      if (!isUserDataLoaded.value) {
        await goToLogin()
        return
      }

      // Initialize editable username safely
      editableUsername.value = userDisplayName.value ?? 'User'

      // Note: Sessions are now loaded lazily when needed
      // This improves initial page load performance

      isPageLoading.value = false
    } catch (error) {
      console.error('Error initializing profile:', error)
      await goToLogin()
    }
  })

  // User data watcher - safe null handling
  watch(
    [userDisplayName, isUserDataLoaded],
    ([newDisplayName, newIsLoaded]) => {
      if (newIsLoaded && newDisplayName) {
        editableUsername.value = newDisplayName
      }
    },
    { immediate: true },
  )

  // Note: Session management moved to SecuritySection component for lazy loading

  const triggerFileInput = () => {
    fileInput.value?.click()
  }

  const handleProfilePictureChange = async (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]

    if (!file) return

    try {
      // Sanitize and validate the image file
      const sanitizedFile = sanitizeImageFile(file)

      if (!sanitizedFile) {
        notifyError('Invalid or unsafe image file')
        return
      }

      // Here you would typically upload the image to your server
      // For now, we'll create a local URL
      const imageUrl = URL.createObjectURL(sanitizedFile)
      localAvatar.value = imageUrl
      avatarChanged.value = true

      // TODO: Upload to server and get permanent URL
    } catch (error) {
      console.error('Error uploading image:', error)
      notifyError('Error uploading image')
    }

    // Clear the input
    target.value = ''
  }

  const saveProfile = async () => {
    saving.value = true

    try {
      const result = await updateProfile({
        avatar: localAvatar.value,
      })

      if (result.success) {
        // Mark profile as not changed
        avatarChanged.value = false
        // Show success message
        notifySuccess('Profile picture updated successfully!')
      } else {
        notifyError('Error updating profile', result.error)
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      notifyError('Error saving profile')
    } finally {
      saving.value = false
    }
  }

  const changePassword = () => {
    // TODO: Implement password change modal or redirect
    notifyInfo('Password change function in development')
  }

  const enableTwoFactor = () => {
    notifyInfo(
      'Two-factor authentication',
      'Enable two-factor authentication function in development. This would guide you through setting up 2FA.',
    )
  }

  const cancelAvatarChange = () => {
    localAvatar.value = ''
    avatarChanged.value = false
    // Clear the file input
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }

  const onUsernameChange = () => {
    const currentName = userDisplayName.value ?? 'User'
    usernameChanged.value = editableUsername.value !== currentName
  }

  const saveUsername = async () => {
    savingUsername.value = true
    try {
      // Sanitize username before sending
      const sanitizedName = sanitizeText(editableUsername.value)

      if (!sanitizedName) {
        notifyError('Invalid username')
        return
      }

      // Split the name into firstName and lastName
      const nameParts = sanitizedName.split(' ')
      const firstName = nameParts[0] ?? ''
      const lastName = nameParts.slice(1).join(' ') ?? ''

      const result = await updateProfile({
        firstName,
        lastName,
      })

      if (result.success) {
        usernameChanged.value = false
      } else {
        notifyError('Error updating username', result.error)
      }
    } catch (error) {
      console.error('Error saving username:', error)
      notifyError('Error saving username')
    } finally {
      savingUsername.value = false
    }
  }

  const cancelUsernameEdit = () => {
    editableUsername.value = userDisplayName.value ?? 'User'
    usernameChanged.value = false
  }
</script>
