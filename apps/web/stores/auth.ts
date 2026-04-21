/**
 * 🚀 RITMO AUTH STORE - 2025 MODERN BEST PRACTICES
 *
 * Ultra-clean authentication store following latest patterns:
 * - Zero legacy code
 * - Minimal state management
 * - Modern error handling
 * - Type-safe implementation
 * - Single responsibility principle
 */

import { useAuthAPI } from '@/composables/auth'
import type { AuthUser, LoginCredentials, RegisterCredentials } from '@/types/auth.d'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // Minimal state - only essential data
  const user = ref<AuthUser | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // API instance
  const authAPI = useAuthAPI()

  // Computed properties - reactive and efficient
  const isAuthenticated = computed(() => !!user.value)

  // Core actions - simple and focused
  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const setError = (errorMessage: string | null) => {
    error.value = errorMessage
  }

  const clearError = () => {
    error.value = null
  }

  const setUser = (userData: AuthUser | null) => {
    user.value = userData
    error.value = null
  }

  const clearAuth = () => {
    user.value = null
    error.value = null
    isLoading.value = false
  }

  // Standardized error handling
  const handleError = (
    error: any,
    defaultMessage: string,
  ): { success: false; error: string } => {
    const errorMessage = error?.userMessage || error?.message || defaultMessage
    setError(errorMessage)
    return { success: false, error: errorMessage }
  }

  // Authentication methods - clean and focused
  const login = async (
    credentials: LoginCredentials,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true)
      clearError()

      const response = await authAPI.login(credentials)

      if (response.success && response.data) {
        // Extract user data from response structure
        const userData = response.data.user || response.data

        // Set user data from login response (single call)
        setUser(userData)

        // Initialize token manager for proactive refresh
        if (process.client) {
          const { useTokenManager } = await import(
            '../composables/auth/useTokenManager'
          )
          const tokenManager = useTokenManager()
          tokenManager.initializeTokens()
        }

        return { success: true }
      } else {
        return handleError(null, 'Login failed - invalid response')
      }
    } catch (error: any) {
      return handleError(error, 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const register = async (
    userData: RegisterCredentials,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true)
      clearError()

      // Use userData directly without conversions
      const response = await authAPI.register(userData)

      if (response.success && response.data) {
        // Extract user data from response structure
        const userData = response.data.user || response.data

        // Set user data from register response (single call)
        setUser(userData)

        // Initialize token manager for proactive refresh
        if (process.client) {
          const { useTokenManager } = await import(
            '../composables/auth/useTokenManager'
          )
          const tokenManager = useTokenManager()
          tokenManager.initializeTokens()
        }

        return { success: true }
      } else {
        return handleError(null, 'Registration failed - invalid response')
      }
    } catch (error: any) {
      return handleError(error, 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const logout = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true)
      clearError()

      // Call logout API
      const response = await authAPI.logout()

      if (response.success) {
        // Clear local state
        clearAuth()

        // Clear token manager state
        if (process.client) {
          const { useTokenManager } = await import(
            '../composables/auth/useTokenManager'
          )
          const tokenManager = useTokenManager()
          tokenManager.clearTokens()
        }

        return { success: true }
      } else {
        // Even if API fails, clear local state for security
        clearAuth()

        // Clear token manager state
        if (process.client) {
          const { useTokenManager } = await import(
            '../composables/auth/useTokenManager'
          )
          const tokenManager = useTokenManager()
          tokenManager.clearTokens()
        }

        return { success: true }
      }
    } catch (error: any) {
      // Even if API fails, clear local state for security
      clearAuth()

      // Clear token manager state
      if (process.client) {
        const { useTokenManager } = await import('../composables/auth/useTokenManager')
        const tokenManager = useTokenManager()
        tokenManager.clearTokens()
      }

      const errorMessage = error?.userMessage || error?.message || 'Logout failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const refreshUserData = async (): Promise<{
    success: boolean
    user?: AuthUser
    error?: string
  }> => {
    try {
      // Use the auth API for /users/me endpoint
      // The authenticated HTTP client will handle 401 errors automatically
      const response = await authAPI.verifyAuthentication()

      if (response.success && response.data) {
        // Extract user data from response structure
        const userData = response.data.user || response.data

        setUser(userData)
        return { success: true, user: userData }
      } else {
        setUser(null)
        return { success: false, error: 'Failed to refresh user data' }
      }
    } catch (error: any) {
      // Check if this is an authentication error that requires token refresh
      if (error?.code === 'UNAUTHORIZED' || error?.status === 401) {
        try {
          // Attempt token refresh
          const { useTokenManager } = await import(
            '../composables/auth/useTokenManager'
          )
          const tokenManager = useTokenManager()
          const refreshSuccess = await tokenManager.silentRefresh()

          if (refreshSuccess) {
            // Retry the verification after successful refresh
            const retryResponse = await authAPI.verifyAuthentication()
            if (retryResponse.success && retryResponse.data) {
              const userData = retryResponse.data.user || retryResponse.data
              setUser(userData)
              return { success: true, user: userData }
            }
          }
        } catch (refreshError) {
          console.warn('Token refresh failed:', refreshError)
        }
      }

      // If we get here, the refresh failed or it wasn't an auth error
      setUser(null)
      const errorMessage =
        error?.userMessage || error?.message || 'Failed to refresh user data'
      return { success: false, error: errorMessage }
    }
  }

  // Initialize authentication - clean and simple
  const initAuth = async (): Promise<{
    success: boolean
    shouldRedirect?: boolean
  }> => {
    try {
      const result = await refreshUserData()

      if (result.success) {
        return { success: true }
      } else {
        return { success: false, shouldRedirect: true }
      }
    } catch (error: any) {
      return { success: false, shouldRedirect: false }
    }
  }

  // Basic user management methods
  const updateProfile = async (
    profileData: Partial<AuthUser>,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true)
      clearError()

      // Use the auth API for profile update
      const response = await authAPI.updateProfile(profileData)

      if (response.success && response.data) {
        const userData = response.data.user || response.data
        setUser(userData)
        return { success: true }
      } else {
        return handleError(null, 'Profile update failed - invalid response')
      }
    } catch (error: any) {
      return handleError(error, 'Profile update failed')
    } finally {
      setLoading(false)
    }
  }

  const deleteAccount = async (
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true)
      clearError()

      // Use the auth API for account deletion
      const response = await authAPI.deleteAccount(password)

      if (response.success) {
        clearAuth()
        return { success: true }
      } else {
        return handleError(null, 'Account deletion failed - invalid response')
      }
    } catch (error: any) {
      return handleError(error, 'Account deletion failed')
    } finally {
      setLoading(false)
    }
  }

  const requestPasswordReset = async (
    email: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true)
      clearError()

      // Use the auth API for password reset request
      const response = await authAPI.requestPasswordReset(email)

      if (response.success) {
        return { success: true }
      } else {
        return handleError(null, 'Password reset request failed - invalid response')
      }
    } catch (error: any) {
      return handleError(error, 'Password reset request failed')
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (
    token: string,
    newPassword: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true)
      clearError()

      // Use the auth API for password reset
      const response = await authAPI.resetPassword(token, newPassword)

      if (response.success) {
        return { success: true }
      } else {
        return handleError(null, 'Password reset failed - invalid response')
      }
    } catch (error: any) {
      return handleError(error, 'Password reset failed')
    } finally {
      setLoading(false)
    }
  }

  const verifyEmail = async (
    token: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true)
      clearError()

      // Use the auth API for email verification
      const response = await authAPI.verifyEmail(token)

      if (response.success) {
        return { success: true }
      } else {
        return handleError(null, 'Email verification failed - invalid response')
      }
    } catch (error: any) {
      return handleError(error, 'Email verification failed')
    } finally {
      setLoading(false)
    }
  }

  const resendVerification = async (
    email: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true)
      clearError()

      // Use the auth API for verification resend
      const response = await authAPI.resendVerification(email)

      if (response.success) {
        return { success: true }
      } else {
        return handleError(null, 'Verification resend failed - invalid response')
      }
    } catch (error: any) {
      return handleError(error, 'Verification resend failed')
    } finally {
      setLoading(false)
    }
  }

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true)
      clearError()

      // Use the auth API for password change
      const response = await authAPI.changePassword(currentPassword, newPassword)

      if (response.success) {
        return { success: true }
      } else {
        return handleError(null, 'Password change failed - invalid response')
      }
    } catch (error: any) {
      return handleError(error, 'Password change failed')
    } finally {
      setLoading(false)
    }
  }

  const getActiveSessions = async (): Promise<{
    success: boolean
    sessions?: any[]
    error?: string
  }> => {
    try {
      setLoading(true)
      clearError()

      // Use the auth API for real session data
      const response = await authAPI.getSessions()

      if (response.success && response.data) {
        const sessions = response.data.sessions || []
        return { success: true, sessions }
      } else {
        setError('Failed to get active sessions')
        return { success: false, error: 'Failed to get active sessions' }
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to get active sessions'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const terminateSession = async (
    sessionId: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true)
      clearError()

      // Use the auth API to terminate session
      const response = await authAPI.terminateSession(sessionId)

      if (response.success) {
        return { success: true }
      } else {
        setError('Failed to terminate session')
        return { success: false, error: 'Failed to terminate session' }
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to terminate session'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const terminateAllOtherSessions = async (): Promise<{
    success: boolean
    error?: string
  }> => {
    try {
      setLoading(true)
      clearError()

      // Use the auth API to logout from all devices
      const response = await authAPI.logoutAllDevices()

      if (response.success) {
        return { success: true }
      } else {
        setError('Failed to terminate other sessions')
        return { success: false, error: 'Failed to terminate other sessions' }
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to terminate other sessions'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const logoutAllDevices = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true)
      clearError()

      // Use the auth API to logout from all devices
      const response = await authAPI.logoutAllDevices()

      if (response.success) {
        return { success: true }
      } else {
        setError('Failed to logout from all devices')
        return { success: false, error: 'Failed to logout from all devices' }
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to logout from all devices'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    setLoading,
    setError,
    clearError,
    setUser,
    clearAuth,

    // Authentication methods
    login,
    register,
    logout,
    refreshUserData,
    initAuth,

    // Basic user management methods
    updateProfile,
    deleteAccount,
    requestPasswordReset,
    resetPassword,
    verifyEmail,
    resendVerification,
    changePassword,
    getActiveSessions,
    terminateSession,
    terminateAllOtherSessions,
    logoutAllDevices,
  }
})
