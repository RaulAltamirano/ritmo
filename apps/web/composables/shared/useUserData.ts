/**
 * 🚀 RITMO USER DATA COMPOSABLE - 2025 MODERN BEST PRACTICES
 *
 * Unified user data management following latest patterns:
 * - Single source of truth for user information
 * - Computed properties for derived data
 * - Fallback handling for missing data
 * - Reactive updates across components
 */

import { computed } from 'vue'
import { useAuth } from '../auth/useAuth'

export const useUserData = () => {
  const { user, isAuthenticated } = useAuth()

  // ✅ UNIFIED USER DATA: Single source of truth
  const userData = computed(() => user.value ?? null)

  // ✅ USER IDENTITY: Core user information
  const userId = computed(() => user.value?.id ?? null)
  const userEmail = computed(() => user.value?.email ?? '')
  const userName = computed(() => user.value?.name ?? '')
  const userUsername = computed(() => user.value?.username ?? '')
  const userFirstName = computed(() => user.value?.firstName ?? '')
  const userLastName = computed(() => user.value?.lastName ?? '')

  // ✅ USER AVATAR: With intelligent fallback
  const userAvatar = computed(() => {
    if (user.value?.avatar) {
      return user.value.avatar
    }
    return null
  })

  // ✅ DISPLAY AVATAR: Always returns a valid avatar URL
  const displayAvatar = computed(() => {
    // If user has custom avatar, use it
    if (userAvatar.value) {
      return userAvatar.value
    }

    // Generate initials-based avatar as fallback
    const initials = getUserInitials()
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(initials)}&backgroundColor=667eea,764ba2&textColor=ffffff`
  })

  // ✅ USER DISPLAY NAME: Smart name resolution (for dropdowns, profiles, etc.)
  const userDisplayName = computed(() => {
    if (!user.value) return 'User'

    // Priority 1: Full name (firstName + lastName)
    if (userFirstName.value && userLastName.value) {
      return `${userFirstName.value} ${userLastName.value}`
    }

    // Priority 2: Single name field
    if (userName.value) {
      return userName.value
    }

    // Priority 3: Username
    if (userUsername.value) {
      return userUsername.value
    }

    // Priority 4: Email prefix
    if (userEmail.value) {
      return userEmail.value.split('@')[0]
    }

    return 'User'
  })

  // ✅ USER NAVBAR NAME: Always show username only (for navbar display)
  const userNavbarName = computed(() => {
    return userUsername.value ?? 'User'
  })

  // ✅ USER INITIALS: For avatar fallback
  const userInitials = computed(() => {
    if (!user.value) return 'U'

    // Try firstName + lastName
    if (userFirstName.value && userLastName.value) {
      return `${userFirstName.value[0]}${userLastName.value[0]}`.toUpperCase()
    }

    // Try single name
    if (userName.value) {
      return userName.value
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
    }

    // Try username
    if (userUsername.value) {
      return userUsername.value[0].toUpperCase()
    }

    // Try email
    if (userEmail.value) {
      return userEmail.value[0].toUpperCase()
    }

    return 'U'
  })

  // ✅ USER STATUS: Account information
  const isUserActive = computed(() => user.value?.isActive ?? false)
  const isEmailVerified = computed(() => user.value?.isEmailVerified ?? false)
  const userCreatedAt = computed(() => user.value?.createdAt ?? null)
  const userTimezone = computed(() => user.value?.timezone ?? 'UTC')

  // ✅ USER PREFERENCES: Settings and configuration
  const userTheme = computed(() => user.value?.preferences?.theme ?? 'system')
  const userLanguage = computed(() => user.value?.language ?? 'en')

  // ✅ LOADING STATE: User data availability
  const isUserDataLoaded = computed(() => {
    const hasData = !!(user.value?.id && user.value?.email)
    return hasData
  })

  // ✅ HELPER FUNCTIONS
  const getUserInitials = (): string => {
    return userInitials.value
  }

  const getUserFullName = (): string => {
    if (userFirstName.value && userLastName.value) {
      return `${userFirstName.value} ${userLastName.value}`
    }
    return userName.value ?? userUsername.value ?? 'User'
  }

  const getUserEmailPrefix = (): string => {
    return userEmail.value ? userEmail.value.split('@')[0] : 'User'
  }

  const hasUserAvatar = (): boolean => {
    return !!userAvatar.value
  }

  // ✅ FORMATTING HELPERS
  const formatJoinDate = (): string => {
    if (!userCreatedAt.value) return 'Recently'

    return new Date(userCreatedAt.value).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    })
  }

  const formatLastAccess = (): string => {
    return new Date().toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    })
  }

  return {
    // Core user data
    userData,
    userId,
    userEmail,
    userName,
    userUsername,
    userFirstName,
    userLastName,

    // Avatar and display
    userAvatar,
    displayAvatar,
    userDisplayName,
    userNavbarName,
    userInitials,

    // Status and preferences
    isUserActive,
    isEmailVerified,
    userCreatedAt,
    userTimezone,
    userTheme,
    userLanguage,

    // State
    isUserDataLoaded,
    isAuthenticated,

    // Helper functions
    getUserInitials,
    getUserFullName,
    getUserEmailPrefix,
    hasUserAvatar,
    formatJoinDate,
    formatLastAccess,
  }
}
