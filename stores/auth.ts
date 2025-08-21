import { defineStore } from 'pinia'
import type { 
  AuthUser, 
  AuthState, 
  LoginCredentials, 
  RegisterCredentials,
  AuthTokens,
  AuthError 
} from '../types/auth'

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  }),

  getters: {
    // User information
    currentUser: (state): AuthUser | null => state.user,
    userName: (state): string => state.user?.name || 'Usuario',
    userEmail: (state): string => state.user?.email || '',
    userAvatar: (state): string | undefined => state.user?.avatar,
    
    // Authentication status
    isLoggedIn: (state): boolean => state.isAuthenticated && !!state.user,
    hasValidToken: (state): boolean => !!state.token,
    
    // Loading states
    isLoggingIn: (state): boolean => state.isLoading,
    
    // Error handling
    hasError: (state): boolean => !!state.error,
    errorMessage: (state): string | null => state.error,
    
    // User preferences
    userTheme: (state): string => state.user?.preferences?.theme || 'system',
    userTimezone: (state): string => state.user?.profile?.timezone || 'UTC',
    userLanguage: (state): string => state.user?.profile?.language || 'es'
  },

  actions: {
    /**
     * Initialize authentication state
     */
    async initAuth() {
      if (process.client) {
        this.isLoading = true
        this.error = null
        
        try {
          // Check if we have stored auth data
          const storedUser = localStorage.getItem('auth_user')
          const storedTokens = sessionStorage.getItem('auth_tokens')
          
          if (!storedUser || !storedTokens) {
            console.log('No stored authentication data found')
            return
          }
          
          // Try to get user data from server
          const response = await $fetch<{ success: boolean; data: AuthUser }>('/api/auth/me')
          
          if (response.success && response.data) {
            this.setUser(response.data)
            this.setAuthenticated(true)
          }
        } catch (error) {
          // Clear any invalid tokens
          this.clearAuth()
          console.log('No valid session found, clearing auth data')
        } finally {
          this.isLoading = false
        }
      }
    },

    /**
     * Login user
     */
    async login(credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await $fetch<{ 
          success: boolean; 
          data: { user: AuthUser; tokens: AuthTokens }; 
          message: string 
        }>('/api/auth/login', {
          method: 'POST',
          body: credentials
        })

        if (response.success && response.data) {
          this.setUser(response.data.user)
          this.setTokens(response.data.tokens)
          this.setAuthenticated(true)
          
          // Emit auth event
          this.emitAuthEvent('login', response.data.user)
          
          return { success: true }
        } else {
          throw new Error('Login failed')
        }
      } catch (error: any) {
        const errorMessage = error.data?.statusMessage || error.message || 'Login failed'
        this.setError(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Register new user
     */
    async register(credentials: RegisterCredentials): Promise<{ success: boolean; error?: string }> {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await $fetch<{ 
          success: boolean; 
          data: { user: AuthUser; tokens: AuthTokens }; 
          message: string 
        }>('/api/auth/register', {
          method: 'POST',
          body: credentials
        })

        if (response.success && response.data) {
          this.setUser(response.data.user)
          this.setTokens(response.data.tokens)
          this.setAuthenticated(true)
          
          // Emit auth event
          this.emitAuthEvent('register', response.data.user)
          
          return { success: true }
        } else {
          throw new Error('Registration failed')
        }
      } catch (error: any) {
        const errorMessage = error.data?.statusMessage || error.message || 'Registration failed'
        this.setError(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Logout user
     */
    async logout() {
      this.isLoading = true
      
      try {
        // Call logout endpoint to clear server-side cookies
        await $fetch('/api/auth/logout', { method: 'POST' })
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        // Clear local state regardless of server response
        const user = this.user
        this.clearAuth()
        
        // Emit auth event
        this.emitAuthEvent('logout', user)
        
        this.isLoading = false
        
        // Navigate to login page
        await navigateTo('/login')
      }
    },

    /**
     * Refresh access token
     */
    async refreshToken(): Promise<boolean> {
      try {
        const response = await $fetch<{ 
          success: boolean; 
          data: { accessToken: string; expiresIn: number } 
        }>('/api/auth/refresh', {
          method: 'POST'
        })

        if (response.success && response.data) {
          this.token = response.data.accessToken
          return true
        }
        return false
      } catch (error) {
        console.error('Token refresh failed:', error)
        // If refresh fails, logout user
        await this.logout()
        return false
      }
    },

    /**
     * Update user profile
     */
    async updateProfile(profileData: Partial<AuthUser>): Promise<{ success: boolean; error?: string }> {
      try {
        const response = await $fetch<{ success: boolean; data: AuthUser }>('/api/user/profile', {
          method: 'PUT',
          body: profileData
        })

        if (response.success && response.data) {
          this.setUser(response.data)
          return { success: true }
        } else {
          throw new Error('Profile update failed')
        }
      } catch (error: any) {
        const errorMessage = error.data?.statusMessage || error.message || 'Profile update failed'
        this.setError(errorMessage)
        return { success: false, error: errorMessage }
      }
    },

    /**
     * Clear authentication state
     */
    clearAuth() {
      this.user = null
      this.token = null
      this.refreshToken = null
      this.isAuthenticated = false
      this.error = null
      
      // Clear client-side storage
      if (process.client) {
        localStorage.removeItem('auth_user')
        sessionStorage.removeItem('auth_tokens')
      }
    },

    /**
     * Set user data
     */
    setUser(user: AuthUser) {
      this.user = user
      
      // Store in localStorage for persistence
      if (process.client) {
        localStorage.setItem('auth_user', JSON.stringify(user))
      }
    },

    /**
     * Set authentication tokens
     */
    setTokens(tokens: AuthTokens) {
      this.token = tokens.accessToken
      this.refreshToken = tokens.refreshToken
      
      // Store refresh token in sessionStorage
      if (process.client) {
        sessionStorage.setItem('auth_tokens', JSON.stringify({
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn
        }))
      }
    },

    /**
     * Set authentication status
     */
    setAuthenticated(status: boolean) {
      this.isAuthenticated = status
    },

    /**
     * Set error message
     */
    setError(message: string) {
      this.error = message
      
      // Auto-clear error after 5 seconds
      if (process.client) {
        setTimeout(() => {
          this.error = null
        }, 5000)
      }
    },

    /**
     * Clear error message
     */
    clearError() {
      this.error = null
    },

    /**
     * Emit authentication events
     */
    emitAuthEvent(type: 'login' | 'logout' | 'register' | 'token_refresh', user?: AuthUser | null) {
      if (process.client) {
        // Emit custom event for other components to listen
        window.dispatchEvent(new CustomEvent('auth-event', {
          detail: {
            type,
            user,
            timestamp: new Date()
          }
        }))
      }
    },

    /**
     * Check if token needs refresh
     */
    async checkTokenExpiry() {
      if (!this.token) return false
      
      try {
        // Decode JWT to check expiry (without verification for client-side check)
        const payload = JSON.parse(atob(this.token.split('.')[1]))
        const expiryTime = payload.exp * 1000 // Convert to milliseconds
        const currentTime = Date.now()
        
        // If token expires in less than 5 minutes, refresh it
        if (expiryTime - currentTime < 5 * 60 * 1000) {
          return await this.refreshToken()
        }
        
        return true
      } catch (error) {
        console.error('Token expiry check failed:', error)
        return false
      }
    }
  }
})
