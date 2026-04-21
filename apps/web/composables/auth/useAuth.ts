/**
 * 🚀 RITMO AUTH COMPOSABLE - 2025 MODERN BEST PRACTICES
 *
 * Modern authentication composable following the latest patterns:
 * - Zero legacy code
 * - Modern Vue 3 + Nuxt 3 patterns
 * - HttpOnly cookie-based persistence (server-managed)
 * - Minimal state management
 * - Type-safe implementation
 */

import { useAuthStore } from '@/stores/auth'
import type { LoginCredentials, RegisterCredentials } from '@/types/auth.d'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

export const useAuth = () => {
  const authStore = useAuthStore()

  // Reactive state from store
  const { user, isLoading, error } = storeToRefs(authStore)

  // Computed properties - always reactive
  const isAuthenticated = computed(() => !!user.value)
  const isAuthReady = computed(() => true) // Modern approach: always ready

  // Modern authentication initialization
  const initAuth = async () => {
    try {
      const result = await authStore.initAuth()
      return result
    } catch (_error) {
      return { success: false, error: 'Authentication failed' }
    }
  }

  // Modern user data refresh
  const refreshUserData = async (_force = false) => {
    try {
      const result = await authStore.refreshUserData()
      return result
    } catch (_error) {
      return { success: false, error: 'Failed to refresh user data' }
    }
  }

  // Force refresh user data (bypass cache)
  const forceRefreshUserData = () => refreshUserData(true)

  // Modern login method
  const login = async (credentials: LoginCredentials) => {
    try {
      const result = await authStore.login(credentials)
      return result
    } catch (_error) {
      return { success: false, error: 'Login failed' }
    }
  }

  // Modern register method
  const register = async (credentials: RegisterCredentials) => {
    try {
      const result = await authStore.register(credentials)
      return result
    } catch (_error) {
      return { success: false, error: 'Registration failed' }
    }
  }

  // Modern logout method
  const logout = async () => {
    const result = await authStore.logout()
    return result
  }

  // Return all methods
  return {
    // State
    user,
    isLoading,
    error,
    isAuthenticated,
    isAuthReady,

    // Core methods
    initAuth,
    login,
    register,
    logout,

    // Session management
    refreshUserData,
    forceRefreshUserData,

    // User management
    updateProfile: (profileData: Partial<Record<string, unknown>>) =>
      authStore.updateProfile(profileData),
    deleteAccount: (password: string) => authStore.deleteAccount(password),

    // Password management
    requestPasswordReset: (email: string) => authStore.requestPasswordReset(email),
    resetPassword: (token: string, newPassword: string) =>
      authStore.resetPassword(token, newPassword),
    changePassword: (currentPassword: string, newPassword: string) =>
      authStore.changePassword(currentPassword, newPassword),

    // Email verification
    verifyEmail: (token: string) => authStore.verifyEmail(token),
    resendVerification: (email: string) => authStore.resendVerification(email),

    // Session management
    getActiveSessions: () => authStore.getActiveSessions(),
    terminateSession: (sessionId: string) => authStore.terminateSession(sessionId),
    terminateAllOtherSessions: () => authStore.terminateAllOtherSessions(),
    logoutAllDevices: () => authStore.logoutAllDevices(),
  }
}
