/**
 * 🔐 AUTH CONTROLLER - RITMO API 2025
 *
 * Controlador principal de autenticación
 * Maneja todas las operaciones de autenticación básica
 */

import { NextFunction, Request, Response } from 'express'
import { ApiResponses } from '../../../core/utils/apiResponse.js'
import {
  AccountLockedException,
  AuthenticationException,
} from '../../../shared/exceptions/app.exceptions.js'
import { AuthService } from '../services/AuthService.js'

export class AuthController {
  private authService: AuthService

  constructor() {
    this.authService = new AuthService()
  }

  /**
   * POST /api/auth/register
   * Registra un nuevo usuario
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Extract userAgent from headers and add to request body
      const registerData = {
        ...req.body,
        deviceInfo: {
          ...req.body.deviceInfo,
          userAgent: req.body.deviceInfo?.userAgent || req.headers['user-agent'] || '',
        },
      }

      const result = await this.authService.register(registerData)
      ApiResponses.created(result, 'User registered successfully').send(res)
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /api/auth/login
   * Autentica un usuario existente
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Extract userAgent from headers and add to request body
      const loginData = {
        ...req.body,
        deviceInfo: {
          ...req.body.deviceInfo,
          userAgent: req.body.deviceInfo?.userAgent || req.headers['user-agent'] || '',
        },
      }

      const result = await this.authService.login(loginData)

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

      ApiResponses.ok(result, 'Login successful').send(res)
    } catch (error) {
      if (error instanceof AuthenticationException) {
        ApiResponses.unauthorized('Invalid credentials').send(res, 401)
      } else if (error instanceof AccountLockedException) {
        ApiResponses.error(error.message, 'ACCOUNT_LOCKED').send(res, 423)
      } else {
        next(error)
      }
    }
  }

  /**
   * POST /api/auth/refresh
   * Renueva tokens de acceso
   */
  async refresh(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies.refresh_token
      if (!refreshToken) {
        ApiResponses.unauthorized('Refresh token not found').send(res)
        return
      }

      const result = await this.authService.refreshToken(refreshToken, {
        ipAddress: req.ip || '::1',
        userAgent: req.headers['user-agent'] || '',
      })

      if (!result.success) {
        ApiResponses.unauthorized(result.error || 'Token refresh failed').send(res)
        return
      }

      // Set HttpOnly cookies for security
      res.cookie('access_token', result.newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 5 * 60 * 1000, // 5 minutes
      })

      res.cookie('refresh_token', result.newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      })

      ApiResponses.ok(
        {
          message: 'Token refreshed successfully',
          accessToken: result.newAccessToken,
          refreshToken: result.newRefreshToken,
        },
        'Token refreshed successfully',
      ).send(res)
    } catch (error) {
      console.error('Refresh error:', error)
      ApiResponses.error('Token refresh failed', 'TOKEN_REFRESH_ERROR').send(res)
    }
  }

  /**
   * POST /api/auth/logout
   * Cierra sesión del usuario actual
   */
  async logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Clear cookies
      res.clearCookie('access_token')
      res.clearCookie('refresh_token')

      ApiResponses.ok(null, 'Logout successful').send(res)
    } catch (error) {
      next(error)
    }
  }
}
