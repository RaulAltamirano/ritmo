import { useAuthStore } from '@/stores/auth'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

// Helper function to wait for reactivity in tests
const waitForReactivity = async () => {
  await nextTick()
  await new Promise(resolve => setTimeout(resolve, 0))
}

// Create mock functions that can be controlled in tests
const mockLogin = vi.fn()
const mockRegister = vi.fn()
const mockLogout = vi.fn()
const mockVerifyAuthentication = vi.fn()
const mockUpdateProfile = vi.fn()

// Mock the auth API
vi.mock('@/composables/auth/useAuthAPI', () => ({
  useAuthAPI: () => ({
    login: mockLogin,
    register: mockRegister,
    logout: mockLogout,
    verifyAuthentication: mockVerifyAuthentication,
    updateProfile: mockUpdateProfile,
  }),
}))

describe('🔐 Auth Store', () => {
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)

    // Clear all mocks before each test
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with default state', () => {
      const store = useAuthStore()

      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })
  })

  describe('State Management', () => {
    it('should set user correctly', async () => {
      const store = useAuthStore()
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        isActive: true,
        isEmailVerified: true,
      }

      store.setUser(mockUser)
      await waitForReactivity()

      expect(store.user).toEqual(mockUser)
      expect(store.isAuthenticated).toBe(true)
    })

    it('should clear auth state correctly', async () => {
      const store = useAuthStore()
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        isActive: true,
        isEmailVerified: true,
      }

      store.setUser(mockUser)
      await waitForReactivity()
      expect(store.isAuthenticated).toBe(true)

      store.clearAuth()
      await waitForReactivity()

      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should set loading state', () => {
      const store = useAuthStore()

      store.setLoading(true)
      expect(store.isLoading).toBe(true)

      store.setLoading(false)
      expect(store.isLoading).toBe(false)
    })

    it('should set error state', () => {
      const store = useAuthStore()

      store.setError('Test error')
      expect(store.error).toBe('Test error')

      store.clearError()
      expect(store.error).toBeNull()
    })
  })

  describe('Login Functionality', () => {
    it('should handle successful login', async () => {
      const store = useAuthStore()
      const credentials = {
        email: 'test@example.com',
        password: 'SecurePass123!',
      }

      const mockResponse = {
        success: true,
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
            username: 'testuser',
            isActive: true,
            isEmailVerified: true,
          },
        },
      }

      // Set up the mock to return the expected response
      mockLogin.mockResolvedValue(mockResponse)

      const result = await store.login(credentials)
      await waitForReactivity()

      expect(result.success).toBe(true)
      expect(store.user).toEqual(mockResponse.data.user)
      expect(store.isAuthenticated).toBe(true)
      expect(store.error).toBeNull()
    })

    it('should handle login failure', async () => {
      const store = useAuthStore()
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      }

      // Mock a failed response (not success: false, but throwing an error)
      mockLogin.mockRejectedValue({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid credentials',
      })

      const result = await store.login(credentials)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid credentials')
      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
    })

    it('should handle login API error', async () => {
      const store = useAuthStore()
      const credentials = {
        email: 'test@example.com',
        password: 'SecurePass123!',
      }

      mockLogin.mockRejectedValue(new Error('Network error'))

      const result = await store.login(credentials)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
    })
  })

  describe('Registration Functionality', () => {
    it('should handle successful registration', async () => {
      const store = useAuthStore()
      const userData = {
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'SecurePass123!',
        acceptTerms: true,
      }

      const mockResponse = {
        success: true,
        data: {
          user: {
            id: '2',
            email: 'newuser@example.com',
            username: 'newuser',
            isActive: true,
            isEmailVerified: false,
          },
        },
      }

      mockRegister.mockResolvedValue(mockResponse)

      const result = await store.register(userData)
      await waitForReactivity()

      expect(result.success).toBe(true)
      expect(store.user).toEqual(mockResponse.data.user)
      expect(store.isAuthenticated).toBe(true)
      expect(store.error).toBeNull()
    })

    it('should handle registration failure', async () => {
      const store = useAuthStore()
      const userData = {
        email: 'existing@example.com',
        username: 'existinguser',
        password: 'SecurePass123!',
        acceptTerms: true,
      }

      mockRegister.mockRejectedValue({
        code: 'USER_EXISTS',
        message: 'User already exists',
      })

      const result = await store.register(userData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('User already exists')
      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
    })
  })

  describe('Logout Functionality', () => {
    it('should handle successful logout', async () => {
      const store = useAuthStore()

      // Set initial state
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        isActive: true,
        isEmailVerified: true,
      }
      store.setUser(mockUser)
      await waitForReactivity()

      const mockResponse = {
        success: true,
      }

      mockLogout.mockResolvedValue(mockResponse)

      const result = await store.logout()
      await waitForReactivity()

      expect(result.success).toBe(true)
      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
    })

    it('should clear auth state even if API fails', async () => {
      const store = useAuthStore()

      // Set initial state
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        isActive: true,
        isEmailVerified: true,
      }
      store.setUser(mockUser)
      await waitForReactivity()

      mockLogout.mockRejectedValue(new Error('Network error'))

      const result = await store.logout()
      await waitForReactivity()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
      // Auth state should still be cleared for security
      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
    })
  })

  describe('User Data Refresh', () => {
    it('should refresh user data successfully', async () => {
      const store = useAuthStore()

      const mockUser = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        isActive: true,
        isEmailVerified: true,
      }

      const mockResponse = {
        success: true,
        data: {
          user: mockUser,
        },
      }

      mockVerifyAuthentication.mockResolvedValue(mockResponse)

      const result = await store.refreshUserData()
      await waitForReactivity()

      expect(result.success).toBe(true)
      expect(result.user).toEqual(mockUser)
      expect(store.user).toEqual(mockUser)
      expect(store.isAuthenticated).toBe(true)
    })

    it('should handle user data refresh failure', async () => {
      const store = useAuthStore()

      mockVerifyAuthentication.mockRejectedValue(new Error('Authentication failed'))

      const result = await store.refreshUserData()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Authentication failed')
      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
    })
  })

  describe('Profile Management', () => {
    it('should update profile successfully', async () => {
      const store = useAuthStore()

      // Set initial user
      const initialUser = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
        isEmailVerified: true,
      }
      store.setUser(initialUser)
      await waitForReactivity()

      const profileData = {
        firstName: 'Jane',
        lastName: 'Smith',
        timezone: 'UTC',
      }

      const mockResponse = {
        success: true,
        data: {
          user: {
            ...initialUser,
            ...profileData,
          },
        },
      }

      mockUpdateProfile.mockResolvedValue(mockResponse)

      const result = await store.updateProfile(profileData)
      await waitForReactivity()

      expect(result.success).toBe(true)
      expect(store.user?.firstName).toBe('Jane')
      expect(store.user?.lastName).toBe('Smith')
      expect(store.user?.timezone).toBe('UTC')
    })

    it('should handle profile update failure', async () => {
      const store = useAuthStore()

      const profileData = {
        firstName: 'Jane',
        lastName: 'Smith',
      }

      mockUpdateProfile.mockRejectedValue(new Error('Update failed'))

      const result = await store.updateProfile(profileData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Update failed')
    })
  })
})
