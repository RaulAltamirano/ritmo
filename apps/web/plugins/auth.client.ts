/**
 * 🚀 RITMO AUTH PLUGIN - 2025 BEST PRACTICES
 *
 * Nuxt plugin for automatic authentication initialization:
 * - Automatic token manager initialization
 * - Proactive refresh setup
 * - User activity monitoring
 * - Global error handling
 */

export default defineNuxtPlugin(nuxtApp => {
  // Initialize authentication system
  const initializeAuth = async () => {
    try {
      // Get auth composables
      const { useAuth } = await import('~/composables/auth/useAuth')
      const { useTokenManager } = await import('~/composables/auth/useTokenManager')

      const auth = useAuth()
      const tokenManager = useTokenManager()

      // Initialize authentication
      const authResult = await auth.initAuth()

      if (authResult.success) {
        // Start proactive refresh if user is authenticated
        tokenManager.initializeTokens()

        const { restoreActiveWorkSessionIfAny } = await import(
          '~/composables/timer/useActiveWorkSessionRestore'
        )
        await restoreActiveWorkSessionIfAny()

        const { useTimerStore } = await import('~/stores/timer')
        await useTimerStore().syncTimerPresetsFromApi()
      } else {
        // Clear token manager state on auth failure
        tokenManager.clearTokens()
      }
    } catch (error) {
      console.error('❌ Auth plugin initialization error:', error)
    }
  }

  // Initialize when app is ready
  nuxtApp.hook('app:mounted', () => {
    void initializeAuth()
  })

  // Trigger a silent token refresh when appropriate
  const refreshTokenIfNeeded = async () => {
    const { useTokenManager } = await import('~/composables/auth/useTokenManager')
    const tokenManager = useTokenManager()

    if (tokenManager.shouldRefreshToken()) {
      await tokenManager.silentRefresh()
    }
  }

  // Handle user activity for proactive refresh
  let activityTimeout: NodeJS.Timeout | null = null

  const resetActivityTimeout = () => {
    if (activityTimeout) {
      clearTimeout(activityTimeout)
    }

    // Set new timeout for user activity
    activityTimeout = setTimeout(
      () => {
        void refreshTokenIfNeeded()
      },
      5 * 60 * 1000,
    ) // 5 minutes
  }

  // Listen for user activity events
  const activityEvents = [
    'mousedown',
    'mousemove',
    'keypress',
    'scroll',
    'touchstart',
    'click',
  ]

  activityEvents.forEach(event => {
    document.addEventListener(event, resetActivityTimeout, { passive: true })
  })

  // Handle visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      // Refresh when user returns to tab
      void refreshTokenIfNeeded()
    }
  })

  // Handle online/offline events
  window.addEventListener('online', () => {
    // Refresh when connection is restored
    void refreshTokenIfNeeded()
  })

  // Global error handler for authentication errors
  const handleAuthError = async (error: any) => {
    console.warn('🔐 Global auth error handler:', error)

    // Attempt refresh before redirecting
    try {
      const { useTokenManager } = await import('~/composables/auth/useTokenManager')
      const tokenManager = useTokenManager()

      const refreshSuccess = await tokenManager.silentRefresh()
      if (!refreshSuccess) {
        // Redirect to login if refresh fails
        await navigateTo('/auth/login?reason=global_auth_error')
      }
    } catch (refreshError) {
      console.error('❌ Global refresh failed:', refreshError)
      await navigateTo('/auth/login?reason=global_auth_error')
    }
  }

  nuxtApp.vueApp.config.errorHandler = (error: any, _instance: any, _info: string) => {
    // Handle authentication errors globally
    if (
      error?.code === 'UNAUTHORIZED' ||
      error?.message?.includes('Authentication required')
    ) {
      void handleAuthError(error)
    }
  }

  // Provide auth utilities globally
  return {
    provide: {
      auth: {
        // Initialize auth system
        initialize: initializeAuth,

        // Get auth status
        getStatus: async () => {
          const { useAuth } = await import('~/composables/auth/useAuth')
          const { useTokenManager } = await import('~/composables/auth/useTokenManager')

          const auth = useAuth()
          const tokenManager = useTokenManager()

          return {
            isAuthenticated: auth.isAuthenticated.value,
            user: auth.user.value,
            isLoading: auth.isLoading.value,
            error: auth.error.value,
            refreshStatus: tokenManager.getRefreshStatus(),
            tokenInfo: tokenManager.getTokenInfo(),
          }
        },

        // Force refresh
        forceRefresh: async () => {
          const { useTokenManager } = await import('~/composables/auth/useTokenManager')
          const tokenManager = useTokenManager()
          return await tokenManager.silentRefresh()
        },

        // Clear auth
        clearAuth: async () => {
          const { useAuth } = await import('~/composables/auth/useAuth')
          const { useTokenManager } = await import('~/composables/auth/useTokenManager')

          const auth = useAuth()
          const tokenManager = useTokenManager()

          await auth.logout()
          tokenManager.clearTokens()
        },
      },
    },
  }
})
