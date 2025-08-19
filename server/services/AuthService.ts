import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { 
  LoginCredentials, 
  RegisterCredentials, 
  AuthUser, 
  AuthTokens,
  AuthError,
  AuthErrorCode 
} from '~/types/auth'

export class AuthService {
  private prisma: PrismaClient
  private readonly JWT_SECRET: string
  private readonly JWT_REFRESH_SECRET: string
  private readonly ACCESS_TOKEN_EXPIRY = '15m'
  private readonly REFRESH_TOKEN_EXPIRY = '7d'

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
    this.JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
    this.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production'
  }

  /**
   * Register a new user
   */
  async register(credentials: RegisterCredentials): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    try {
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: credentials.email }
      })

      if (existingUser) {
        throw this.createAuthError(AuthErrorCode.EMAIL_ALREADY_EXISTS, 'Email already registered')
      }

      // Validate password strength
      if (!this.isPasswordStrong(credentials.password)) {
        throw this.createAuthError(AuthErrorCode.WEAK_PASSWORD, 'Password must be at least 8 characters with uppercase, lowercase, number and special character')
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(credentials.password, 12)

      // Create user with transaction
      const result = await this.prisma.$transaction(async (tx) => {
        // Create user
        const user = await tx.user.create({
          data: {
            email: credentials.email,
            name: credentials.name,
            password: hashedPassword,
            emailVerified: false
          },
          include: {
            profiles: true,
            preferences: true
          }
        })

        // Create default profile
        const profile = await tx.profile.create({
          data: {
            userId: user.id,
            timezone: 'UTC',
            language: 'es'
          }
        })

        // Create default preferences
        const preferences = await tx.userPreference.createMany({
          data: [
            { userId: user.id, key: 'theme', value: 'system' },
            { userId: user.id, key: 'notifications_email', value: 'true' },
            { userId: user.id, key: 'notifications_push', value: 'true' },
            { userId: user.id, key: 'notifications_reminders', value: 'true' },
            { userId: user.id, key: 'privacy_profile_visibility', value: 'private' },
            { userId: user.id, key: 'privacy_activity_visibility', value: 'private' }
          ]
        })

        return { user, profile }
      })

      // Generate tokens
      const tokens = this.generateTokens(result.user.id)

      // Return user without password
      const authUser: AuthUser = {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        avatar: result.user.avatar,
        emailVerified: result.user.emailVerified,
        createdAt: result.user.createdAt.toISOString(),
        updatedAt: result.user.updatedAt.toISOString(),
        profile: {
          id: result.profile.id,
          userId: result.profile.userId,
          bio: result.profile.bio,
          timezone: result.profile.timezone,
          language: result.profile.language,
          createdAt: result.profile.createdAt.toISOString(),
          updatedAt: result.profile.updatedAt.toISOString()
        }
      }

      return { user: authUser, tokens }
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        throw error
      }
      console.error('Registration error:', error)
      throw this.createAuthError(AuthErrorCode.UNKNOWN_ERROR, 'Registration failed')
    }
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    try {
      // Find user by email
      const user = await this.prisma.user.findUnique({
        where: { email: credentials.email },
        include: {
          profiles: true,
          preferences: true
        }
      })

      if (!user) {
        throw this.createAuthError(AuthErrorCode.USER_NOT_FOUND, 'Invalid credentials')
      }

      // Check if account is locked
      if (user.emailVerified === false) {
        throw this.createAuthError(AuthErrorCode.EMAIL_NOT_VERIFIED, 'Please verify your email before logging in')
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
      if (!isPasswordValid) {
        throw this.createAuthError(AuthErrorCode.INVALID_CREDENTIALS, 'Invalid credentials')
      }

      // Generate tokens
      const tokens = this.generateTokens(user.id)

      // Return user without password
      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        profile: user.profiles[0] ? {
          id: user.profiles[0].id,
          userId: user.profiles[0].userId,
          bio: user.profiles[0].bio,
          timezone: user.profiles[0].timezone,
          language: user.profiles[0].language,
          createdAt: user.profiles[0].createdAt.toISOString(),
          updatedAt: user.profiles[0].updatedAt.toISOString()
        } : undefined
      }

      return { user: authUser, tokens }
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        throw error
      }
      console.error('Login error:', error)
      throw this.createAuthError(AuthErrorCode.UNKNOWN_ERROR, 'Login failed')
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<AuthUser | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          profiles: true,
          preferences: true
        }
      })

      if (!user) return null

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        profile: user.profiles[0] ? {
          id: user.profiles[0].id,
          userId: user.profiles[0].userId,
          bio: user.profiles[0].bio,
          timezone: user.profiles[0].timezone,
          language: user.profiles[0].language,
          createdAt: user.profiles[0].createdAt.toISOString(),
          updatedAt: user.profiles[0].updatedAt.toISOString()
        } : undefined
      }
    } catch (error) {
      console.error('Get user error:', error)
      return null
    }
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): { userId: string; iat: number; exp: number } {
    try {
      return jwt.verify(token, this.JWT_SECRET) as { userId: string; iat: number; exp: number }
    } catch (error) {
      throw this.createAuthError(AuthErrorCode.INVALID_TOKEN, 'Invalid or expired token')
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      const decoded = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET) as { userId: string }
      
      // Check if user still exists
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.userId }
      })

      if (!user) {
        throw this.createAuthError(AuthErrorCode.USER_NOT_FOUND, 'User not found')
      }

      // Generate new access token
      const accessToken = jwt.sign(
        { userId: decoded.userId },
        this.JWT_SECRET,
        { expiresIn: this.ACCESS_TOKEN_EXPIRY }
      )

      return {
        accessToken,
        expiresIn: 15 * 60 // 15 minutes in seconds
      }
    } catch (error) {
      throw this.createAuthError(AuthErrorCode.INVALID_TOKEN, 'Invalid refresh token')
    }
  }

  /**
   * Generate JWT tokens
   */
  private generateTokens(userId: string): AuthTokens {
    const accessToken = jwt.sign(
      { userId },
      this.JWT_SECRET,
      { expiresIn: this.ACCESS_TOKEN_EXPIRY }
    )

    const refreshToken = jwt.sign(
      { userId },
      this.JWT_REFRESH_SECRET,
      { expiresIn: this.REFRESH_TOKEN_EXPIRY }
    )

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60 // 15 minutes in seconds
    }
  }

  /**
   * Validate password strength
   */
  private isPasswordStrong(password: string): boolean {
    const minLength = 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
  }

  /**
   * Create authentication error
   */
  private createAuthError(code: AuthErrorCode, message: string): AuthError {
    return { code, message }
  }
} 