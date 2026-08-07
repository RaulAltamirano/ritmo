/**
 * 🚀 RITMO TOKEN MANAGER - 2025 BEST PRACTICES
 *
 * Enhanced token management with silent refresh:
 * - HttpOnly cookie-based authentication
 * - Silent background refresh
 * - User activity monitoring
 * - Proactive token refresh
 * - Secure cleanup on logout
 */

import { useAuthStore } from '@/stores/auth'
import { TOKEN_REFRESH_CONFIG } from '@/config/tokenRefresh'
import { computed, ref } from 'vue'
import { useAuthAPI } from './useAuthAPI'
import { getGlobalRefreshState, runSingleFlightRefresh } from './useGlobalRefreshState'

export const useTokenManager = () => {
  const authStore = useAuthStore()
  const authAPI = useAuthAPI()

  // Reactive state
  const lastRefreshAttempt = ref<Date | null>(null)
  const lastFailureAttempt = ref<Date | null>(null)
  const refreshInterval = ref<NodeJS.Timeout | null>(null)

  // Computed properties
  const hasAccessToken = computed(() => false) // No client-side tokens
  const isTokenExpired = computed(() => false) // Managed by server
  const isTokenExpiringSoon = computed(() => false) // Managed by server
  const hasRefreshToken = computed(() => !!authStore.user) // Assume exists if user is authenticated

  /**
   * Silent refresh attempt
   */
  const silentRefresh = async (): Promise<boolean> => {
    return runSingleFlightRefresh(async () => {
      try {
        const response = await authAPI.refreshToken()
        const success = response?.success ?? false

        if (success) {
          lastRefreshAttempt.value = new Date()
          lastFailureAttempt.value = null
          console.log('✅ Silent refresh successful - tokens refreshed proactively')
        } else {
          lastFailureAttempt.value = new Date()
          console.warn('⚠️ Silent refresh failed - response indicates failure')
        }

        return success
      } catch (error) {
        lastFailureAttempt.value = new Date()
        console.warn('Silent refresh error:', error)
        return false
      }
    })
  }

  /**
   * Check if token should be refreshed based on user activity
   */
  const shouldRefreshToken = (): boolean => {
    const refreshState = getGlobalRefreshState()
    // Don't refresh if already refreshing
    if (refreshState.isRefreshing) {
      return false
    }

    if (lastFailureAttempt.value) {
      const timeSinceLastFailure = Date.now() - lastFailureAttempt.value.getTime()
      if (timeSinceLastFailure < TOKEN_REFRESH_CONFIG.timing.failureBackoffMs) {
        return false
      }
    }

    // Don't refresh too frequently after a successful refresh
    if (lastRefreshAttempt.value) {
      const timeSinceLastAttempt = Date.now() - lastRefreshAttempt.value.getTime()
      if (timeSinceLastAttempt < TOKEN_REFRESH_CONFIG.timing.minRefreshInterval) {
        return false
      }
    }

    // Check if user is active (simple heuristic)
    const isUserActive =
      document.hasFocus() || document.visibilityState === 'visible' || navigator.onLine

    return isUserActive
  }

  /**
   * Start proactive refresh monitoring
   */
  const startProactiveRefresh = (): void => {
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value)
    }

    refreshInterval.value = setInterval(() => {
      if (shouldRefreshToken()) {
        void silentRefresh()
      }
    }, 60000) // Check every minute
  }

  /**
   * Stop proactive refresh monitoring
   */
  const stopProactiveRefresh = (): void => {
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value)
      refreshInterval.value = null
    }
  }

  /**
   * No-op: tokens are managed by server via HttpOnly cookies
   */
  const setAccessToken = () => {
    // No-op: server manages tokens via HttpOnly cookies
  }

  /**
   * Clear local state only - server handles token cleanup
   */
  const clearTokens = () => {
    stopProactiveRefresh()
    lastRefreshAttempt.value = null
    lastFailureAttempt.value = null
  }

  /**
   * No client-side tokens
   */
  const getAccessToken = (): string | null => {
    return null // No client-side tokens
  }

  /**
   * Enhanced refresh with silent refresh capability
   */
  const refreshAccessToken = async (): Promise<boolean> => {
    return silentRefresh()
  }

  /**
   * Always return true - server handles token validation
   */
  const ensureValidToken = (): Promise<string | null> => {
    return Promise.resolve(null) // Server handles token validation via cookies
  }

  /**
   * Handle authentication failure
   */
  const handleAuthFailure = (): Promise<void> => {
    clearTokens()
    return Promise.resolve()
  }

  /**
   * Initialize token management
   */
  const initializeTokens = () => {
    // Start proactive refresh monitoring
    // This will check for user activity and attempt refresh when appropriate
    startProactiveRefresh()
  }

  /**
   * Get token info for debugging
   */
  const getTokenInfo = () => {
    const refreshState = getGlobalRefreshState()
    return {
      hasAccessToken: false,
      isTokenExpired: false,
      isTokenExpiringSoon: false,
      isRefreshing: refreshState.isRefreshing,
      hasRefreshToken: hasRefreshToken.value,
      lastRefreshAttempt: lastRefreshAttempt.value,
      isProactiveRefreshActive: !!refreshInterval.value,
      message: 'Using HttpOnly cookies with silent refresh',
    }
  }

  /**
   * Get refresh status for debugging
   */
  const getRefreshStatus = () => {
    const refreshState = getGlobalRefreshState()
    return {
      isRefreshing: refreshState.isRefreshing,
      hasRefreshPromise: refreshState.hasRefreshPromise,
      lastRefreshAttempt: lastRefreshAttempt.value,
      isProactiveRefreshActive: !!refreshInterval.value,
      shouldRefresh: shouldRefreshToken(),
      queueLength: refreshState.queueLength,
    }
  }

  return {
    // Token state
    hasAccessToken,
    isTokenExpired,
    isTokenExpiringSoon,
    isRefreshing: computed(() => getGlobalRefreshState().isRefreshing),
    hasRefreshToken,

    // Core methods
    setAccessToken,
    getAccessToken,
    clearTokens,
    refreshAccessToken,
    ensureValidToken,
    handleAuthFailure,
    initializeTokens,

    // Enhanced methods
    silentRefresh,
    startProactiveRefresh,
    stopProactiveRefresh,
    shouldRefreshToken,

    // Utility methods
    getTokenInfo,
    getRefreshStatus,
  }
}
