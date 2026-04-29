/**
 * 🚀 RITMO JWT UTILS - 2025 BEST PRACTICES
 *
 * Centralized JWT management to ensure consistency across:
 * - Token generation (authService)
 * - Token verification (middleware)
 * - Token refresh (refresh endpoint)
 */

import { secretManager } from '@ritmo/config'
import jwt from 'jsonwebtoken'

export interface JWTPayload {
  userId: string
  sessionId: string
  type: 'access' | 'refresh'
  iat: number
  exp: number
}

/**
 * Get JWT secret for access tokens
 */
export const getJWTAccessSecret = (): string => {
  return secretManager.getJWTSecret()
}

/**
 * Get JWT secret for refresh tokens
 */
export const getJWTRefreshSecret = (): string => {
  return secretManager.getJWTRefreshSecret()
}

/**
 * Generate access token with consistent configuration
 */
export const generateAccessToken = (userId: string, sessionId: string): string => {
  const secret = getJWTAccessSecret()

  return jwt.sign({ userId, sessionId, type: 'access' } as JWTPayload, secret, {
    expiresIn: '15m', // 15 minutes
    issuer: 'ritmo-api',
    audience: 'ritmo-web',
  })
}

/**
 * Verify access token with consistent configuration
 */
export const verifyAccessToken = (token: string): JWTPayload => {
  const secret = getJWTAccessSecret()

  return jwt.verify(token, secret, {
    issuer: 'ritmo-api',
    audience: 'ritmo-web',
  }) as JWTPayload
}

/**
 * Decode token without verification (for debugging)
 */
export const decodeToken = (token: string): any => {
  return jwt.decode(token)
}

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = decodeToken(token)
    if (!decoded?.exp) return true

    const currentTime = Math.floor(Date.now() / 1000)
    return decoded.exp < currentTime
  } catch {
    return true
  }
}

/**
 * Get token expiration time
 */
export const getTokenExpiration = (token: string): Date | null => {
  try {
    const decoded = decodeToken(token)
    if (!decoded?.exp) return null

    return new Date(decoded.exp * 1000)
  } catch {
    return null
  }
}
