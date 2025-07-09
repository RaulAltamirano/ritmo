import { useAuthStore } from '../stores/auth'
import type { LoginCredentials, RegisterCredentials, AuthUser } from '../types/auth'

export const useAuth = () => {
  const authStore = useAuthStore()
  
  // Initialize authentication on client side
  const initAuth = async () => {
    if (process.client) {
      await authStore.initAuth()
    }
  }
  
  // Login with credentials
  const login = async (credentials: LoginCredentials) => {
    const result = await authStore.login(credentials)
    if (!result.success) {
      throw new Error(result.error || 'Login failed')
    }
    return result
  }
  
  // Register new user
  const register = async (credentials: RegisterCredentials) => {
    const result = await authStore.register(credentials)
    if (!result.success) {
      throw new Error(result.error || 'Registration failed')
    }
    return result
  }
  
  // Logout user
  const logout = async () => {
    await authStore.logout()
  }
  
  // Update user profile
  const updateProfile = async (profileData: Partial<AuthUser>) => {
    const result = await authStore.updateProfile(profileData)
    if (!result.success) {
      throw new Error(result.error || 'Profile update failed')
    }
    return result
  }
  
  // Refresh token
  const refreshToken = async () => {
    return await authStore.refreshToken()
  }
  
  // Check token expiry
  const checkTokenExpiry = async () => {
    return await authStore.checkTokenExpiry()
  }
  
  // Clear error
  const clearError = () => {
    authStore.clearError()
  }
  
  return {
    // State
    user: computed(() => authStore.currentUser),
    isAuthenticated: computed(() => authStore.isLoggedIn),
    isLoading: computed(() => authStore.isLoggingIn),
    error: computed(() => authStore.errorMessage),
    hasError: computed(() => authStore.hasError),
    
    // User info
    userName: computed(() => authStore.userName),
    userEmail: computed(() => authStore.userEmail),
    userAvatar: computed(() => authStore.userAvatar),
    
    // User preferences
    userTheme: computed(() => authStore.userTheme),
    userTimezone: computed(() => authStore.userTimezone),
    userLanguage: computed(() => authStore.userLanguage),
    
    // Actions
    initAuth,
    login,
    register,
    logout,
    updateProfile,
    refreshToken,
    checkTokenExpiry,
    clearError
  }
} 