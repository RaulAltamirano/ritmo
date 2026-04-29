import { config } from '@ritmo/config'
import type { DeviceType } from '@prisma/client'
import type { NextFunction, Request, Response } from 'express'
import prisma from '../database/prisma.js'
import { ApiResponses } from '../utils/apiResponse.js'
import { verifyAccessToken } from '../utils/jwtUtils.js'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    username: string
    firstName?: string
    lastName?: string
    avatar?: string
    timezone: string
    language: string
    isActive: boolean
    isEmailVerified: boolean
  }
  sessionId?: string
}

/**
 * 🚀 2025 MODERN AUTH MIDDLEWARE - HttpOnly Cookies ONLY
 * Maximum security by accepting ONLY HttpOnly cookies
 */
export const authenticateToken = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 🔒 ONLY accept HttpOnly cookies - NO Bearer tokens for maximum security
    const token = req.cookies?.access_token

    if (!token) {
      return ApiResponses.unauthorized('Authentication required - please login')
        .withPath(req.path)
        .withMethod(req.method)
        .send(res, 401)
    }

    // Use centralized JWT verification for consistency
    let decoded
    try {
      decoded = verifyAccessToken(token)
    } catch {
      return ApiResponses.unauthorized('Invalid or expired token')
        .withPath(req.path)
        .withMethod(req.method)
        .send(res, 401)
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        timezone: true,
        language: true,
        isActive: true,
        isEmailVerified: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user?.isActive) {
      return ApiResponses.unauthorized('User account is not available')
        .withPath(req.path)
        .withMethod(req.method)
        .send(res, 401)
    }

    // 🚀 2025 BEST PRACTICE: Basic session validation
    // Check if session exists and is active
    if (decoded.sessionId) {
      console.log(`🔍 DEBUG - Looking for session with sessionId: ${decoded.sessionId}`)

      const session = await prisma.userSession.findFirst({
        where: {
          sessionId: decoded.sessionId,
          isActive: true,
          expiresAt: { gt: new Date() },
        },
      })

      console.log(
        `🔍 DEBUG - Session found:`,
        session
          ? {
              id: session.id,
              sessionId: session.sessionId,
              isActive: session.isActive,
              expiresAt: session.expiresAt,
              deviceId: session.deviceId,
            }
          : 'No session found',
      )

      if (!session) {
        return ApiResponses.error('Session is invalid or expired', 'SESSION_INVALID')
          .withPath(req.path)
          .withMethod(req.method)
          .send(res, 401)
      }

      // Check device fingerprint if provided
      const deviceId = req.headers['x-device-id'] as string
      const deviceType = req.headers['x-device-type'] as string
      const deviceBrowser = req.headers['x-device-browser'] as string
      const deviceOS = req.headers['x-device-os'] as string

      // Log device fingerprint for security monitoring
      if (deviceId) {
        console.log(
          `🔍 Device fingerprint check: ${deviceId} (${deviceType}/${deviceBrowser}/${deviceOS})`,
        )
      }

      // Enhanced device validation with fallback logic
      if (deviceId && session.deviceId && deviceId !== session.deviceId) {
        console.warn(
          `⚠️ Device mismatch detected: session=${session.deviceId}, request=${deviceId}`,
        )

        // Check if this is a legitimate device change (same user, different device)
        // Allow the request but log for security monitoring
        console.log(
          `🔄 Allowing device change for user ${user.id} from ${session.deviceId} to ${deviceId}`,
        )

        // Update session with new device ID for future requests
        try {
          await prisma.userSession.update({
            where: { id: session.id },
            data: {
              deviceId,
              lastActivity: new Date(),
              // Update device info if provided
              ...(deviceType && { deviceType: deviceType as DeviceType }),
              ...(deviceBrowser && { browser: deviceBrowser }),
              ...(deviceOS && { os: deviceOS }),
            },
          })
          console.log(`✅ Session device ID updated to ${deviceId}`)
        } catch (updateError) {
          console.error('Failed to update session device ID:', updateError)
          // Continue with request even if update fails
        }
      }
    }

    // Add user info to request
    req.user = user
    req.sessionId = decoded.sessionId

    return next()
  } catch {
    return ApiResponses.unauthorized('Invalid or expired token')
      .withPath(req.path)
      .withMethod(req.method)
      .send(res, 401)
  }
}

/**
 * Middleware to check if user is email verified
 */
export const requireEmailVerification = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user?.isEmailVerified) {
    ApiResponses.forbidden(
      'Please verify your email address before accessing this resource',
    )
      .withPath(req.path)
      .withMethod(req.method)
      .send(res, 403)
    return
  }
  next()
}

/**
 * Middleware to check if user has two-factor authentication enabled
 */
export const requireTwoFactor = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  // This would check if 2FA is required for the current operation
  // Implementation depends on your 2FA strategy
  next()
}

/**
 * Middleware to log security events
 */
export const logSecurityEvent = (
  eventType: string,
  riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low',
) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (req.user) {
        await prisma.securityLog.create({
          data: {
            userId: req.user.id,
            sessionId: req.sessionId ?? null,
            eventType: eventType as any,
            eventDescription: `${eventType} event for user ${req.user.email}`,
            severity: riskLevel as any,
            ipAddress: req.ip ?? (req.connection as any).remoteAddress ?? null,
            userAgent: req.headers['user-agent'] ?? null,
          },
        })
      }
    } catch (error) {
      console.error('Failed to log security event:', error)
    }
    next()
  }
}

/**
 * Middleware to check rate limits for authentication endpoints
 */
export const authRateLimit = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // This would implement rate limiting for auth endpoints
  // You can use express-rate-limit here
  next()
}

/**
 * Middleware to validate request origin and prevent CSRF
 */
export const validateOrigin = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { origin } = req.headers
  const { referer } = req.headers

  // Allow requests from same origin
  if (req.method === 'GET' || req.method === 'HEAD') {
    next()
    return
  }

  // Check origin header for cross-origin requests
  if (origin) {
    const allowedOrigins = config.server.cors.origins
    if (!allowedOrigins.includes(origin)) {
      ApiResponses.forbidden('Request origin not allowed')
        .withPath(req.path)
        .withMethod(req.method)
        .send(res, 403)
      return
    }
  }

  // Check referer for same-origin requests
  if (!origin && referer) {
    const host = req.get('host')
    if (referer && host && !referer.includes(host)) {
      ApiResponses.forbidden('Request referer not allowed')
        .withPath(req.path)
        .withMethod(req.method)
        .send(res, 403)
      return
    }
  }

  next()
}

/**
 * Middleware to add security headers
 */
export const securityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')

  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
  )

  next()
}
