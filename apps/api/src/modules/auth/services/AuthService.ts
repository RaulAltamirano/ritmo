/**
 * 🔐 AUTH SERVICE - RITMO API 2025
 *
 * Servicio principal de autenticación
 * Maneja registro, login y refresh de tokens
 */

import * as bcrypt from 'bcryptjs'
import * as crypto from 'crypto'
import { AuthValidator } from '../../../api/validators/validation.system.js'
import prisma from '../../../core/database/prisma.js'
import { generateAccessToken } from '../../../core/utils/jwtUtils.js'
import { StructuredLoggingService } from '../../../infrastructure/logging/StructuredLoggingService.js'
import { SessionService } from '../../../infrastructure/security/SessionService.js'
import { TokenRotationService } from '../../../infrastructure/security/TokenRotationService.js'
import {
  AccountLockedException,
  AuthenticationException,
  ResourceAlreadyExistsException,
} from '../../../shared/exceptions/app.exceptions.js'
import { AuthResponseDTO, LoginDTO, RegisterDTO, UserDTO } from '../dto/AuthDTOs.js'

export class AuthService {
  private readonly SALT_ROUNDS = 15
  private readonly MAX_FAILED_ATTEMPTS = 5
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes
  private readonly sessionService: SessionService
  private readonly loggingService: StructuredLoggingService
  public tokenRotationService: TokenRotationService

  constructor() {
    this.sessionService = new SessionService(prisma)
    this.loggingService = new StructuredLoggingService(prisma)
    this.tokenRotationService = new TokenRotationService(prisma)
  }

  async register(registerData: RegisterDTO): Promise<AuthResponseDTO> {
    // Validate input
    const validatedData = AuthValidator.registerSchema.parse(registerData)

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: validatedData.email }, { username: validatedData.username }],
      },
    })

    if (existingUser) {
      throw new ResourceAlreadyExistsException(
        'User with this email or username already exists',
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validatedData.password, this.SALT_ROUNDS)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        username: validatedData.username,
        passwordHash,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        timezone: validatedData.timezone ?? 'UTC',
        language: validatedData.language ?? 'es',
        isActive: true,
        isEmailVerified: false,
        role: 'user',
        failedLoginAttempts: 0,
      },
    })

    // Generate tokens
    const sessionId = this.generateSessionId()
    const accessToken = generateAccessToken(user.id, sessionId)

    // Create token family and get refresh token
    const refreshToken = await this.tokenRotationService.createTokenFamily(
      user.id,
      sessionId,
    )

    return {
      user: this.toUserDTO(user),
      accessToken,
      refreshToken,
      sessionId,
    }
  }

  async login(loginData: LoginDTO): Promise<AuthResponseDTO> {
    // Validate input
    const validatedData = AuthValidator.loginSchema.parse(loginData)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (!user) {
      throw new AuthenticationException('Invalid credentials')
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new AccountLockedException()
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      validatedData.password,
      user.passwordHash,
    )
    if (!isPasswordValid) {
      await this.handleFailedLogin(user.id)
      throw new AuthenticationException('Invalid credentials')
    }

    // Reset failed attempts
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    })

    // Generate session ID and tokens
    const sessionId = this.generateSessionId()
    const accessToken = generateAccessToken(user.id, sessionId)

    // Create token family and get refresh token
    const refreshToken = await this.tokenRotationService.createTokenFamily(
      user.id,
      sessionId,
    )

    // Create or update session using SessionService
    const deviceInfo = {
      deviceId: validatedData.deviceInfo?.deviceId ?? this.generateDeviceId(),
      deviceName: validatedData.deviceInfo?.deviceName ?? 'Unknown Device',
      deviceType: validatedData.deviceInfo?.deviceType ?? 'desktop',
      browser: validatedData.deviceInfo?.browser ?? 'Unknown',
      os: validatedData.deviceInfo?.os ?? 'Unknown',
      ipAddress: validatedData.deviceInfo?.ipAddress ?? '::1',
      userAgent: validatedData.deviceInfo?.userAgent ?? '',
    }

    // Debug: Log what we're receiving
    console.log('🔍 DEBUG - Device info received:', {
      deviceId: deviceInfo.deviceId,
      deviceName: deviceInfo.deviceName,
      deviceType: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      userAgent: deviceInfo.userAgent,
      userAgentLength: deviceInfo.userAgent?.length ?? 0,
    })

    // Validate device fingerprint consistency
    if (validatedData.deviceInfo?.deviceId) {
      console.log('✅ Using frontend-generated device ID:', deviceInfo.deviceId)
    } else {
      console.log(
        '⚠️  No device ID from frontend, using backend fallback:',
        deviceInfo.deviceId,
      )
    }

    try {
      const sessionResult = await this.sessionService.intelligentLogin(
        user.id,
        deviceInfo,
        sessionId,
        deviceInfo.ipAddress,
      )

      // Log successful login
      await this.loggingService.logAuthEvent(
        'login_success',
        user.id,
        sessionId,
        deviceInfo.ipAddress,
        deviceInfo.userAgent,
        'User logged in successfully',
        'low',
        { deviceTrust: sessionResult.deviceTrust },
      )

      return {
        user: this.toUserDTO(user),
        accessToken,
        refreshToken,
        sessionId,
        deviceTrust: sessionResult.deviceTrust,
      }
    } catch (sessionError) {
      // If session creation fails, still return tokens but log the error
      console.error('Session creation failed:', sessionError)

      // Log session creation failure
      await this.loggingService.logAuthEvent(
        'login_success',
        user.id,
        sessionId,
        deviceInfo.ipAddress,
        deviceInfo.userAgent,
        'Login successful but session creation failed',
        'medium',
        { sessionError: (sessionError as Error).message },
      )

      return {
        user: this.toUserDTO(user),
        accessToken,
        refreshToken,
        sessionId,
      }
    }
  }

  async refreshToken(
    refreshToken: string,
    context: { ipAddress: string; userAgent: string },
  ): Promise<{
    success: boolean
    newAccessToken?: string
    newRefreshToken?: string
    error?: string
  }> {
    try {
      // Get token info from database
      const tokenInfo = await this.getTokenInfo(refreshToken)
      if (!tokenInfo) {
        return { success: false, error: 'Invalid refresh token' }
      }

      const sessionIsActive = await this.sessionService.isSessionActive(
        tokenInfo.sessionId,
      )
      if (!sessionIsActive) {
        return { success: false, error: 'Session is invalid or expired' }
      }

      // Use TokenRotationService for secure token rotation
      const rotationResult = await this.tokenRotationService.rotateRefreshToken(
        refreshToken,
        tokenInfo.userId,
        tokenInfo.sessionId,
        context,
      )

      if (!rotationResult.success) {
        return {
          success: false,
          error: rotationResult.error,
        }
      }

      const extended = await this.sessionService.extendSessionOnRefresh(
        tokenInfo.sessionId,
      )
      if (!extended) {
        return { success: false, error: 'Session is invalid or expired' }
      }

      return {
        success: true,
        newAccessToken: rotationResult.newAccessToken,
        newRefreshToken: rotationResult.newRefreshToken,
      }
    } catch (error) {
      console.error('Token refresh error:', error)
      return { success: false, error: 'Token refresh failed' }
    }
  }

  async logoutWithRefreshToken(refreshToken: string): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')
    const tokenRecord = await prisma.refreshToken.findFirst({
      where: { tokenHash },
      select: { familyId: true, sessionId: true },
    })

    if (!tokenRecord) return

    await this.tokenRotationService.revokeTokenFamily(tokenRecord.familyId, 'logout')
    if (!tokenRecord.sessionId) return

    await prisma.userSession.updateMany({
      where: { sessionId: tokenRecord.sessionId, isActive: true },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    })
  }

  private async getTokenInfo(
    refreshToken: string,
  ): Promise<{ userId: string; sessionId: string } | null> {
    try {
      // Hash the token to find it in the database
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')

      const tokenRecord = await prisma.refreshToken.findFirst({
        where: {
          tokenHash,
          isRevoked: false,
          expiresAt: { gt: new Date() },
        },
        select: {
          userId: true,
          sessionId: true,
        },
      })

      return tokenRecord?.sessionId
        ? {
            userId: tokenRecord.userId,
            sessionId: tokenRecord.sessionId,
          }
        : null
    } catch (error) {
      console.error('Error getting token info:', error)
      return null
    }
  }

  private async handleFailedLogin(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) return

    const newFailedAttempts = user.failedLoginAttempts + 1
    const shouldLockAccount = newFailedAttempts >= this.MAX_FAILED_ATTEMPTS

    await prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: newFailedAttempts,
        lockedUntil: shouldLockAccount
          ? new Date(Date.now() + this.LOCKOUT_DURATION)
          : null,
      },
    })

    // Log failed login attempt
    await this.loggingService.logAuthEvent(
      'login_failed',
      userId,
      null,
      undefined,
      undefined,
      `Failed login attempt ${newFailedAttempts}/${this.MAX_FAILED_ATTEMPTS}`,
      shouldLockAccount ? 'high' : 'medium',
      { failedAttempts: newFailedAttempts, accountLocked: shouldLockAccount },
    )
  }

  private generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  private generateDeviceId(): string {
    return crypto.randomBytes(16).toString('hex')
  }

  private toUserDTO(user: any): UserDTO {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      timezone: user.timezone,
      language: user.language,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }
}
