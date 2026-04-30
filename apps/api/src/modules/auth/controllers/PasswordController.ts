/**
 * 🔑 PASSWORD CONTROLLER - RITMO API 2025
 *
 * Controlador para gestión de contraseñas
 * Maneja reset, cambio y verificación de contraseñas
 */

import { NextFunction, Request, Response } from 'express'
import { ApiResponses } from '../../../core/utils/apiResponse.js'
import { PasswordService } from '../services/PasswordService.js'

export class PasswordController {
  private readonly passwordService: PasswordService

  constructor() {
    this.passwordService = new PasswordService()
  }

  /**
   * POST /api/auth/password-reset-requests
   * Solicita reset de contraseña
   */
  async requestPasswordReset(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await this.passwordService.requestPasswordReset(req.body)
      ApiResponses.ok(null, 'Password reset email sent').send(res)
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /api/auth/password-resets
   * Resetea la contraseña con token
   */
  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.passwordService.resetPassword(req.body)
      ApiResponses.ok(null, 'Password reset successfully').send(res)
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /api/auth/password-changes
   * Cambia la contraseña del usuario autenticado
   */
  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user } = req as any
      if (!user) {
        ApiResponses.unauthorized('User not authenticated').send(res, 401)
        return
      }

      await this.passwordService.changePassword(user.id, req.body)
      ApiResponses.ok(null, 'Password changed successfully').send(res)
    } catch (error) {
      next(error)
    }
  }
}
