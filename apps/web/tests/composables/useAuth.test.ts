import { useAuth } from '@/composables/auth/useAuth'
import { useAuthStore } from '@/stores/auth'
import type { AuthUser } from '@/types/auth.d'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

// Helper function to wait for reactivity in tests
const waitForReactivity = async () => {
  await nextTick()
  await new Promise(resolve => setTimeout(resolve, 0))
}

// Helper function to create complete mock user
const createMockUser = (overrides: Partial<AuthUser> = {}): AuthUser => ({
  id: '1',
  email: 'test@example.com',
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  timezone: 'UTC',
  language: 'en',
  isActive: true,
  isEmailVerified: true,
  ...overrides,
})

// Mock the auth API
vi.mock('@/composables/auth/useAuthAPI', () => ({
  useAuthAPI: () => ({
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    verifyAuthentication: vi.fn(),
    refreshUserData: vi.fn(),
    updateProfile: vi.fn(),
    deleteAccount: vi.fn(),
    requestPasswordReset: vi.fn(),
    resetPassword: vi.fn(),
    changePassword: vi.fn(),
    verifyEmail: vi.fn(),
    resendVerification: vi.fn(),
    getSessions: vi.fn(),
    terminateSession: vi.fn(),
    logoutAllDevices: vi.fn(),
  }),
}))

// Mock the authenticated HTTP client
vi.mock('@/composables/useAuthenticatedHttpClient', () => ({
  useAuthenticatedHttpClient: () => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }),
}))

// Mock the token manager
vi.mock('@/composables/auth/useTokenManager', () => ({
  useTokenManager: () => ({
    initializeTokens: vi.fn(),
    clearTokens: vi.fn(),
    silentRefresh: vi.fn().mockResolvedValue(true),
  }),
}))

// Mock device fingerprint
vi.mock('@/utils/deviceFingerprint', () => ({
  getCurrentDeviceFingerprint: vi.fn().mockResolvedValue({
    deviceId: 'test-device-id',
    deviceInfo: {
      deviceName: 'Test Device',
      deviceType: 'desktop',
      browser: 'Chrome',
      os: 'Linux',
      userAgent: 'Mozilla/5.0...',
      screenResolution: '1920x1080',
      hardwareConcurrency: 8,
      timezone: 'UTC',
      language: 'en-US',
    },
  }),
}))

describe('🔐 useAuth Composable', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    vi.clearAllMocks()
  })

  describe('Authentication State', () => {
    it('should initialize with default state', () => {
      const { user, isAuthenticated, isLoading, error } = useAuth()

      expect(user.value).toBeNull()
      expect(isAuthenticated.value).toBe(false)
      expect(isLoading.value).toBe(false)
      expect(error.value).toBeNull()
    })

    it('should update authentication state when user is set', async () => {
      const { user, isAuthenticated } = useAuth()
      const authStore = useAuthStore()

      const mockUser = createMockUser()

      authStore.setUser(mockUser)
      await waitForReactivity()

      expect(user.value).toEqual(mockUser)
      expect(isAuthenticated.value).toBe(true)
    })
  })

  describe('Login Functionality', () => {
    it('should handle successful login', async () => {
      const { login } = useAuth()
      const authStore = useAuthStore()

      const credentials = {
        email: 'test@example.com',
        password: 'SecurePass123!',
      }

      const mockUser = createMockUser()
      const mockResponse = {
        success: true,
        data: {
          user: mockUser,
        },
      }

      // Mock the store's login method to return the response
      const loginSpy = vi.spyOn(authStore, 'login').mockResolvedValue(mockResponse)

      const result = await login(credentials)

      expect(result.success).toBe(true)
      expect(loginSpy).toHaveBeenCalledWith(credentials)
    })

    it('should handle login failure', async () => {
      const { login } = useAuth()
      const authStore = useAuthStore()

      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      }

      const mockResponse = {
        success: false,
        error: 'Invalid credentials',
      }

      const loginSpy = vi.spyOn(authStore, 'login').mockResolvedValue(mockResponse)

      const result = await login(credentials)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid credentials')
      expect(loginSpy).toHaveBeenCalledWith(credentials)
    })
  })

  describe('Registration Functionality', () => {
    it('should handle successful registration', async () => {
      const { register } = useAuth()
      const authStore = useAuthStore()

      const userData = {
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'SecurePass123!',
        acceptTerms: true,
      }

      const mockUser = createMockUser({
        id: '2',
        email: 'newuser@example.com',
        username: 'newuser',
        isEmailVerified: false,
      })
      const mockResponse = {
        success: true,
        data: {
          user: mockUser,
        },
      }

      const registerSpy = vi
        .spyOn(authStore, 'register')
        .mockResolvedValue(mockResponse)

      const result = await register(userData)

      expect(result.success).toBe(true)
      expect(registerSpy).toHaveBeenCalledWith(userData)
    })

    it('should handle registration failure', async () => {
      const { register } = useAuth()
      const authStore = useAuthStore()

      const userData = {
        email: 'existing@example.com',
        username: 'existinguser',
        password: 'SecurePass123!',
        acceptTerms: true,
      }

      const mockResponse = {
        success: false,
        error: 'User already exists',
      }

      const registerSpy = vi
        .spyOn(authStore, 'register')
        .mockResolvedValue(mockResponse)

      const result = await register(userData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('User already exists')
      expect(registerSpy).toHaveBeenCalledWith(userData)
    })
  })

  describe('Logout Functionality', () => {
    it('should handle successful logout', async () => {
      const { logout } = useAuth()
      const authStore = useAuthStore()

      const mockResponse = {
        success: true,
      }

      const logoutSpy = vi.spyOn(authStore, 'logout').mockResolvedValue(mockResponse)

      const result = await logout()

      expect(result.success).toBe(true)
      expect(logoutSpy).toHaveBeenCalled()
    })

    it('should clear auth state on logout', async () => {
      const { user, isAuthenticated, logout } = useAuth()
      const authStore = useAuthStore()

      // Set initial state
      const mockUser = createMockUser()

      authStore.setUser(mockUser)
      await waitForReactivity()
      expect(isAuthenticated.value).toBe(true)

      // Mock logout to actually clear the state
      const logoutSpy = vi.spyOn(authStore, 'logout').mockImplementation(() => {
        authStore.clearAuth()
        return Promise.resolve({ success: true })
      })

      await logout()
      await waitForReactivity()

      expect(user.value).toBeNull()
      expect(isAuthenticated.value).toBe(false)
      expect(logoutSpy).toHaveBeenCalled()
    })
  })

  describe('Authentication Initialization', () => {
    it('should initialize authentication successfully', async () => {
      const { initAuth } = useAuth()
      const authStore = useAuthStore()

      const initAuthSpy = vi.spyOn(authStore, 'initAuth').mockResolvedValue({
        success: true,
      })

      const result = await initAuth()

      expect(result.success).toBe(true)
      expect(initAuthSpy).toHaveBeenCalled()
    })

    it('should handle authentication initialization failure', async () => {
      const { initAuth } = useAuth()
      const authStore = useAuthStore()

      const initAuthSpy = vi.spyOn(authStore, 'initAuth').mockResolvedValue({
        success: false,
        shouldRedirect: true,
      })

      const result = await initAuth()

      expect(result.success).toBe(false)
      expect('shouldRedirect' in result && result.shouldRedirect).toBe(true)
      expect(initAuthSpy).toHaveBeenCalled()
    })
  })

  describe('Profile Management', () => {
    it('should update profile successfully', async () => {
      const { updateProfile } = useAuth()
      const authStore = useAuthStore()

      const profileData = {
        firstName: 'John',
        lastName: 'Doe',
        timezone: 'UTC',
      }

      const mockResponse = {
        success: true,
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
            username: 'testuser',
            firstName: 'John',
            lastName: 'Doe',
            timezone: 'UTC',
            isActive: true,
            isEmailVerified: true,
          },
        },
      }

      const updateProfileSpy = vi
        .spyOn(authStore, 'updateProfile')
        .mockResolvedValue(mockResponse)

      const result = await updateProfile(profileData)

      expect(result.success).toBe(true)
      expect(updateProfileSpy).toHaveBeenCalledWith(profileData)
    })

    it('should handle profile update failure', async () => {
      const { updateProfile } = useAuth()
      const authStore = useAuthStore()

      const profileData = {
        firstName: 'John',
        lastName: 'Doe',
      }

      const mockResponse = {
        success: false,
        error: 'Profile update failed',
      }

      const updateProfileSpy = vi
        .spyOn(authStore, 'updateProfile')
        .mockResolvedValue(mockResponse)

      const result = await updateProfile(profileData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Profile update failed')
      expect(updateProfileSpy).toHaveBeenCalledWith(profileData)
    })
  })

  describe('User Data Refresh', () => {
    it('should refresh user data successfully', async () => {
      const { refreshUserData } = useAuth()
      const authStore = useAuthStore()

      const mockUser = createMockUser()

      const mockResponse = {
        success: true,
        user: mockUser,
      }

      const refreshSpy = vi
        .spyOn(authStore, 'refreshUserData')
        .mockResolvedValue(mockResponse)

      const result = await refreshUserData()

      expect(result.success).toBe(true)
      expect(refreshSpy).toHaveBeenCalled()
    })

    it('should handle refresh user data failure', async () => {
      const { refreshUserData } = useAuth()
      const authStore = useAuthStore()

      const mockResponse = {
        success: false,
        error: 'Failed to refresh user data',
      }

      const refreshSpy = vi
        .spyOn(authStore, 'refreshUserData')
        .mockResolvedValue(mockResponse)

      const result = await refreshUserData()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to refresh user data')
      expect(refreshSpy).toHaveBeenCalled()
    })

    it('should force refresh user data', async () => {
      const { forceRefreshUserData } = useAuth()
      const authStore = useAuthStore()

      const mockUser = createMockUser()

      const mockResponse = {
        success: true,
        user: mockUser,
      }

      const refreshSpy = vi
        .spyOn(authStore, 'refreshUserData')
        .mockResolvedValue(mockResponse)

      const result = await forceRefreshUserData()

      expect(result.success).toBe(true)
      expect(refreshSpy).toHaveBeenCalled()
    })
  })

  describe('Password Management', () => {
    it('should request password reset successfully', async () => {
      const { requestPasswordReset } = useAuth()
      const authStore = useAuthStore()

      const mockResponse = {
        success: true,
      }

      const requestResetSpy = vi
        .spyOn(authStore, 'requestPasswordReset')
        .mockResolvedValue(mockResponse)

      const result = await requestPasswordReset('test@example.com')

      expect(result.success).toBe(true)
      expect(requestResetSpy).toHaveBeenCalledWith('test@example.com')
    })

    it('should reset password successfully', async () => {
      const { resetPassword } = useAuth()
      const authStore = useAuthStore()

      const mockResponse = {
        success: true,
      }

      const resetSpy = vi
        .spyOn(authStore, 'resetPassword')
        .mockResolvedValue(mockResponse)

      const result = await resetPassword('token123', 'NewPassword123!')

      expect(result.success).toBe(true)
      expect(resetSpy).toHaveBeenCalledWith('token123', 'NewPassword123!')
    })

    it('should change password successfully', async () => {
      const { changePassword } = useAuth()
      const authStore = useAuthStore()

      const mockResponse = {
        success: true,
      }

      const changeSpy = vi
        .spyOn(authStore, 'changePassword')
        .mockResolvedValue(mockResponse)

      const result = await changePassword('OldPassword123!', 'NewPassword123!')

      expect(result.success).toBe(true)
      expect(changeSpy).toHaveBeenCalledWith('OldPassword123!', 'NewPassword123!')
    })
  })

  describe('Email Verification', () => {
    it('should verify email successfully', async () => {
      const { verifyEmail } = useAuth()
      const authStore = useAuthStore()

      const mockResponse = {
        success: true,
      }

      const verifySpy = vi
        .spyOn(authStore, 'verifyEmail')
        .mockResolvedValue(mockResponse)

      const result = await verifyEmail('verification-token-123')

      expect(result.success).toBe(true)
      expect(verifySpy).toHaveBeenCalledWith('verification-token-123')
    })

    it('should resend verification email successfully', async () => {
      const { resendVerification } = useAuth()
      const authStore = useAuthStore()

      const mockResponse = {
        success: true,
      }

      const resendSpy = vi
        .spyOn(authStore, 'resendVerification')
        .mockResolvedValue(mockResponse)

      const result = await resendVerification('test@example.com')

      expect(result.success).toBe(true)
      expect(resendSpy).toHaveBeenCalledWith('test@example.com')
    })
  })

  describe('Account Management', () => {
    it('should delete account successfully', async () => {
      const { deleteAccount } = useAuth()
      const authStore = useAuthStore()

      const mockResponse = {
        success: true,
      }

      const deleteSpy = vi
        .spyOn(authStore, 'deleteAccount')
        .mockResolvedValue(mockResponse)

      const result = await deleteAccount('password123')

      expect(result.success).toBe(true)
      expect(deleteSpy).toHaveBeenCalledWith('password123')
    })
  })

  describe('Session Management', () => {
    it('should get active sessions successfully', async () => {
      const { getActiveSessions } = useAuth()
      const authStore = useAuthStore()

      const mockSessions = [
        { id: '1', deviceName: 'Chrome on Windows', lastActive: '2024-01-01' },
        { id: '2', deviceName: 'Safari on Mac', lastActive: '2024-01-02' },
      ]

      const mockResponse = {
        success: true,
        sessions: mockSessions,
      }

      const getSessionsSpy = vi
        .spyOn(authStore, 'getActiveSessions')
        .mockResolvedValue(mockResponse)

      const result = await getActiveSessions()

      expect(result.success).toBe(true)
      expect(result.sessions).toEqual(mockSessions)
      expect(getSessionsSpy).toHaveBeenCalled()
    })

    it('should terminate session successfully', async () => {
      const { terminateSession } = useAuth()
      const authStore = useAuthStore()

      const mockResponse = {
        success: true,
      }

      const terminateSpy = vi
        .spyOn(authStore, 'terminateSession')
        .mockResolvedValue(mockResponse)

      const result = await terminateSession('session-123')

      expect(result.success).toBe(true)
      expect(terminateSpy).toHaveBeenCalledWith('session-123')
    })

    it('should terminate all other sessions successfully', async () => {
      const { terminateAllOtherSessions } = useAuth()
      const authStore = useAuthStore()

      const mockResponse = {
        success: true,
      }

      const terminateAllSpy = vi
        .spyOn(authStore, 'terminateAllOtherSessions')
        .mockResolvedValue(mockResponse)

      const result = await terminateAllOtherSessions()

      expect(result.success).toBe(true)
      expect(terminateAllSpy).toHaveBeenCalled()
    })

    it('should logout all devices successfully', async () => {
      const { logoutAllDevices } = useAuth()
      const authStore = useAuthStore()

      const mockResponse = {
        success: true,
      }

      const logoutAllSpy = vi
        .spyOn(authStore, 'logoutAllDevices')
        .mockResolvedValue(mockResponse)

      const result = await logoutAllDevices()

      expect(result.success).toBe(true)
      expect(logoutAllSpy).toHaveBeenCalled()
    })
  })

  describe('Computed Properties', () => {
    it('should have correct computed properties', () => {
      const { user, isAuthenticated, isLoading, error, isAuthReady } = useAuth()

      expect(user.value).toBeNull()
      expect(isAuthenticated.value).toBe(false)
      expect(isLoading.value).toBe(false)
      expect(error.value).toBeNull()
      expect(isAuthReady.value).toBe(true)
    })

    it('should update computed properties when user changes', async () => {
      const { user, isAuthenticated } = useAuth()
      const authStore = useAuthStore()

      const mockUser = createMockUser()

      authStore.setUser(mockUser)
      await waitForReactivity()

      expect(user.value).toEqual(mockUser)
      expect(isAuthenticated.value).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const { login } = useAuth()
      const authStore = useAuthStore()

      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      }

      const loginSpy = vi
        .spyOn(authStore, 'login')
        .mockRejectedValue(new Error('Network error'))

      const result = await login(credentials)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Login failed')
      expect(loginSpy).toHaveBeenCalledWith(credentials)
    })

    it('should handle store method errors', async () => {
      const { register } = useAuth()
      const authStore = useAuthStore()

      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        acceptTerms: true,
      }

      const registerSpy = vi
        .spyOn(authStore, 'register')
        .mockRejectedValue(new Error('Store error'))

      const result = await register(userData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Registration failed')
      expect(registerSpy).toHaveBeenCalledWith(userData)
    })
  })

  describe('Edge Cases', () => {
    it('should handle null/undefined user data', async () => {
      const { user, isAuthenticated } = useAuth()
      const authStore = useAuthStore()

      authStore.setUser(null)
      await waitForReactivity()

      expect(user.value).toBeNull()
      expect(isAuthenticated.value).toBe(false)
    })

    it('should handle empty credentials', async () => {
      const { login } = useAuth()
      const authStore = useAuthStore()

      const credentials = {
        email: '',
        password: '',
      }

      const mockResponse = {
        success: false,
        error: 'Email and password are required',
      }

      const loginSpy = vi.spyOn(authStore, 'login').mockResolvedValue(mockResponse)

      const result = await login(credentials)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Email and password are required')
      expect(loginSpy).toHaveBeenCalledWith(credentials)
    })

    it('should handle malformed user data', async () => {
      const { user, isAuthenticated } = useAuth()
      const authStore = useAuthStore()

      const malformedUser = {
        id: '1',
        // Missing required fields
      } as unknown as AuthUser

      authStore.setUser(malformedUser)
      await waitForReactivity()

      expect(user.value).toEqual(malformedUser)
      expect(isAuthenticated.value).toBe(true) // Still authenticated even with malformed data
    })
  })
})
