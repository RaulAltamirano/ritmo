/**
 * 🚀 RITMO TOKEN REFRESH TESTS - CORREGIDOS
 *
 * Comprehensive test suite for token refresh functionality:
 * - Unit tests for individual components
 * - Integration tests for complete flows
 * - Error handling tests
 * - Performance tests
 */

import { TOKEN_REFRESH_CONFIG } from '@/config/tokenRefresh'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the auth API
const mockAuthAPI = {
  refreshToken: vi.fn(),
  verifyAuthentication: vi.fn(),
}

vi.mock('../composables/auth/useAuthAPI', () => ({
  useAuthAPI: () => mockAuthAPI,
}))

// Mock navigateTo
vi.mock('#app', () => ({
  navigateTo: vi.fn(),
}))

// Mock useHttpClient
const mockHttpClient = {
  fetch: vi.fn(),
}

vi.mock('../shared/useHttpClient', () => ({
  useHttpClient: () => mockHttpClient,
}))

// Mock useAuthenticatedHttpClient
const mockAuthenticatedHttpClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
  patch: vi.fn(),
}

vi.mock('../composables/auth/useAuthenticatedHttpClient', () => ({
  useAuthenticatedHttpClient: () => mockAuthenticatedHttpClient,
}))

// Mock device fingerprint
vi.mock('../../utils/deviceFingerprint', () => ({
  getCurrentDeviceFingerprint: vi.fn().mockResolvedValue({
    deviceId: 'test-device-id',
    deviceType: 'desktop',
    browser: 'Chrome',
    os: 'Windows',
  }),
}))

// Mock global refresh state
let mockGlobalState = {
  isRefreshing: false,
  hasRefreshPromise: false,
  queueLength: 0,
}

let mockRefreshPromise: Promise<boolean> | null = null

vi.mock('../composables/auth/useGlobalRefreshState', () => ({
  getGlobalRefreshState: vi.fn(() => ({ ...mockGlobalState })),
  updateGlobalRefreshState: vi.fn(state => {
    mockGlobalState = { ...state }
  }),
  setRefreshPromise: vi.fn(promise => {
    mockRefreshPromise = promise
  }),
  getRefreshPromise: vi.fn(() => mockRefreshPromise),
  runSingleFlightRefresh: vi.fn(async doRefresh => {
    if (mockRefreshPromise) {
      return mockRefreshPromise
    }

    mockGlobalState = {
      isRefreshing: true,
      hasRefreshPromise: true,
      queueLength: 0,
    }
    mockRefreshPromise = Promise.resolve(doRefresh()).finally(() => {
      mockGlobalState = {
        isRefreshing: false,
        hasRefreshPromise: false,
        queueLength: 0,
      }
      mockRefreshPromise = null
    })
    return mockRefreshPromise
  }),
  resetGlobalRefreshState: vi.fn(() => {
    mockGlobalState = {
      isRefreshing: false,
      hasRefreshPromise: false,
      queueLength: 0,
    }
    mockRefreshPromise = null
  }),
}))

describe('🔐 Token Refresh System', () => {
  let pinia: any

  beforeEach(async () => {
    pinia = createPinia()
    setActivePinia(pinia)
    vi.clearAllMocks()

    // Reset global refresh state
    const { resetGlobalRefreshState } = await import(
      '../composables/auth/useGlobalRefreshState'
    )
    resetGlobalRefreshState()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  describe('Configuration', () => {
    it('should have valid timing configuration', () => {
      const { timing } = TOKEN_REFRESH_CONFIG

      expect(timing.minRefreshInterval).toBe(5 * 60 * 1000) // 5 minutes
      expect(timing.failureBackoffMs).toBe(30 * 1000)
      expect(timing.proactiveCheckInterval).toBe(60 * 1000) // 1 minute
      expect(timing.maxRefreshAttempts).toBe(10)
      expect(timing.expirationBuffer).toBe(2 * 60 * 1000) // 2 minutes
    })

    it('should have valid retry configuration', () => {
      const { retry } = TOKEN_REFRESH_CONFIG

      expect(retry.maxRetries).toBe(3)
      expect(retry.baseDelay).toBe(1000)
      expect(retry.maxDelay).toBe(8000)
      expect(retry.jitterRange).toBe(500)
    })

    it('should have security features enabled', () => {
      const { security } = TOKEN_REFRESH_CONFIG

      expect(security.enableDeviceValidation).toBe(true)
      expect(security.enableRateLimiting).toBe(true)
      expect(security.maxRefreshAttemptsPerMinute).toBe(5)
      expect(security.enableSecurityLogging).toBe(true)
    })
  })

  describe('useTokenManager', () => {
    it('should perform silent refresh successfully', async () => {
      // Mock successful refresh
      mockAuthAPI.refreshToken.mockResolvedValue({ success: true })

      const { useTokenManager } = await import('../composables/auth/useTokenManager')
      const tokenManager = useTokenManager()
      const result = await tokenManager.silentRefresh()

      expect(result).toBe(true)
      expect(mockAuthAPI.refreshToken).toHaveBeenCalledTimes(1)
    })

    it('should handle silent refresh failure', async () => {
      // Mock failed refresh
      mockAuthAPI.refreshToken.mockRejectedValue(new Error('Refresh failed'))

      const { useTokenManager } = await import('../composables/auth/useTokenManager')
      const tokenManager = useTokenManager()
      const result = await tokenManager.silentRefresh()

      expect(result).toBe(false)
      expect(mockAuthAPI.refreshToken).toHaveBeenCalledTimes(1)
    })

    it('should prevent concurrent refresh attempts', async () => {
      // Mock slow refresh
      mockAuthAPI.refreshToken.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100)),
      )

      const { useTokenManager } = await import('../composables/auth/useTokenManager')
      const tokenManager = useTokenManager()

      // Start first refresh
      const refresh1 = tokenManager.silentRefresh()

      // Start second refresh immediately (should be blocked)
      const refresh2 = tokenManager.silentRefresh()

      const [result1, result2] = await Promise.all([refresh1, refresh2])

      expect(result1).toBe(true)
      expect(result2).toBe(true) // Should return the same result as the first call
      expect(mockAuthAPI.refreshToken).toHaveBeenCalledTimes(1) // Only one actual call
    })

    it('should check user activity correctly', async () => {
      const { useTokenManager } = await import('../composables/auth/useTokenManager')
      const tokenManager = useTokenManager()

      // Mock document.hasFocus and visibilityState
      Object.defineProperty(document, 'hasFocus', {
        value: vi.fn().mockReturnValue(true),
        writable: true,
      })

      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        writable: true,
      })

      const shouldRefresh = tokenManager.shouldRefreshToken()
      expect(shouldRefresh).toBe(true)
    })

    it('should respect minimum refresh interval', async () => {
      const { useTokenManager } = await import('../composables/auth/useTokenManager')
      const tokenManager = useTokenManager()

      // Mock successful refresh
      mockAuthAPI.refreshToken.mockResolvedValue({ success: true })

      // First refresh
      await tokenManager.silentRefresh()

      // Immediate second refresh should be blocked
      const result = tokenManager.shouldRefreshToken()
      expect(result).toBe(false)
    })

    it('stamps successful refreshes but only backs failures off for 30 seconds', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-08-06T12:00:00Z'))
      mockAuthAPI.refreshToken.mockResolvedValue({ success: false })

      const { useTokenManager } = await import('../composables/auth/useTokenManager')
      const tokenManager = useTokenManager()

      await expect(tokenManager.silentRefresh()).resolves.toBe(false)
      expect(tokenManager.getTokenInfo().lastRefreshAttempt).toBeNull()
      expect(tokenManager.shouldRefreshToken()).toBe(false)

      vi.advanceTimersByTime(TOKEN_REFRESH_CONFIG.timing.failureBackoffMs + 1)
      expect(tokenManager.shouldRefreshToken()).toBe(true)

      mockAuthAPI.refreshToken.mockResolvedValue({ success: true })
      await expect(tokenManager.silentRefresh()).resolves.toBe(true)
      expect(tokenManager.getTokenInfo().lastRefreshAttempt).toEqual(new Date())
    })
  })

  describe('useAuthStore', () => {
    it('should retry user data refresh after token refresh', async () => {
      // Mock failed verification, successful refresh, then successful verification
      mockAuthAPI.verifyAuthentication
        .mockRejectedValueOnce({
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        })
        .mockResolvedValueOnce({ success: true, data: { user: { id: '1' } } })

      mockAuthAPI.refreshToken.mockResolvedValue({ success: true })

      const { useAuthStore } = await import('../stores/auth')
      const authStore = useAuthStore()
      const result = await authStore.refreshUserData()

      expect(result.success).toBe(true)
      expect(result.user).toEqual({ id: '1' })
      expect(mockAuthAPI.refreshToken).toHaveBeenCalledTimes(1)
      expect(mockAuthAPI.verifyAuthentication).toHaveBeenCalledTimes(2)
    })

    it('should handle refresh failure in user data refresh', async () => {
      // Mock failed verification and failed refresh
      mockAuthAPI.verifyAuthentication.mockRejectedValue({
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      })
      mockAuthAPI.refreshToken.mockRejectedValue(new Error('Refresh failed'))

      const { useAuthStore } = await import('../stores/auth')
      const authStore = useAuthStore()
      const result = await authStore.refreshUserData()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Authentication required')
      expect(authStore.user).toBeNull()
    })
  })

  describe('Integration Tests', () => {
    it('should handle complete authentication flow with refresh', async () => {
      // Mock successful authentication
      mockAuthAPI.verifyAuthentication.mockResolvedValue({
        success: true,
        data: { user: { id: '1', email: 'test@example.com' } },
      })

      const { useAuthStore } = await import('../stores/auth')
      const { useTokenManager } = await import('../composables/auth/useTokenManager')

      const authStore = useAuthStore()
      const tokenManager = useTokenManager()

      // Initialize token manager
      tokenManager.initializeTokens()

      // Refresh user data
      const result = await authStore.refreshUserData()

      expect(result.success).toBe(true)
      expect(authStore.user).toEqual({ id: '1', email: 'test@example.com' })
    })

    it('should handle network failures gracefully', async () => {
      // Mock network failure
      mockAuthAPI.verifyAuthentication.mockRejectedValue(new Error('Network error'))

      const { useAuthStore } = await import('../stores/auth')
      const authStore = useAuthStore()
      const result = await authStore.refreshUserData()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })
  })

  describe('Performance Tests', () => {
    it('should handle concurrent requests efficiently', async () => {
      // Mock successful refresh
      mockAuthAPI.refreshToken.mockResolvedValue({ success: true })

      const { useTokenManager } = await import('../composables/auth/useTokenManager')
      const tokenManager = useTokenManager()

      // Test concurrent refresh calls
      const promises = [
        tokenManager.silentRefresh(),
        tokenManager.silentRefresh(),
        tokenManager.silentRefresh(),
      ]

      const results = await Promise.all(promises)

      // All should succeed because they share the same promise
      const successCount = results.filter(r => r === true).length
      expect(successCount).toBe(3) // All should succeed
      expect(mockAuthAPI.refreshToken).toHaveBeenCalledTimes(1)
    })
  })
})
