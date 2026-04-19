/**
 * 🚀 RITMO AUTH API - 2025 BEST PRACTICES
 *
 * Authentication API calls using HttpOnly cookies only
 * All methods return standardized responses and handle errors consistently
 */

import { API_ENDPOINTS } from '@/constants/api'
import {
  type LoginResponse,
  type ProfileResponse,
  type RegisterResponse,
  type SecurityLogsResponse,
  type SessionStatsResponse,
  type SessionsResponse,
  type SuccessResponse,
} from '@/types/api.d'
import { type AuthUser } from '@/types/auth'
import { useHttpClient } from '../shared/useHttpClient'

export const useAuthAPI = () => {
  const http = useHttpClient()

  // Standardized error handling
  const handleApiError = (error: any, defaultMessage: string): never => {
    const errorMessage = error?.userMessage || error?.message || defaultMessage
    console.error(`API Error: ${defaultMessage}`, error)
    throw new Error(errorMessage)
  }

  /**
   * User login with standardized response handling
   */
  const login = async (credentials: {
    email: string
    password: string
  }): Promise<LoginResponse> => {
    try {
      // Get device fingerprint for security
      const { getCurrentDeviceFingerprint } = await import(
        '../../utils/deviceFingerprint'
      )
      const deviceFingerprint = await getCurrentDeviceFingerprint()

      // Debug: Log what we're sending
      console.log('🔍 FRONTEND DEBUG - Device fingerprint:', {
        deviceId: deviceFingerprint.deviceId,
        deviceName: deviceFingerprint.deviceInfo?.deviceName,
        deviceType: deviceFingerprint.deviceInfo?.deviceType,
        browser: deviceFingerprint.deviceInfo?.browser,
        os: deviceFingerprint.deviceInfo?.os,
        userAgent: deviceFingerprint.deviceInfo?.userAgent,
        screenResolution: deviceFingerprint.deviceInfo?.screenResolution,
        hardwareConcurrency: deviceFingerprint.deviceInfo?.hardwareConcurrency,
        timezone: deviceFingerprint.deviceInfo?.timezone,
        language: deviceFingerprint.deviceInfo?.language,
      })

      // Prepare login data with device info
      const loginData = {
        ...credentials,
        deviceInfo: {
          deviceId: deviceFingerprint.deviceId,
          deviceName: deviceFingerprint.deviceInfo?.deviceName,
          deviceType: deviceFingerprint.deviceInfo?.deviceType,
          browser: deviceFingerprint.deviceInfo?.browser,
          os: deviceFingerprint.deviceInfo?.os,
          userAgent: deviceFingerprint.deviceInfo?.userAgent,
          // Send additional components for backend validation
          screenResolution: deviceFingerprint.deviceInfo?.screenResolution,
          hardwareConcurrency: deviceFingerprint.deviceInfo?.hardwareConcurrency,
          timezone: deviceFingerprint.deviceInfo?.timezone,
          language: deviceFingerprint.deviceInfo?.language,
        },
      }

      const response = await http.post<{
        user: AuthUser
        tokens: {
          accessToken: string
          refreshToken: string
        }
      }>(API_ENDPOINTS.AUTH.LOGIN, loginData, {
        credentials: 'include', // Ensure HttpOnly cookies are sent
      })

      return response
    } catch (error) {
      return handleApiError(error, 'Login failed')
    }
  }

  /**
   * User registration with standardized response handling
   */
  const register = async (userData: {
    email: string
    username: string
    password: string
    firstName?: string
    lastName?: string
  }): Promise<RegisterResponse> => {
    try {
      // Get device fingerprint for security
      const { getCurrentDeviceFingerprint } = await import(
        '../../utils/deviceFingerprint'
      )
      const deviceFingerprint = await getCurrentDeviceFingerprint()

      // Debug: Log what we're sending
      console.log('🔍 FRONTEND DEBUG - Device fingerprint (register):', {
        deviceId: deviceFingerprint.deviceId,
        deviceName: deviceFingerprint.deviceInfo?.deviceName,
        deviceType: deviceFingerprint.deviceInfo?.deviceType,
        browser: deviceFingerprint.deviceInfo?.browser,
        os: deviceFingerprint.deviceInfo?.os,
        userAgent: deviceFingerprint.deviceInfo?.userAgent,
        screenResolution: deviceFingerprint.deviceInfo?.screenResolution,
        hardwareConcurrency: deviceFingerprint.deviceInfo?.hardwareConcurrency,
        timezone: deviceFingerprint.deviceInfo?.timezone,
        language: deviceFingerprint.deviceInfo?.language,
      })

      // Prepare registration data with device info
      const registrationData = {
        ...userData,
        deviceInfo: {
          deviceId: deviceFingerprint.deviceId,
          deviceName: deviceFingerprint.deviceInfo?.deviceName,
          deviceType: deviceFingerprint.deviceInfo?.deviceType,
          browser: deviceFingerprint.deviceInfo?.browser,
          os: deviceFingerprint.deviceInfo?.os,
          userAgent: deviceFingerprint.deviceInfo?.userAgent,
          // Send additional components for backend validation
          screenResolution: deviceFingerprint.deviceInfo?.screenResolution,
          hardwareConcurrency: deviceFingerprint.deviceInfo?.hardwareConcurrency,
          timezone: deviceFingerprint.deviceInfo?.timezone,
          language: deviceFingerprint.deviceInfo?.language,
        },
      }

      const response = await http.post<{
        user: AuthUser
        tokens: {
          accessToken: string
          refreshToken: string
        }
      }>(API_ENDPOINTS.AUTH.REGISTER, registrationData, {
        credentials: 'include', // Ensure HttpOnly cookies are sent
      })

      return response
    } catch (error) {
      return handleApiError(error, 'Registration failed')
    }
  }

  /**
   * User logout with standardized response handling
   */
  const logout = async (): Promise<SuccessResponse<{ message: string }>> => {
    try {
      const response = await http.post<{ message: string }>(
        API_ENDPOINTS.AUTH.LOGOUT,
        {},
        {
          credentials: 'include', // Ensure HttpOnly cookies are sent
        },
      )

      return response
    } catch (error) {
      return handleApiError(error, 'Logout failed')
    }
  }

  /**
   * User logout from all devices with standardized response handling
   */
  const logoutAllDevices = async (): Promise<SuccessResponse<{ message: string }>> => {
    try {
      const { useAuthenticatedHttpClient } = await import(
        './useAuthenticatedHttpClient'
      )
      const authHttp = useAuthenticatedHttpClient()

      const response = await authHttp.post<{ message: string }>(
        API_ENDPOINTS.AUTH.LOGOUT_ALL,
        {},
      )
      return response
    } catch (error) {
      return handleApiError(error, 'Logout all devices failed')
    }
  }

  /**
   * Verify authentication with standardized response handling
   * This method will be called by the authenticated HTTP client
   */
  const verifyAuthentication = async (): Promise<ProfileResponse> => {
    try {
      const { useAuthenticatedHttpClient } = await import(
        './useAuthenticatedHttpClient'
      )
      const authHttp = useAuthenticatedHttpClient()

      const response = await authHttp.get<AuthUser>(API_ENDPOINTS.AUTH.ME)

      return response
    } catch (error) {
      return handleApiError(error, 'Authentication verification failed')
    }
  }

  /**
   * Update user profile with standardized response handling
   */
  const updateProfile = async (
    profileData: Partial<AuthUser>,
  ): Promise<ProfileResponse> => {
    try {
      const { useAuthenticatedHttpClient } = await import(
        './useAuthenticatedHttpClient'
      )
      const authHttp = useAuthenticatedHttpClient()

      const response = await authHttp.put<AuthUser>(
        API_ENDPOINTS.USERS.PROFILE,
        profileData,
      )
      return response
    } catch (error) {
      return handleApiError(error, 'Update profile failed')
    }
  }

  /**
   * Refresh access token with standardized response handling
   * This method is used internally by the server via HttpOnly cookies
   */
  const refreshToken = async (): Promise<
    SuccessResponse<{ accessToken: string; expiresIn: number }>
  > => {
    try {
      const response = await http.post<{ accessToken: string; expiresIn: number }>(
        API_ENDPOINTS.AUTH.REFRESH,
        {},
        {
          credentials: 'include', // Ensure HttpOnly cookies are sent
        },
      )
      return response
    } catch (error) {
      return handleApiError(error, 'Token refresh failed')
    }
  }

  /**
   * Get user sessions with standardized response handling
   */
  const getSessions = async (): Promise<SessionsResponse> => {
    try {
      const { useAuthenticatedHttpClient } = await import(
        './useAuthenticatedHttpClient'
      )
      const authHttp = useAuthenticatedHttpClient()

      const response = await authHttp.get<{ sessions: any[] }>(
        API_ENDPOINTS.AUTH.SESSIONS,
      )
      return response
    } catch (error) {
      return handleApiError(error, 'Get sessions failed')
    }
  }

  /**
   * Terminate a specific session with standardized response handling
   */
  const terminateSession = async (
    sessionId: string,
  ): Promise<SuccessResponse<{ message: string }>> => {
    try {
      const { useAuthenticatedHttpClient } = await import(
        './useAuthenticatedHttpClient'
      )
      const authHttp = useAuthenticatedHttpClient()

      const response = await authHttp.del<{ message: string }>(
        `${API_ENDPOINTS.AUTH.SESSIONS}/${sessionId}`,
      )
      return response
    } catch (error) {
      return handleApiError(error, 'Terminate session failed')
    }
  }

  /**
   * Get session statistics with standardized response handling
   */
  const getSessionStats = async (): Promise<SessionStatsResponse> => {
    try {
      const { useAuthenticatedHttpClient } = await import(
        './useAuthenticatedHttpClient'
      )
      const authHttp = useAuthenticatedHttpClient()

      const response = await authHttp.get<{ stats: any }>('/auth/session-stats')
      return response
    } catch (error) {
      return handleApiError(error, 'Get session stats failed')
    }
  }

  /**
   * Get security logs with standardized response handling
   */
  const getSecurityLogs = async (): Promise<SecurityLogsResponse> => {
    try {
      const { useAuthenticatedHttpClient } = await import(
        './useAuthenticatedHttpClient'
      )
      const authHttp = useAuthenticatedHttpClient()

      const response = await authHttp.get<{ logs: any[] }>(
        API_ENDPOINTS.AUTH.SECURITY_LOGS,
      )
      return response
    } catch (error) {
      return handleApiError(error, 'Get security logs failed')
    }
  }

  /**
   * Request password reset with standardized response handling
   */
  const requestPasswordReset = async (
    email: string,
  ): Promise<SuccessResponse<{ message: string }>> => {
    try {
      const response = await http.post<{ message: string }>(
        API_ENDPOINTS.AUTH.PASSWORD_RESET_REQUEST,
        { email },
        {
          credentials: 'include', // Ensure HttpOnly cookies are sent
        },
      )
      return response
    } catch (error) {
      return handleApiError(error, 'Password reset request failed')
    }
  }

  /**
   * Reset password with token with standardized response handling
   */
  const resetPassword = async (
    token: string,
    newPassword: string,
  ): Promise<SuccessResponse<{ message: string }>> => {
    try {
      const response = await http.post<{ message: string }>(
        API_ENDPOINTS.AUTH.PASSWORD_RESET,
        { token, newPassword },
        {
          credentials: 'include', // Ensure HttpOnly cookies are sent
        },
      )
      return response
    } catch (error) {
      return handleApiError(error, 'Password reset failed')
    }
  }

  /**
   * Device challenge with standardized response handling
   */
  const deviceChallenge = async (
    deviceData: any,
  ): Promise<SuccessResponse<{ message: string }>> => {
    try {
      const response = await http.post<{ message: string }>(
        '/auth/device-challenge',
        deviceData,
        {
          credentials: 'include', // Ensure HttpOnly cookies are sent
        },
      )
      return response
    } catch (error) {
      return handleApiError(error, 'Device challenge failed')
    }
  }

  /**
   * Delete account with standardized response handling
   */
  const deleteAccount = async (
    password: string,
  ): Promise<SuccessResponse<{ message: string }>> => {
    try {
      const { useAuthenticatedHttpClient } = await import(
        './useAuthenticatedHttpClient'
      )
      const authHttp = useAuthenticatedHttpClient()

      const response = await authHttp.del<{ message: string }>(
        API_ENDPOINTS.AUTH.DELETE_ACCOUNT,
      )
      return response
    } catch (error) {
      return handleApiError(error, 'Account deletion failed')
    }
  }

  /**
   * Verify email with standardized response handling
   */
  const verifyEmail = async (
    token: string,
  ): Promise<SuccessResponse<{ message: string }>> => {
    try {
      const response = await http.post<{ message: string }>(
        API_ENDPOINTS.AUTH.VERIFY_EMAIL,
        { token },
        {
          credentials: 'include', // Ensure HttpOnly cookies are sent
        },
      )
      return response
    } catch (error) {
      return handleApiError(error, 'Email verification failed')
    }
  }

  /**
   * Resend email verification with standardized response handling
   */
  const resendVerification = async (
    email: string,
  ): Promise<SuccessResponse<{ message: string }>> => {
    try {
      const response = await http.post<{ message: string }>(
        API_ENDPOINTS.AUTH.RESEND_VERIFICATION,
        { email },
        {
          credentials: 'include', // Ensure HttpOnly cookies are sent
        },
      )
      return response
    } catch (error) {
      return handleApiError(error, 'Verification resend failed')
    }
  }

  /**
   * Change password with standardized response handling
   */
  const changePassword = async (
    currentPassword: string,
    newPassword: string,
  ): Promise<SuccessResponse<{ message: string }>> => {
    try {
      const { useAuthenticatedHttpClient } = await import(
        './useAuthenticatedHttpClient'
      )
      const authHttp = useAuthenticatedHttpClient()

      const response = await authHttp.put<{ message: string }>(
        API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
        {
          currentPassword,
          newPassword,
        },
      )
      return response
    } catch (error) {
      return handleApiError(error, 'Password change failed')
    }
  }

  return {
    // Authentication methods
    login,
    register,
    logout,
    logoutAllDevices,
    verifyAuthentication,
    refreshToken,

    // Profile methods
    updateProfile,

    // Session methods
    getSessions,
    terminateSession,
    getSessionStats,

    // Security methods
    getSecurityLogs,
    requestPasswordReset,
    resetPassword,
    deviceChallenge,

    // Account management methods
    deleteAccount,
    verifyEmail,
    resendVerification,
    changePassword,
  }
}
