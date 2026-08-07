/**
 * 🔐 AUTH CONTROLLER - RITMO API 2025
 *
 * Controlador principal de autenticación
 * Maneja todas las operaciones de autenticación básica
 */

import { NextFunction, Request, Response } from 'express'
import { ApiResponses } from '../../../core/utils/apiResponse.js'
import { clearAuthCookies, setAuthCookies } from '../../../core/utils/authCookies.js'
import {
  AccountLockedException,
  AuthenticationException,
} from '../../../shared/exceptions/app.exceptions.js'
import { AuthService } from '../services/AuthService.js'

export class AuthController {
  private readonly authService: AuthService

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
          userAgent: req.body.deviceInfo?.userAgent ?? req.headers['user-agent'] ?? '',
        },
      }

      const result = await this.authService.register(registerData)
      setAuthCookies(res, {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      })
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
          userAgent: req.body.deviceInfo?.userAgent ?? req.headers['user-agent'] ?? '',
        },
      }

      const result = await this.authService.login(loginData)

      setAuthCookies(res, {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
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
        ApiResponses.unauthorized('Refresh token not found').send(res, 401)
        return
      }

      const result = await this.authService.refreshToken(refreshToken, {
        ipAddress: req.ip ?? '::1',
        userAgent: req.headers['user-agent'] ?? '',
      })

      if (!result.success) {
        ApiResponses.unauthorized(result.error ?? 'Token refresh failed').send(res, 401)
        return
      }

      setAuthCookies(res, {
        accessToken: result.newAccessToken!,
        refreshToken: result.newRefreshToken!,
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
      ApiResponses.internalError('Token refresh failed').send(res, 500)
    }
  }

  /**
   * POST /api/auth/logout
   * Cierra sesión del usuario actual
   */
  async logout(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const refreshToken = req.cookies?.refresh_token
    if (refreshToken) {
      try {
        await this.authService.logoutWithRefreshToken(refreshToken)
      } catch (error) {
        console.error('Logout revoke failed:', error)
      }
    }

    clearAuthCookies(res)
    ApiResponses.ok(null, 'Logout successful').send(res)
  }
}
