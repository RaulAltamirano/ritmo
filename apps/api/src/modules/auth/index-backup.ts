/**
 * 🔐 AUTH MODULE - RITMO API 2025
 *
 * Módulo de autenticación simplificado y optimizado
 * Solo incluye funcionalidad esencial y bien implementada
 */

import * as bcrypt from 'bcryptjs'
import * as crypto from 'crypto'
import { NextFunction, Request, Response } from 'express'
import { AuthValidator } from '../../api/validators/validation.system.js'
import prisma from '../../core/database/prisma.js'
import { ApiResponses } from '../../core/utils/apiResponse.js'
import { generateAccessToken } from '../../core/utils/jwtUtils.js'
import { StructuredLoggingService } from '../../infrastructure/logging/StructuredLoggingService.js'
import { SessionService } from '../../infrastructure/security/SessionService.js'
import { TokenRotationService } from '../../infrastructure/security/TokenRotationService.js'
import {
  AccountLockedException,
  AuthenticationException,
  ResourceAlreadyExistsException,
  ValidationException,
} from '../../shared/exceptions/app.exceptions.js'

// ========================================
// TYPES & DTOs
// ========================================

export interface RegisterDTO {
  email: string
  username: string
  password: string
  firstName?: string
  lastName?: string
  timezone?: string
  language?: string
}

export interface LoginDTO {
  email: string
  password: string
  rememberMe?: boolean
}

export interface AuthResponseDTO {
  user: UserDTO
  accessToken: string
  refreshToken: string
  sessionId: string
  deviceTrust?: 'high' | 'medium' | 'low'
}

export interface UserDTO {
  id: string
  email: string
  username: string
  firstName?: string
  lastName?: string
  avatar?: string
  timezone?: string
  language?: string
  isActive: boolean
  isEmailVerified: boolean
  role: string
  createdAt: Date
  updatedAt: Date
}

export interface PasswordResetRequestDTO {
  email: string
}

export interface PasswordResetDTO {
  token: string
  password: string
}

export interface PasswordChangeDTO {
  currentPassword: string
  newPassword: string
}

export interface ProfileUpdateDTO {
  firstName?: string
  lastName?: string
  timezone?: string
  language?: string
  avatar?: string
}

// ========================================
// AUTH SERVICE
// ========================================

export class AuthService {
  private readonly SALT_ROUNDS = 15
  private readonly MAX_FAILED_ATTEMPTS = 5
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes
  private sessionService: SessionService
  private loggingService: StructuredLoggingService
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
        timezone: validatedData.timezone || 'UTC',
        language: validatedData.language || 'es',
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
      deviceId: validatedData.deviceInfo?.deviceId || this.generateDeviceId(),
      deviceName: validatedData.deviceInfo?.deviceName || 'Unknown Device',
      deviceType: validatedData.deviceInfo?.deviceType || 'desktop',
      browser: validatedData.deviceInfo?.browser || 'Unknown',
      os: validatedData.deviceInfo?.os || 'Unknown',
      ipAddress: validatedData.deviceInfo?.ipAddress || '::1',
      userAgent: validatedData.deviceInfo?.userAgent || '',
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

  async changePassword(userId: string, passwordData: PasswordChangeDTO): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      passwordData.currentPassword,
      user.passwordHash,
    )
    if (!isCurrentPasswordValid) {
      throw new AuthenticationException('Current password is incorrect')
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(
      passwordData.newPassword,
      this.SALT_ROUNDS,
    )

    // Update user
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
        lastPasswordChange: new Date(),
      },
    })
  }

  async updateProfile(userId: string, profileData: ProfileUpdateDTO): Promise<UserDTO> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new Error('User not found')
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: profileData,
    })

    return this.toUserDTO(updatedUser)
  }

  async requestPasswordReset(emailData: PasswordResetRequestDTO): Promise<void> {
    // Validate input
    const validatedData = AuthValidator.passwordResetRequestSchema.parse(emailData)

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (!user) {
      // Don't reveal if user exists
      return
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex')

    // Store reset token
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    })

    // TODO: Send email with reset token
    console.log(`Password reset token for ${user.email}: ${resetToken}`)
  }

  async resetPassword(resetData: PasswordResetDTO): Promise<void> {
    // Validate input
    const validatedData = AuthValidator.passwordResetSchema.parse(resetData)

    const tokenHash = crypto
      .createHash('sha256')
      .update(validatedData.token)
      .digest('hex')

    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
    })

    if (!resetToken) {
      throw new ValidationException('Password reset token is invalid or has expired')
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(validatedData.password, this.SALT_ROUNDS)

    // Update user password
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: {
        passwordHash: newPasswordHash,
        lastPasswordChange: new Date(),
      },
    })

    // Mark token as used
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { isUsed: true },
    })
  }

  // Session Management Methods
  async getUserSessions(userId: string): Promise<any[]> {
    return await this.sessionService.findActiveSessions(userId)
  }

  async deactivateSession(sessionId: string, userId: string): Promise<void> {
    await this.sessionService.deactivateSession(sessionId, userId)
  }

  async deactivateAllSessions(userId: string): Promise<void> {
    await this.sessionService.deactivateAllUserSessions(userId)
  }

  async getSessionStats(userId: string): Promise<any> {
    return await this.sessionService.getSessionStats(userId)
  }

  // Private Methods
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

// ========================================
// AUTH CONTROLLER
// ========================================

export class AuthController {
  private authService: AuthService

  constructor() {
    this.authService = new AuthService()
  }

  async post(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const path = req.path

      if (path.includes('/register')) {
        await this.register(req, res)
      } else if (path.includes('/login')) {
        await this.login(req, res)
      } else if (path.includes('/refresh')) {
        await this.refresh(req, res)
      } else if (path.includes('/password-reset-request')) {
        await this.passwordResetRequest(req, res)
      } else if (path.includes('/password-reset')) {
        await this.passwordReset(req, res)
      } else {
        res.status(404).json({ error: 'Endpoint not found' })
      }
    } catch (error) {
      next(error)
    }
  }

  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const path = req.path

      if (path.includes('/me')) {
        await this.getMe(req, res)
      } else if (path.includes('/sessions')) {
        await this.getSessions(req, res)
      } else if (path.includes('/session-stats')) {
        await this.getSessionStats(req, res)
      } else {
        res.status(404).json({ error: 'Endpoint not found' })
      }
    } catch (error) {
      next(error)
    }
  }

  async put(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const path = req.path

      if (path.includes('/change-password')) {
        await this.changePassword(req, res)
      } else if (path.includes('/profile')) {
        await this.updateProfile(req, res)
      } else {
        res.status(404).json({ error: 'Endpoint not found' })
      }
    } catch (error) {
      next(error)
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const path = req.path

      if (path.includes('/logout')) {
        await this.logout(req, res)
      } else if (path.includes('/logout-all')) {
        await this.logoutAll(req, res)
      } else if (path.includes('/session/')) {
        await this.deactivateSession(req, res)
      } else {
        res.status(404).json({ error: 'Endpoint not found' })
      }
    } catch (error) {
      next(error)
    }
  }

  private async register(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.authService.register(req.body)
      ApiResponses.created(result, 'User registered successfully').send(res)
    } catch (error) {
      throw error // Re-throw para que el error handler lo maneje
    }
  }

  private async login(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.authService.login(req.body)

      // Set HttpOnly cookies for security
      res.cookie('access_token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 5 * 60 * 1000, // 5 minutes
      })

      res.cookie('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      })

      // Return both user data and tokens in response body
      ApiResponses.ok(result, 'Login successful').send(res)
    } catch (error) {
      if (error instanceof AuthenticationException) {
        ApiResponses.unauthorized('Invalid credentials').send(res, 401)
      } else if (error instanceof AccountLockedException) {
        ApiResponses.error(error.message, 'ACCOUNT_LOCKED').send(res, 423)
      } else {
        throw error
      }
    }
  }

  private async refresh(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refresh_token
      if (!refreshToken) {
        ApiResponses.unauthorized('Refresh token not found').send(res)
        return
      }

      // Get token info from database
      const tokenInfo = await this.getTokenInfo(refreshToken)
      if (!tokenInfo) {
        ApiResponses.unauthorized('Invalid refresh token').send(res)
        return
      }

      // Use TokenRotationService for secure token rotation
      const rotationResult =
        await this.authService.tokenRotationService.rotateRefreshToken(
          refreshToken,
          tokenInfo.userId,
          tokenInfo.sessionId,
          {
            ipAddress: req.ip || '::1',
            userAgent: req.headers['user-agent'] || '',
          },
        )

      if (!rotationResult.success) {
        ApiResponses.unauthorized(rotationResult.error || 'Token refresh failed').send(
          res,
        )
        return
      }

      // Set HttpOnly cookies for security
      res.cookie('access_token', rotationResult.newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 5 * 60 * 1000, // 5 minutes
      })

      res.cookie('refresh_token', rotationResult.newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      })

      ApiResponses.ok(
        {
          message: 'Token refreshed successfully',
          accessToken: rotationResult.newAccessToken,
          refreshToken: rotationResult.newRefreshToken,
        },
        'Token refreshed successfully',
      ).send(res)
    } catch (error) {
      console.error('Refresh error:', error)
      ApiResponses.error('Token refresh failed', 'TOKEN_REFRESH_ERROR').send(res)
    }
  }

  private async getTokenInfo(
    refreshToken: string,
  ): Promise<{ userId: string; sessionId: string } | null> {
    try {
      // Hash the token to find it in the database
      const crypto = await import('crypto')
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

      return tokenRecord && tokenRecord.sessionId
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

  private async getMe(req: Request, res: Response): Promise<void> {
    // User data should be available from authenticateToken middleware
    const user = (req as any).user

    if (!user) {
      ApiResponses.unauthorized('User not found').send(res, 401)
      return
    }

    ApiResponses.ok({ user }, 'Current user retrieved').send(res)
  }

  private async changePassword(req: Request, res: Response): Promise<void> {
    const user = (req as any).user
    if (!user) {
      ApiResponses.unauthorized('User not authenticated').send(res, 401)
      return
    }

    await this.authService.changePassword(user.id, req.body)
    ApiResponses.ok(null, 'Password changed successfully').send(res)
  }

  private async updateProfile(req: Request, res: Response): Promise<void> {
    const user = (req as any).user
    if (!user) {
      ApiResponses.unauthorized('User not authenticated').send(res, 401)
      return
    }

    const result = await this.authService.updateProfile(user.id, req.body)
    ApiResponses.ok({ user: result }, 'Profile updated successfully').send(res)
  }

  private async passwordResetRequest(req: Request, res: Response): Promise<void> {
    await this.authService.requestPasswordReset(req.body)
    ApiResponses.ok(null, 'Password reset email sent').send(res)
  }

  private async passwordReset(req: Request, res: Response): Promise<void> {
    await this.authService.resetPassword(req.body)
    ApiResponses.ok(null, 'Password reset successfully').send(res)
  }

  private async getSessions(req: Request, res: Response): Promise<void> {
    const user = (req as any).user
    if (!user) {
      ApiResponses.unauthorized('User not authenticated').send(res, 401)
      return
    }

    const sessions = await this.authService.getUserSessions(user.id)
    ApiResponses.ok({ sessions }, 'User sessions retrieved').send(res)
  }

  private async getSessionStats(req: Request, res: Response): Promise<void> {
    const user = (req as any).user
    if (!user) {
      ApiResponses.unauthorized('User not authenticated').send(res, 401)
      return
    }

    const stats = await this.authService.getSessionStats(user.id)
    ApiResponses.ok({ stats }, 'Session statistics retrieved').send(res)
  }

  private async logout(_req: Request, res: Response): Promise<void> {
    // Clear cookies
    res.clearCookie('access_token')
    res.clearCookie('refresh_token')

    ApiResponses.ok(null, 'Logout successful').send(res)
  }

  private async logoutAll(req: Request, res: Response): Promise<void> {
    const user = (req as any).user
    if (!user) {
      ApiResponses.unauthorized('User not authenticated').send(res, 401)
      return
    }

    // Deactivate all sessions
    await this.authService.deactivateAllSessions(user.id)

    // Clear cookies
    res.clearCookie('access_token')
    res.clearCookie('refresh_token')

    ApiResponses.ok(null, 'All sessions deactivated').send(res)
  }

  private async deactivateSession(req: Request, res: Response): Promise<void> {
    const user = (req as any).user
    if (!user) {
      ApiResponses.unauthorized('User not authenticated').send(res, 401)
      return
    }

    const sessionId = req.params.sessionId
    if (!sessionId) {
      ApiResponses.badRequest('Session ID required').send(res, 400)
      return
    }

    await this.authService.deactivateSession(sessionId, user.id)
    ApiResponses.ok(null, 'Session deactivated').send(res)
  }
}

// ========================================
