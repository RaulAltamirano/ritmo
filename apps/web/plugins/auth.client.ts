/**
 * 🚀 RITMO AUTH PLUGIN - 2025 BEST PRACTICES
 *
 * Nuxt plugin for automatic authentication initialization:
 * - Automatic token manager initialization
 * - Proactive refresh setup
 * - User activity monitoring
 * - Global error handling
 */

export default defineNuxtPlugin(async nuxtApp => {
  // Only run on client-side
  if (process.server) {
    return
  }

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

        console.log('🚀 Authentication initialized successfully')
      } else {
        console.log('⚠️ Authentication initialization failed')
        // Clear token manager state on auth failure
        tokenManager.clearTokens()
      }
    } catch (error) {
      console.error('❌ Auth plugin initialization error:', error)
    }
  }

  // Initialize when app is ready
  nuxtApp.hook('app:mounted', () => {
    initializeAuth()
  })

  // Handle user activity for proactive refresh
  let activityTimeout: NodeJS.Timeout | null = null

  const resetActivityTimeout = () => {
    if (activityTimeout) {
      clearTimeout(activityTimeout)
    }

    // Set new timeout for user activity
    activityTimeout = setTimeout(
      async () => {
        const { useTokenManager } = await import('~/composables/auth/useTokenManager')
        const tokenManager = useTokenManager()

        // Trigger silent refresh on user activity
        if (tokenManager.shouldRefreshToken()) {
          await tokenManager.silentRefresh()
        }
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
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible') {
      const { useTokenManager } = await import('~/composables/auth/useTokenManager')
      const tokenManager = useTokenManager()

      // Refresh when user returns to tab
      if (tokenManager.shouldRefreshToken()) {
        await tokenManager.silentRefresh()
      }
    }
  })

  // Handle online/offline events
  window.addEventListener('online', async () => {
    const { useTokenManager } = await import('~/composables/auth/useTokenManager')
    const tokenManager = useTokenManager()

    // Refresh when connection is restored
    if (tokenManager.shouldRefreshToken()) {
      await tokenManager.silentRefresh()
    }
  })

  // Global error handler for authentication errors
  nuxtApp.vueApp.config.errorHandler = async (
    error: any,
    instance: any,
    info: string,
  ) => {
    // Handle authentication errors globally
    if (
      error?.code === 'UNAUTHORIZED' ||
      error?.message?.includes('Authentication required')
    ) {
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
