import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import { ConflictError, UnauthorizedError, NotFoundError, InternalServerError } from '../utils/errors'
import type { AuthUser, AuthTokens, LoginCredentials, RegisterCredentials } from '~/types/auth'

const ACCESS_TOKEN_EXPIRY = '15m'
const REFRESH_TOKEN_EXPIRY = '7d'
const SALT_ROUNDS = 12

function getSecrets(): { jwtSecret: string; jwtRefreshSecret: string } {
  const jwtSecret = process.env.JWT_SECRET
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET
  if (!jwtSecret || !jwtRefreshSecret) {
    throw new InternalServerError('JWT secrets are not configured')
  }
  return { jwtSecret, jwtRefreshSecret }
}

function generateTokens(userId: string): AuthTokens {
  const { jwtSecret, jwtRefreshSecret } = getSecrets()
  return {
    accessToken: jwt.sign({ userId }, jwtSecret, { expiresIn: ACCESS_TOKEN_EXPIRY }),
    refreshToken: jwt.sign({ userId }, jwtRefreshSecret, { expiresIn: REFRESH_TOKEN_EXPIRY }),
    expiresIn: 15 * 60,
  }
}

function toAuthUser(
  user: {
    id: string
    email: string
    name: string | null
    avatar: string | null
    timezone: string
    emailVerified: boolean
    createdAt: Date
    updatedAt: Date
    preferences: {
      theme: string
      language: string
      notificationsEnabled: boolean
      defaultTimeTechnique: string
    } | null
  },
): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    timezone: user.timezone,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    preferences: user.preferences ?? undefined,
  }
}

const userSelect = {
  id: true,
  email: true,
  name: true,
  avatar: true,
  timezone: true,
  emailVerified: true,
  createdAt: true,
  updatedAt: true,
  preferences: {
    select: {
      theme: true,
      language: true,
      notificationsEnabled: true,
      defaultTimeTechnique: true,
    },
  },
} as const

export class AuthService {
  async register(credentials: RegisterCredentials): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    const existing = await prisma.user.findUnique({ where: { email: credentials.email } })
    if (existing) throw new ConflictError('Email already registered')

    const hashedPassword = await bcrypt.hash(credentials.password, SALT_ROUNDS)

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email: credentials.email,
          name: credentials.name,
          password: hashedPassword,
          emailVerified: true,
          preferences: {
            create: {
              theme: 'light',
              language: 'en',
              notificationsEnabled: true,
            },
          },
        },
        select: userSelect,
      })
      return created
    })

    return { user: toAuthUser(user), tokens: generateTokens(user.id) }
  }

  async login(credentials: LoginCredentials): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
      select: { ...userSelect, password: true },
    })

    if (!user) throw new UnauthorizedError('Invalid credentials')

    const isValid = await bcrypt.compare(credentials.password, user.password)
    if (!isValid) throw new UnauthorizedError('Invalid credentials')

    const { password: _password, ...userWithoutPassword } = user
    return { user: toAuthUser(userWithoutPassword), tokens: generateTokens(user.id) }
  }

  async getUserById(userId: string): Promise<AuthUser | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId, isDeleted: false },
      select: userSelect,
    })
    return user ? toAuthUser(user) : null
  }

  verifyAccessToken(token: string): { userId: string } {
    const { jwtSecret } = getSecrets()
    try {
      return jwt.verify(token, jwtSecret) as { userId: string }
    } catch {
      throw new UnauthorizedError('Invalid or expired token')
    }
  }

  refreshAccessToken(refreshToken: string): { accessToken: string; expiresIn: number } {
    const { jwtRefreshSecret, jwtSecret } = getSecrets()
    try {
      const decoded = jwt.verify(refreshToken, jwtRefreshSecret) as { userId: string }
      const accessToken = jwt.sign({ userId: decoded.userId }, jwtSecret, {
        expiresIn: ACCESS_TOKEN_EXPIRY,
      })
      return { accessToken, expiresIn: 15 * 60 }
    } catch {
      throw new UnauthorizedError('Invalid refresh token')
    }
  }
}

export const authService = new AuthService()
